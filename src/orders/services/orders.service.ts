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
import { MailService } from 'src/mail/mail.service';
import { InventoryService } from 'src/products/services/inventory.service';
import { WhatsAppService } from 'src/whatsapp/whatsapp.service';

import { AddOrderItemDTO } from '../dtos/admin/add-order-item.dto';
import { AdminSearchOrdersDTO } from '../dtos/admin/admin-search-orders.dto';
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
import { OrderHistoryStatus, OrderHistoryType, OrderOptions, OrderStatus } from '../types';

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
    private readonly whatsappService: WhatsAppService,
    private readonly localeContextService: LocaleContextService,
    private readonly inventoryService: InventoryService,
  ) {}

  search(params: AdminSearchOrdersDTO = {}, userId?: number) {
    const { q, status, paymentStatus, paymentMethod, sort = 'created-descending' } = params;
    const trimmedQ = q?.trim();

    const qb = this.ordersRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.history', 'history');

    if (userId) qb.andWhere('user.id = :userId', { userId });

    if (trimmedQ)
      qb.andWhere('(order.orderNumber ILIKE :q OR order.trackingNumber ILIKE :q OR user.name ILIKE :q)', {
        q: `%${trimmedQ}%`,
      });

    if (status) qb.andWhere('order.status = :status', { status });

    if (paymentStatus) qb.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus });

    if (paymentMethod) qb.andWhere('order.paymentMethod = :paymentMethod', { paymentMethod });

    switch (sort) {
      case 'created-ascending':
        qb.orderBy('order.createdAt', 'ASC');
        break;

      case 'total-ascending':
        qb.orderBy('order.total', 'ASC', 'NULLS LAST');
        break;

      case 'total-descending':
        qb.orderBy('order.total', 'DESC', 'NULLS LAST');
        break;

      case 'created-descending':
      default:
        qb.orderBy('order.createdAt', 'DESC');
        break;
    }

    qb.addOrderBy('order.id', 'DESC').addOrderBy('history.createdAt', 'ASC');

    return qb.getMany();
  }

  async getOne(orderNumber: string, userId?: number) {
    const order = await this.getOneOrFail(this.ordersRepo.manager, { orderNumber, userId }, true);

    return this.serializeOrder(order);
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

  updateStatus(options: OrderOptions, status: OrderStatus, sendMail: boolean = true, manager?: EntityManager) {
    return withOptionalManager(manager, this.ordersRepo.manager, async (manager) => {
      return await this.updateOrder(
        options,
        async (order, manager) => {
          assertValidOrderTransition(order.status, status);
          assertStatusGuards(order, status);

          order.status = status;
          await this.appendHistory(order, { type: 'status', status }, manager);
          await this.statusHandlers[status]?.(order, manager);

          await withEnvironment(
            async (isValid) => {
              if (!isValid || !sendMail) return;

              await this.mailService.sendTypedMail(
                order.user.email,
                'order_status_update',
                this.mapToDTO(order, this.localeContextService.locale),
                this.localeContextService.locale,
              );
            },
            ['production'],
          );
        },
        manager,
      );
    });
  }

  handleWhatsAppStatusUpdate(whatsappMessageId: string, isConfirmed: boolean) {
    return this.ordersRepo.manager.transaction(async (manager) => {
      const order = await this.getOneOrFail(manager, { whatsappMessageId }, true);

      if (order.status !== 'pending') throw NotFoundException('orders.notFound');

      const status = isConfirmed ? 'confirmed' : 'cancelled';

      return await this.updateStatus({ whatsappMessageId }, status, true, manager);
    });
  }

  updatePaymentStatus(orderNumber: string, body: UpdateOrderPaymentDTO) {
    return this.updateOrder({ orderNumber }, async (order, manager) => {
      assertValidPaymentTransition(order.paymentStatus, body.paymentStatus);
      assertPaymentStatusGuards(order, body.paymentStatus);
      order.paymentStatus = body.paymentStatus;

      await this.appendHistory(order, { type: 'payment_status', status: body.paymentStatus }, manager);
    });
  }

  updateShipping(orderNumber: string, body: UpdateOrderShippingDTO) {
    return this.updateOrder({ orderNumber }, (order) => {
      if (nonUpdatableShippingStatuses.includes(order.status))
        throw BadRequestException('orders.shippingDetailsNotUpdatable');

      if (body.trackingNumber !== undefined) order.trackingNumber = body.trackingNumber;
    });
  }

  restockReturnedOrder(orderNumber: string) {
    return this.ordersRepo.manager.transaction(async (manager) => {
      const order = await this.getOneOrFail(manager, { orderNumber }, true);

      if (order.status !== 'returned') throw BadRequestException('orders.restockOnlyReturned');
      if (order.restocked) throw BadRequestException('orders.alreadyRestocked');

      await withOptionalManager(manager, this.ordersRepo.manager, (manager) =>
        Promise.all(
          order.items.map(({ variantExternalId, quantity }) =>
            this.inventoryService.restoreStock(variantExternalId, quantity, manager),
          ),
        ),
      );

      await manager.getRepository(Order).update(order.id, { restocked: true });

      const updatedOrder = await this.getOneOrFail(manager, { orderNumber }, true);

      return this.serializeOrder(updatedOrder);
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
    await this.appendHistory(order, { type: 'status', status: order.status }, manager);

    const diff = await this.orderItemsService.add(order, body.variants, manager);
    order.subtotal = this.toNumber(order.subtotal) + diff;
    await this.recalculateAndSaveTotals(order, manager);

    if (clearCartAfterCreate) await this.cartService.sync(userId, [], manager);

    const updatedOrder = await this.getOneOrFail(manager, { orderNumber: order.orderNumber, userId }, true);

    await this.statusHandlers.pending(updatedOrder, manager);

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
    order.total = this.toNumber(order.subtotal) + shippingFee;

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

    order.subtotal = this.toNumber(order.subtotal) + diff;
    await this.recalculateAndSaveTotals(order, manager);

    const updatedOrder = await this.getOneOrFail(manager, options, true);

    return this.serializeOrder(updatedOrder);
  }

  private updateOrder(
    options: OrderOptions,
    mutate: (order: Order, manager: EntityManager) => void | Promise<void>,
    manager?: EntityManager,
  ) {
    return withOptionalManager(manager, this.ordersRepo.manager, async (manager) => {
      const order = await this.getOneOrFail(manager, options, true);
      await mutate(order, manager);

      const repo = manager.getRepository(Order);

      await repo.save({
        id: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        trackingNumber: order.trackingNumber,
      });

      const updatedOrder = await this.getOneOrFail(manager, options, true);

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
      order: includeRelations ? { items: { productTitle: 'ASC' }, history: { createdAt: 'ASC' } } : undefined,
    });

    if (!order) throw NotFoundException('orders.notFound');

    return order;
  }

  private toNumber(val: number | string): number {
    return typeof val === 'string' ? parseFloat(val) : val;
  }

  private async appendHistory(
    order: Order,
    entry: { type: OrderHistoryType; status?: OrderHistoryStatus },
    manager: EntityManager,
  ) {
    const historyRepo = manager.getRepository(OrderStatusHistory);

    const historyEntry = historyRepo.create({ order: { id: order.id }, type: entry.type, status: entry.status });

    await historyRepo.save(historyEntry);

    if (Array.isArray(order.history)) order.history.push(historyEntry);
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
    pending: async (order, manager) => {
      await withEnvironment(
        async (isValid) => {
          if (!isValid) return;

          return await Promise.all([
            this.whatsappService
              .sendTypedMessage(
                order.shippingAddress.phoneNumber,
                'order_confirmation',
                this.mapToDTO(order, this.localeContextService.locale),
              )
              .then((res) => manager.getRepository(Order).update(order.id, { whatsappMessageId: res.messages[0].id })),
            this.mailService.sendTypedMail(
              order.user.email,
              'order_confirmation',
              this.mapToDTO(order, this.localeContextService.locale),
            ),
          ]);
        },
        ['production'],
      );
    },
    confirmed: async (order) => {
      const unitPrice = order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

      const delivery = await withEnvironment(
        async (isValid) => {
          if (!isValid) return { trackingNumber: null };

          return await this.bostaService.createDelivery({
            ...order.shippingAddress,
            ...order,
            unitPrice,
            cod: order.total,
            note: order.note ?? undefined,
          });
        },
        ['production'],
      );

      order.trackingNumber = delivery.trackingNumber;
    },
    cancelled: async (order, manager) => {
      await Promise.all(
        order.items.map(({ variantExternalId, quantity }) =>
          this.inventoryService.restoreStock(variantExternalId, quantity, manager),
        ),
      );
    },
  } as const satisfies Partial<Record<OrderStatus, (order: Order, manager: EntityManager) => void | Promise<void>>>;

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
        await Promise.allSettled(
          batch.map(async ({ orderNumber }) => {
            await this.updateStatus({ orderNumber }, 'cancelled', false);

            await this.mailService.sendTypedMail(
              orderNumber,
              'order_auto_cancellation',
              this.mapToDTO(
                await this.getOneOrFail(this.ordersRepo.manager, { orderNumber }, true),
                this.localeContextService.locale,
              ),
              this.localeContextService.locale,
            );
          }),
        );
      }
    } catch (error) {
      this.logger.error('Failed to cancel stale pending orders', error instanceof Error ? error.stack : String(error));
    }
  }
}
