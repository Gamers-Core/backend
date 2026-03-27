import { plainToInstance } from 'class-transformer';
import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { withOptionalManager } from 'src/common';
import { CartService } from 'src/cart';
import { BostaService } from 'src/bosta';
import { getEmail, MailService } from 'src/mail';
import { Order, type OrderStatus } from 'src/entity';
import { AddressesService } from 'src/addresses/addresses.service';

import { editableStatuses, nonUpdatableShippingStatuses } from './statuses';
import { OrderItemsService } from './order-items.service';
import {
  AddOrderItemDTO,
  CheckoutOrderDTO,
  CreateOrderDTO,
  OrderDTO,
  UpdateOrderItemDTO,
  UpdateOrderPaymentDTO,
  UpdateOrderShippingDTO,
} from './dtos';
import {
  assertPaymentStatusGuards,
  assertStatusGuards,
  assertValidOrderTransition,
  assertValidPaymentTransition,
  getAllowedPaymentStatuses,
  getAllowedStatuses,
} from './helpers';
import { OrderIdentifier } from './types';

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
  ) {}

  getOrders(userId: number) {
    return this.ordersRepo.find({
      where: { user: { id: userId } },
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });
  }

  getOrder(userId: number, orderNumber: string) {
    return this.getOrderOrFail({ orderNumber }, userId, this.ordersRepo.manager, true);
  }

  async checkout(userId: number, body: CheckoutOrderDTO) {
    return this.ordersRepo.manager.transaction(async (manager) => {
      const cart = await this.cartService.getCart(userId, manager);
      if (!cart.items.length) throw new BadRequestException('Cart is empty');

      const variants = cart.items.map(({ variant, quantity }) => ({ externalId: variant.externalId, quantity }));
      return this.createOrderInternal(userId, { ...body, variants }, manager, true);
    });
  }

  createOrder(userId: number, body: CreateOrderDTO) {
    return this.ordersRepo.manager.transaction(async (manager) => {
      const order = await this.createOrderInternal(userId, body, manager);

      return this.mapToDTO(order);
    });
  }

  addItems(userId: number, orderNumber: string, items: AddOrderItemDTO[], manager?: EntityManager) {
    return this.runWithManager(manager)((manager) =>
      this.mutateItems(orderNumber, userId, manager, (order, manager) =>
        this.orderItemsService.addItems(order, items, manager),
      ),
    );
  }

  updateOrderItem(userId: number, orderNumber: string, itemId: number, body: UpdateOrderItemDTO) {
    return this.ordersRepo.manager.transaction((manager) =>
      this.mutateItems(orderNumber, userId, manager, (order, manager) =>
        this.orderItemsService.updateItem(order, itemId, body, manager),
      ),
    );
  }

  deleteOrderItem(userId: number, orderNumber: string, itemId: number) {
    return this.ordersRepo.manager.transaction((manager) =>
      this.mutateItems(orderNumber, userId, manager, (order, manager) =>
        this.orderItemsService.deleteItem(order, itemId, manager),
      ),
    );
  }

  async updateStatus(orderIdentifier: OrderIdentifier, userId: number, status: OrderStatus) {
    return this.updateOrder(orderIdentifier, userId, async (order) => {
      assertValidOrderTransition(order.status, status);
      assertStatusGuards(order, status);

      order.status = status;
      await this.statusHandlers[status]?.(order);
    });
  }

  async updatePaymentStatus(orderNumber: string, userId: number, body: UpdateOrderPaymentDTO) {
    return this.updateOrder({ orderNumber }, userId, (order) => {
      assertValidPaymentTransition(order.paymentStatus, body.paymentStatus);
      assertPaymentStatusGuards(order, body.paymentStatus);
      order.paymentStatus = body.paymentStatus;
      if (body.paymentStatus === 'paid') order.paidAt = new Date();
    });
  }

  async updateShipping(orderNumber: string, userId: number, body: UpdateOrderShippingDTO) {
    return this.updateOrder({ orderNumber }, userId, (order) => {
      if (nonUpdatableShippingStatuses.includes(order.status))
        throw new BadRequestException('Shipping details can no longer be updated');

      if (body.trackingNumber !== undefined) order.trackingNumber = body.trackingNumber;
    });
  }

  private async createOrderInternal(
    userId: number,
    body: CreateOrderDTO,
    manager: EntityManager,
    clearCartAfterCreate: boolean = false,
  ) {
    if (!body.variants.length) throw new BadRequestException('Order must include at least one item');

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

    const updatedOrder = await this.getOrderOrFail({ orderNumber: order.orderNumber }, userId, manager, true);

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
    orderNumber: string,
    userId: number,
    manager: EntityManager,
    mutate: (order: Order, manager: EntityManager) => Promise<number>,
  ) {
    const order = await this.getOrderOrFail({ orderNumber }, userId, manager, true);

    if (!editableStatuses.includes(order.status))
      throw new BadRequestException('Order cannot be modified in its current status');

    const diff = await mutate(order, manager);

    order.subtotal += diff;
    await this.recalculateAndSaveTotals(order, manager);

    const updatedOrder = await this.getOrderOrFail({ orderNumber }, userId, manager, true);

    return this.mapToDTO(updatedOrder);
  }

  private updateOrder(
    orderIdentifier: OrderIdentifier,
    userId: number,
    mutate: (order: Order) => void | Promise<void>,
  ) {
    return this.ordersRepo.manager.transaction(async (manager) => {
      const order = await this.getOrderOrFail(orderIdentifier, userId, manager, true);
      await mutate(order);

      const updatedOrder = await manager.getRepository(Order).save(order);

      return this.mapToDTO(updatedOrder);
    });
  }

  private async getOrderOrFail(
    orderIdentifier: OrderIdentifier,
    userId: number,
    manager: EntityManager,
    withRelation = false,
  ) {
    const identifierKey = 'orderNumber' in orderIdentifier ? 'orderNumber' : 'trackingNumber';
    const identifierValue = orderIdentifier[identifierKey];

    const order = await manager.getRepository(Order).findOne({
      where: { [identifierKey]: identifierValue, user: { id: userId } },
      relations: withRelation ? { items: true, user: true } : undefined,
    });

    if (!order) throw new NotFoundException('Order not found');

    return order;
  }

  mapToDTO(order: Order): OrderDTO {
    return plainToInstance(OrderDTO, {
      ...order,
      allowedActions: {
        statuses: getAllowedStatuses(order),
        paymentStatuses: getAllowedPaymentStatuses(order),
      },
    });
  }

  private readonly statusHandlers = {
    pending: async (order) => {
      await this.mailService.sendTypedMail(order.user.email, 'order_confirmation', order);
    },
    confirmed: async (order) => {
      const unitPrice = order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

      const [delivery] = await Promise.all([
        this.bostaService.createDelivery({
          ...order.shippingAddress,
          ...order,
          unitPrice,
          cod: order.total,
          note: order.note ?? undefined,
        }),
        this.mailService.sendTypedMail(getEmail('admin'), 'order_reminder', order),
      ]);

      order.trackingNumber = delivery.trackingNumber;
    },
    delivered: async (order) => {
      if (order.paymentStatus === 'paid')
        await this.updateStatus({ orderNumber: order.orderNumber }, order.user.id, 'completed');
    },
  } as const satisfies Partial<Record<OrderStatus, (order: Order) => void | Promise<void>>>;
}
