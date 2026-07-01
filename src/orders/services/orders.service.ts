import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { EntityManager, LessThan, Repository } from 'typeorm';

import { AddressesService } from 'src/addresses/addresses.service';
import { BostaService } from 'src/addresses/bosta/bosta.service';
import { bostaPaymentMethods } from 'src/addresses/bosta/const';
import { BostaPaymentMethod } from 'src/addresses/bosta/types';
import { CartService } from 'src/cart/cart.service';
import { BadRequestException, NotFoundException } from 'src/common/exceptions';
import { withEnvironment } from 'src/common/with-environment';
import { withOptionalManager } from 'src/common/with-optional-manager';
import { DiscountsService } from 'src/discounts/discounts.service';
import { DiscountableItem } from 'src/discounts/types';
import { defaultLocale } from 'src/i18n/const';
import { translateWithoutLocale } from 'src/i18n/helpers';
import { Locale } from 'src/i18n/types';
import { MailService } from 'src/mail/mail.service';
import { InventoryService } from 'src/products/services/inventory.service';
import { whatsappBusinessPhoneNumber } from 'src/whatsapp/const';
import { WhatsAppService } from 'src/whatsapp/whatsapp.service';

import { AddOrderItemDTO } from '../dtos/admin/add-order-item.dto';
import { AdminSearchOrdersDTO } from '../dtos/admin/admin-search-orders.dto';
import { CreateOrderDTO } from '../dtos/admin/create-order.dto';
import { UpdateOrderPaymentDTO } from '../dtos/admin/update-order-payment.dto';
import { UpdateOrderShippingDTO } from '../dtos/admin/update-order-shipping.dto';
import { UpdateOrderItemDTO } from '../dtos/admin/update-order.dto';
import { CheckoutOrderDTO } from '../dtos/user/checkout-order.dto';
import { OrderDTO } from '../dtos/user/order.dto';
import { ItemSnapshot } from '../entities/item-snapshot.entity';
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
    private readonly inventoryService: InventoryService,
    private readonly discountsService: DiscountsService,
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

      return this.createOrderInternal(
        { userId, ...body, variants },
        manager,
        true,
        cart.items.map(({ variant, quantity }) => ({ variant, quantity })),
      );
    });
  }

  create(body: CreateOrderDTO) {
    return this.ordersRepo.manager.transaction(async (manager) => {
      const variants = await this.inventoryService.getManyByExternalIds(
        body.variants.map((v) => v.externalId),
        manager,
      );

      const variantsByExternalId = new Map(variants.map((v) => [v.externalId, v]));

      const order = await this.createOrderInternal(
        body,
        manager,
        false,
        body.variants.map(({ externalId, quantity }) => ({
          variant: variantsByExternalId.get(externalId)!,
          quantity,
        })),
      );

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
    return withOptionalManager(
      manager,
      this.ordersRepo.manager,
      async (manager) =>
        await this.updateOrder(
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
                  this.mapToDTO(order, order.user.locale),
                  order.user.locale,
                );
              },
              ['production'],
            );
          },
          manager,
        ),
    );
  }

  handleWhatsAppStatusUpdate(whatsappMessageId: string, isConfirmed: boolean) {
    const t = translateWithoutLocale('ar');

    const status = isConfirmed ? 'confirmed' : 'cancelled';

    return this.ordersRepo.manager.transaction(async (manager) => {
      const order = await this.getOneOrFail(manager, { whatsappMessageId }, true);

      if (order.status !== 'pending') return t('whatsapp.replies.alreadyActioned');

      await this.updateStatus({ whatsappMessageId }, status, true, manager);
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
    discountableItems: DiscountableItem[] = [],
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
      discountCode: null,
      discountAmount: null,
      isFreeShipping: false,
      total: 0,
      shippingAddress: address,
    });

    await orderRepo.save(order);
    await this.appendHistory(order, { type: 'status', status: order.status }, manager);

    const diff = await this.orderItemsService.add(order, body.variants, manager);
    order.subtotal = this.toNumber(order.subtotal) + diff;
    order.total = this.toNumber(order.subtotal);

    const discountResult = await this.discountsService.resolveDiscount(
      body.discountCode ?? null,
      userId,
      discountableItems,
      this.toNumber(order.subtotal),
      manager,
    );

    const isFreeShipping = discountResult?.discountAmount === null;
    order.isFreeShipping = isFreeShipping;

    await this.recalculateAndSaveTotals(order, manager);

    if (discountResult) {
      order.discountCode = discountResult.discount.code;
      order.discountAmount = discountResult.discountAmount;

      if (!isFreeShipping) {
        order.total = Math.max(0, this.toNumber(order.total) - discountResult.discountAmount!);

        await orderRepo.update(order.id, {
          discountCode: order.discountCode,
          discountAmount: order.discountAmount,
          total: order.total,
        });
      } else
        await orderRepo.update(order.id, {
          discountCode: order.discountCode,
          discountAmount: order.discountAmount,
          isFreeShipping: order.isFreeShipping,
        });

      await this.discountsService.recordUsage(discountResult.discount, userId, order, discountResult, manager);
    }

    if (clearCartAfterCreate) await this.cartService.sync(userId, [], manager);

    const updatedOrder = await this.getOneOrFail(manager, { orderNumber: order.orderNumber, userId }, true);

    await this.statusHandlers.pending(updatedOrder, manager);

    return updatedOrder;
  }

  private async recalculateAndSaveTotals(order: Order, manager: EntityManager) {
    const { shippingFee, codFee, openingFee } = await this.bostaService.getShippingFees({
      cod: String(order.subtotal),
      dropOffCity: order.shippingAddress.cityDropOff,
    });

    order.shippingFee = shippingFee;
    if (order.paymentMethod === 'cod') order.codFee = codFee;
    if (order.canOpenPackage) order.openPackageFee = openingFee;

    order.total =
      this.toNumber(order.subtotal) +
      (order.isFreeShipping ? 0 : shippingFee) +
      (order.codFee ?? 0) +
      (order.openPackageFee ?? 0);

    await manager.getRepository(Order).update(order.id, {
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      codFee: order.codFee,
      openPackageFee: order.openPackageFee,
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

    if (order.trackingNumber) {
      const itemSnapshotRepo = manager.getRepository(ItemSnapshot);

      const freshItems = await itemSnapshotRepo.findBy({ order: { id: order.id } });
      const unitPrice = freshItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
      const isBostaPayment = bostaPaymentMethods.includes(order.paymentMethod as BostaPaymentMethod);

      await withEnvironment(
        async (isValid) => {
          if (!isValid) return;

          await this.bostaService.updateDelivery(order.trackingNumber!, {
            unitPrice,
            ...(isBostaPayment ? { cod: this.toNumber(order.total) } : {}),
          });
        },
        ['production'],
      );
    }

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

  mapToDTO(order: Order, locale: Locale): OrderDTO {
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
              .sendTypedMessage(order.shippingAddress.phoneNumber, 'order_confirmation', this.mapToDTO(order, 'ar'))
              .then((res) => manager.getRepository(Order).update(order.id, { whatsappMessageId: res.messages[0].id })),
            this.mailService.sendTypedMail(
              order.user.email,
              'order_confirmation',
              this.mapToDTO(order, order.user.locale),
              order.user.locale,
            ),
          ]);
        },
        ['production'],
      );
    },
    confirmed: async (order) => {
      const unitPrice = order.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
      const isBostaPayment = bostaPaymentMethods.includes(order.paymentMethod as BostaPaymentMethod);

      const [delivery] = await Promise.allSettled([
        withEnvironment(
          async (isValid) => {
            if (!isValid) return { trackingNumber: null };

            return await this.bostaService.createDelivery({
              ...order.shippingAddress,
              ...order,
              unitPrice,
              cod: isBostaPayment ? this.toNumber(order.total) : 0,
              note: order.note ?? undefined,
            });
          },
          ['production'],
        ),
        withEnvironment(
          async (isValid) => {
            if (!isValid) return;

            await this.whatsappService.sendTypedMessage(
              whatsappBusinessPhoneNumber,
              'admin_notification',
              this.mapToDTO(order, defaultLocale),
            );
          },
          ['production'],
        ),
      ]);

      if (delivery.status === 'fulfilled') order.trackingNumber = delivery.value.trackingNumber;
    },
    completed: async (order) => {
      await withEnvironment(
        async (isValid) => {
          if (!isValid) return;

          await this.whatsappService.sendTypedMessage(
            order.shippingAddress.phoneNumber,
            'page_review',
            this.mapToDTO(order, order.user.locale),
          );
        },
        ['production', 'local'],
      );
    },
    cancelled: async (order, manager) => {
      if (order.trackingNumber) {
        await withEnvironment(
          async (isValid) => {
            if (!isValid) return;

            await this.bostaService.cancelDelivery(order.trackingNumber!);
          },
          ['production'],
        );

        order.trackingNumber = null;
      }

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

            const order = await this.getOneOrFail(this.ordersRepo.manager, { orderNumber }, true);

            await this.mailService.sendTypedMail(
              order.user.email,
              'order_auto_cancellation',
              this.mapToDTO(order, order.user.locale),
              order.user.locale,
            );
          }),
        );
      }
    } catch (error) {
      this.logger.error('Failed to cancel stale pending orders', error instanceof Error ? error.stack : String(error));
    }
  }
}
