import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { EntityManager, LessThan, Repository } from 'typeorm';

import { AddressesService } from 'src/addresses/addresses.service';
import { BostaService } from 'src/addresses/bosta/bosta.service';
import { CartService } from 'src/cart/cart.service';
import { BadRequestException, NotFoundException } from 'src/common/exceptions';
import { withEnvironment } from 'src/common/with-environment';
import { withOptionalManager } from 'src/common/with-optional-manager';
import { LocaleContextService } from 'src/i18n/locale-context.service';
import { Locale } from 'src/i18n/types';
import { getEmail } from 'src/mail/helpers';
import { MailService } from 'src/mail/mail.service';
import { InventoryService } from 'src/products/services/inventory.service';

import { AddOrderItemDTO } from '../dtos/admin/add-order-item.dto';
import { CreateOrderDTO } from '../dtos/admin/create-order.dto';
import { UpdateOrderPaymentDTO } from '../dtos/admin/update-order-payment.dto';
import { UpdateOrderShippingDTO } from '../dtos/admin/update-order-shipping.dto';
import { UpdateOrderItemDTO } from '../dtos/admin/update-order.dto';
import { CheckoutOrderDTO } from '../dtos/user/checkout-order.dto';
import { OrderDTO } from '../dtos/user/order.dto';
import { OrderStatusHistory } from '../entities/order-status-history.entity';
import { Order } from '../entities/order.entity';
import {
  assertValidOrderTransition,
  assertStatusGuards,
  assertValidPaymentTransition,
  assertPaymentStatusGuards,
  getAllowedStatuses,
  getAllowedPaymentStatuses,
} from '../helpers';
import { nonUpdatableShippingStatuses, editableStatuses } from '../statuses';
import { OrderOptions, OrderStatus } from '../types';

