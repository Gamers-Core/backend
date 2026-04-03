import { plainToInstance } from 'class-transformer';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { withEnvironment, withOptionalManager, BadRequestException, NotFoundException } from 'src/common';
import { Locale, LocaleContextService } from 'src/i18n';
import { CartService } from 'src/cart';
import { BostaService } from 'src/bosta';
import { getEmail, MailService } from 'src/mail';
import { Order, type OrderStatus } from 'src/entity';
import { AddressesService } from 'src/addresses/addresses.service';

import { editableStatuses, nonUpdatableShippingStatuses } from './statuses';
import { OrderItemsService } from './order-items.service';
import { CheckoutOrderDTO, OrderDTO } from './dtos/user';
import {
  AddOrderItemDTO,
  CreateOrderDTO,
  UpdateOrderItemDTO,
  UpdateOrderPaymentDTO,
  UpdateOrderShippingDTO,
} from './dtos/admin';
import {
  assertPaymentStatusGuards,
  assertStatusGuards,
  assertValidOrderTransition,
  assertValidPaymentTransition,
  getAllowedPaymentStatuses,
  getAllowedStatuses,
} from './helpers';
import { OrderOptions } from './types';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly ordersRepo: Repository<Order>,
    private readonly cartService: CartService,
    private readonly addressService: AddressesService,
    @Inject(forwardRef(() => BostaService))
    private readonly bostaService: BostaService,
    private readonly orderItemsService: OrderItemsService,
    private readonly mailService: MailService,
    private readonly LocaleContextService: LocaleContextService,
  ) {}

  getOrders(userId?: number) {
    return this.ordersRepo.find({
      where: userId ? { user: { id: userId } } : undefined,
      relations: { items: true, user: true },
      order: { createdAt: 'DESC' },
    });
  }

  getOrder(orderNumber: string, userId?: number) {
    return this.getOrderOrFail(this.ordersRepo.manager, { orderNumber, userId }, true);
  }

  async checkout(userId: number, body: CheckoutOrderDTO) {
    return this.ordersRepo.manager.transaction(async (manager) => {
      const cart = await this.cartService.getCart(userId, manager);
      if (!cart.items.length) throw new BadRequestException('orders.cartEmpty');

      const variants = cart.items.map(({ variant, quantity }) => ({ externalId: variant.externalId, quantity }));
      return this.createOrderInternal({ userId, ...body, variants }, manager, true);
    });
  }

  createOrder(body: CreateOrderDTO) {
    return this.ordersRepo.manager.transaction(async (manager) => {
      const order = await this.createOrderInternal(body, manager);

      return this.serializeOrder(order);
    });
  }

  addItems(orderNumber: string, item: AddOrderItemDTO, manager?: EntityManager) {
    return this.runWithManager(manager)((manager) =>
      this.mutateItems({ orderNumber }, manager, (order, manager) =>
        this.orderItemsService.addItems(order, [item], manager),
      ),
    );
  }

  updateOrderItem(orderNumber: string, itemId: number, body: UpdateOrderItemDTO) {
    return this.ordersRepo.manager.transaction((manager) =>
      this.mutateItems({ orderNumber }, manager, (order, manager) =>
        this.orderItemsService.updateItem(order, itemId, body, manager),
      ),
    );
  }

  deleteOrderItem(orderNumber: string, itemId: number) {
    return this.ordersRepo.manager.transaction((manager) =>
      this.mutateItems({ orderNumber }, manager, (order, manager) =>
        this.orderItemsService.deleteItem(order, itemId, manager),
      ),
    );
  }

  async updateStatus(options: OrderOptions, status: OrderStatus) {
    return this.updateOrder(options, async (order) => {
      assertValidOrderTransition(order.status, status);
      assertStatusGuards(order, status);

      order.status = status;
      await this.statusHandlers[status]?.(order);
    });
  }

  async updatePaymentStatus(orderNumber: string, body: UpdateOrderPaymentDTO) {
    return this.updateOrder({ orderNumber }, (order) => {
      assertValidPaymentTransition(order.paymentStatus, body.paymentStatus);
      assertPaymentStatusGuards(order, body.paymentStatus);
      order.paymentStatus = body.paymentStatus;
      if (body.paymentStatus === 'paid') order.paidAt = new Date();
    });
  }

  async updateShipping(orderNumber: string, body: UpdateOrderShippingDTO) {
    return this.updateOrder({ orderNumber }, (order) => {
      if (nonUpdatableShippingStatuses.includes(order.status))
        throw new BadRequestException('orders.shippingDetailsNotUpdatable');

      if (body.trackingNumber !== undefined) order.trackingNumber = body.trackingNumber;
    });
  }

  private async createOrderInternal(
    { userId, ...body }: CreateOrderDTO,
    manager: EntityManager,
    clearCartAfterCreate: boolean = false,
  ) {
    if (!body.variants.length) throw new BadRequestException('orders.mustIncludeAtLeastOneItem');

    const orderRepo = manager.getRepository(Order);

    const address = await this.addressService.getAddress(body.addressId, userId, manager);

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

    const diff = await this.orderItemsService.addItems(order, body.variants, manager);
    order.subtotal += diff;
    await this.recalculateAndSaveTotals(order, manager);

    if (clearCartAfterCreate) await this.cartService.clearCart(userId, manager);

    const updatedOrder = await this.getOrderOrFail(manager, { orderNumber: order.orderNumber, userId }, true);

    await this.statusHandlers.pending(updatedOrder);

    return updatedOrder;
  }

  private async recalculateAndSaveTotals(order: Order, manager: EntityManager) {
    const shippingFee = await this.bostaService.calculateShippingFees(
      order.subtotal,
      order.shippingAddress.cityName,
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

  private runWithManager(manager?: EntityManager) {
    return (cb: (m: EntityManager) => Promise<any>) => withOptionalManager(manager, this.ordersRepo.manager, cb);
  }

  private async mutateItems(
    options: OrderOptions,
    manager: EntityManager,
    mutate: (order: Order, manager: EntityManager) => Promise<number>,
  ) {
    const order = await this.getOrderOrFail(manager, options, true);

    if (!editableStatuses.includes(order.status)) throw new BadRequestException('orders.notEditableInCurrentStatus');

    const diff = await mutate(order, manager);

    order.subtotal += diff;
    await this.recalculateAndSaveTotals(order, manager);

    const updatedOrder = await this.getOrderOrFail(manager, options, true);

    return this.serializeOrder(updatedOrder);
  }

  private updateOrder(options: OrderOptions, mutate: (order: Order) => void | Promise<void>) {
    return this.ordersRepo.manager.transaction(async (manager) => {
      const order = await this.getOrderOrFail(manager, options, true);
      await mutate(order);

      const updatedOrder = await manager.getRepository(Order).save(order);

      return this.serializeOrder(updatedOrder);
    });
  }

  private async getOrderOrFail(manager: EntityManager, options: OrderOptions, withRelation = false) {
    const { userId, ...identifier } = options;

    const order = await manager.getRepository(Order).findOne({
      where: {
        ...identifier,
        ...(userId ? { user: { id: userId } } : {}),
      },
      relations: withRelation ? { items: true, user: true } : undefined,
    });

    if (!order) throw new NotFoundException('orders.notFound');

    return order;
  }

  serializeOrder(order: Order) {
    return {
      ...order,
      allowedActions: {
        statuses: getAllowedStatuses(order),
        paymentStatuses: getAllowedPaymentStatuses(order),
      },
    };
  }

  private mapToDTO(order: Order, locale: Locale = this.LocaleContextService.locale): OrderDTO {
    return plainToInstance(OrderDTO, this.serializeOrder(order), {
      excludeExtraneousValues: true,
      context: { locale, userId: order.user.id },
    });
  }

  private readonly statusHandlers = {
    pending: async (order) => {
      await withEnvironment(['production'], async (isValid) => {
        if (!isValid) return;

        await this.mailService.sendTypedMail(order.user.email, 'order_confirmation', this.mapToDTO(order));
      });
    },
    confirmed: async (order) => {
      const unitPrice = order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

      const [delivery] = await withEnvironment(['production'], async (isValid) => {
        if (!isValid) return [{ trackingNumber: null }];

        return await Promise.all([
          this.bostaService.createDelivery({
            ...order.shippingAddress,
            ...order,
            unitPrice,
            cod: order.total,
            note: order.note ?? undefined,
          }),
          this.mailService.sendTypedMail(getEmail('admin'), 'order_reminder', this.mapToDTO(order, 'en'), 'en'),
        ]);
      });

      order.trackingNumber = delivery.trackingNumber;
    },
    delivered: async (order) => {
      if (order.paymentStatus === 'paid') await this.updateStatus({ orderNumber: order.orderNumber }, 'completed');
    },
  } as const satisfies Partial<Record<OrderStatus, (order: Order) => void | Promise<void>>>;
}