import { OrderItemsService } from './order-items.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order) private readonly ordersRepo: Repository<Order>,
    private readonly cartService: CartService,
    private readonly addressService: AddressesService,
    private readonly bostaService: BostaService,
    private readonly orderItemsService: OrderItemsService,
    private readonly mailService: MailService,
    private readonly LocaleContextService: LocaleContextService,
    private readonly inventoryService: InventoryService,
  ) {}

  getAll(userId?: number) {
    return this.ordersRepo.find({
      where: userId ? { user: { id: userId } } : undefined,
      relations: { items: true, user: !!userId, history: true },
      order: { createdAt: 'DESC', history: { createdAt: 'ASC' } },
    });
  }

  getOne(orderNumber: string, userId?: number) {
    return this.getOneOrFail(this.ordersRepo.manager, { orderNumber, userId }, true);
  }

  checkout(userId: number, body: CheckoutOrderDTO) {
    return this.ordersRepo.manager.transaction(async (manager) => {
      const cart = await this.cartService.getOrCreateCart(userId, manager);
      if (!cart.items.length) throw BadRequestException('orders.cartEmpty');

      const variants = cart.items.map(({ variant, quantity }) => ({ externalId: variant.externalId, quantity }));
      return this.createOrderInternal({ userId, ...body, variants }, manager, true);
    });
  }

  create(body: CreateOrderDTO) {
    return this.ordersRepo.manager.transaction(async (manager) => {
      const order = await this.createOrderInternal(body, manager);

      return this.serializeOrder(order);
    });
  }

  addItems(orderNumber: string, item: AddOrderItemDTO) {
    return this.ordersRepo.manager.transaction((manager) =>
      this.mutateItems({ orderNumber }, manager, (order, manager) =>
        this.orderItemsService.add(order, [item], manager),
      ),
    );
  }

  updateOrderItem(orderNumber: string, itemId: number, body: UpdateOrderItemDTO) {
    return this.ordersRepo.manager.transaction((manager) =>
      this.mutateItems({ orderNumber }, manager, (order, manager) =>
        this.orderItemsService.update(order, itemId, body, manager),
      ),
    );
  }

  removeOrderItem(orderNumber: string, itemId: number) {
    return this.ordersRepo.manager.transaction((manager) =>
      this.mutateItems({ orderNumber }, manager, (order, manager) =>
        this.orderItemsService.remove(order, itemId, manager),
      ),
    );
  }

  updateStatus(options: OrderOptions, status: OrderStatus) {
    return this.updateOrder(options, async (order, manager) => {
      assertValidOrderTransition(order.status, status);
      assertStatusGuards(order, status);

      order.status = status;
      await this.appendHistory(order, status, manager);
      await this.statusHandlers[status]?.(order, manager);
    });
  }

  updatePaymentStatus(orderNumber: string, body: UpdateOrderPaymentDTO) {
    return this.updateOrder({ orderNumber }, (order) => {
      assertValidPaymentTransition(order.paymentStatus, body.paymentStatus);
      assertPaymentStatusGuards(order, body.paymentStatus);
      order.paymentStatus = body.paymentStatus;
    });
  }

  updateShipping(orderNumber: string, body: UpdateOrderShippingDTO) {
    return this.updateOrder({ orderNumber }, (order) => {
      if (nonUpdatableShippingStatuses.includes(order.status))
        throw BadRequestException('orders.shippingDetailsNotUpdatable');

      if (body.trackingNumber !== undefined) order.trackingNumber = body.trackingNumber;
    });
  }

  private async createOrderInternal(
    { userId, ...body }: CreateOrderDTO,
    manager: EntityManager,
    clearCartAfterCreate: boolean = false,
  ) {
    if (!body.variants.length) throw BadRequestException('orders.mustIncludeAtLeastOneItem');

    const orderRepo = manager.getRepository(Order);

    const address = await this.addressService.getOneOrFail(body.addressId, userId, manager);

    const order = orderRepo.create({
      user: { id: userId },
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod: body.paymentMethod,
      note: body.note ?? null,
      canOpenPackage: body.canOpenPackage ?? false,
      subtotal: 0,
      shippingFee: 0,
      total: 0,
      shippingAddress: address,
    });

    await orderRepo.save(order);
    await this.appendHistory(order, order.status, manager);

    const diff = await this.orderItemsService.add(order, body.variants, manager);
    order.subtotal += diff;
    await this.recalculateAndSaveTotals(order, manager);

    if (clearCartAfterCreate) await this.cartService.sync(userId, [], manager);

    const updatedOrder = await this.getOneOrFail(manager, { orderNumber: order.orderNumber, userId }, true);

    await this.statusHandlers.pending(updatedOrder);

    return updatedOrder;
  }

  private async recalculateAndSaveTotals(order: Order, manager: EntityManager) {
    const shippingFee = await this.bostaService.calculateShippingFees(
      order.subtotal,
      order.shippingAddress.cityDropOff,
      order.paymentMethod === 'cod',
      order.canOpenPackage,
    );

    order.shippingFee = shippingFee;
    order.total = order.subtotal + shippingFee;

    await manager.getRepository(Order).update(order.id, {
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.total,
    });

    return order;
  }

  private async mutateItems(
    options: OrderOptions,
    manager: EntityManager,
    mutate: (order: Order, manager: EntityManager) => Promise<number>,
  ) {
    const order = await this.getOneOrFail(manager, options, true);

    if (!editableStatuses.includes(order.status)) throw BadRequestException('orders.notEditableInCurrentStatus');

    const diff = await mutate(order, manager);

    order.subtotal += diff;
    await this.recalculateAndSaveTotals(order, manager);

    const updatedOrder = await this.getOneOrFail(manager, options, true);

    return this.serializeOrder(updatedOrder);
  }

  private updateOrder(options: OrderOptions, mutate: (order: Order, manager: EntityManager) => void | Promise<void>) {
    return this.ordersRepo.manager.transaction(async (manager) => {
      const order = await this.getOneOrFail(manager, options, true);
      await mutate(order, manager);

      const repo = manager.getRepository(Order);

      const updatedOrder = await repo.save({
        id: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        trackingNumber: order.trackingNumber,
      });

      return this.serializeOrder(updatedOrder);
    });
  }

  private async getOneOrFail(manager: EntityManager, options: OrderOptions, includeRelations = false) {
    const { userId, ...identifier } = options;

    const order = await manager.getRepository(Order).findOne({
      where: {
        ...identifier,
        ...(userId ? { user: { id: userId } } : {}),
      },
      relations: includeRelations ? { items: true, user: true, history: true } : undefined,
      order: includeRelations ? { history: { createdAt: 'ASC' } } : undefined,
    });

    if (!order) throw NotFoundException('orders.notFound');

    return order;
  }

  private async appendHistory(order: Order, status: OrderStatus, manager: EntityManager) {
    const historyRepo = manager.getRepository(OrderStatusHistory);

    const entry = historyRepo.create({ order: { id: order.id }, status });

    await historyRepo.save(entry);

    if (Array.isArray(order.history)) order.history.push(entry);
  }

  private serializeOrder(order: Order) {
    return {
      ...order,
      allowedActions: {
        statuses: getAllowedStatuses(order),
        paymentStatuses: getAllowedPaymentStatuses(order),
      },
    };
  }

  private mapToDTO(order: Order, locale: Locale): OrderDTO {
    return plainToInstance(OrderDTO, this.serializeOrder(order), {
      excludeExtraneousValues: true,
      context: { locale, userId: order.user.id },
    });
  }

  private readonly statusHandlers = {
    pending: async (order) => {
      await withEnvironment(
        async (isValid) => {
          if (!isValid) return;

          await this.mailService.sendTypedMail(
            order.user.email,
            'order_confirmation',
            this.mapToDTO(order, this.LocaleContextService.locale),
          );
        },
        ['production'],
      );
    },
    confirmed: async (order) => {
      const unitPrice = order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

      const delivery = await withEnvironment(
        async (isValid) => {
          if (!isValid) return { trackingNumber: null };

          const [delivery] = await Promise.all([
            this.bostaService.createDelivery({
              ...order.shippingAddress,
              ...order,
              unitPrice,
              cod: order.total,
              note: order.note ?? undefined,
            }),
            this.mailService.sendTypedMail(getEmail('admin'), 'order_reminder', this.mapToDTO(order, 'en'), 'en'),
          ]);

          return delivery;
        },
        ['production'],
      );

      order.trackingNumber = delivery.trackingNumber;
    },
    delivered: async (order) => {
      if (order.paymentStatus === 'paid') await this.updateStatus({ orderNumber: order.orderNumber }, 'completed');
    },
    cancelled: async (order, manager) => {
      await withOptionalManager(manager, this.ordersRepo.manager, (manager) =>
        Promise.all(
          order.items.map(({ variantExternalId, quantity }) =>
            this.inventoryService.restoreStock(variantExternalId, quantity, manager),
          ),
        ),
      );

      await withEnvironment(
        async (isValid) => {
          if (!isValid) return;

          await this.mailService.sendTypedMail(
            order.user.email,
            'order_cancellation',
            this.mapToDTO(order, this.LocaleContextService.locale),
          );
        },
        ['production'],
      );
    },
  } as const satisfies Partial<Record<OrderStatus, (order: Order, manager?: EntityManager) => void | Promise<void>>>;

  private static readonly CANCEL_STALE_ORDERS_BATCH_SIZE = 10;
  @Cron(CronExpression.EVERY_HOUR, { waitForCompletion: true })
  async cancelStalePendingOrders() {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

    try {
      const staleOrders = await this.ordersRepo.find({
        select: { orderNumber: true },
        where: { status: 'pending', createdAt: LessThan(cutoff) },
      });
      if (!staleOrders.length) return;

      for (let i = 0; i < staleOrders.length; i += OrdersService.CANCEL_STALE_ORDERS_BATCH_SIZE) {
        const batch = staleOrders.slice(i, i + OrdersService.CANCEL_STALE_ORDERS_BATCH_SIZE);
        await Promise.allSettled(batch.map(({ orderNumber }) => this.updateStatus({ orderNumber }, 'cancelled')));
      }
    } catch (error) {
      this.logger.error('Failed to cancel stale pending orders', error instanceof Error ? error.stack : String(error));
    }
  }
}
