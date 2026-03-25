import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { withOptionalManager } from 'src/common';
import { editableStatuses, nonUpdatableShippingStatuses, Order, type OrderStatus } from 'src/entity';

import {
  AddOrderItemDTO,
  CheckoutOrderDTO,
  CreateOrderDTO,
  UpdateOrderItemDTO,
  UpdateOrderPaymentDTO,
  UpdateOrderShippingDTO,
} from './dtos';

import { AddressesService } from 'src/addresses';
import { CartService } from 'src/cart';
import { BostaService } from 'src/bosta';

import { assertStatusGuards, assertValidOrderTransition, assertValidPaymentTransition } from './helpers';
import { OrderItemsService } from './order-items.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly ordersRepo: Repository<Order>,
    private readonly cartService: CartService,
    private readonly addressService: AddressesService,
    private readonly bostaService: BostaService,
    private readonly orderItemsService: OrderItemsService,
  ) {}

  getOrders(userId: number) {
    return this.ordersRepo.find({
      where: { user: { id: userId } },
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });
  }

  getOrder(userId: number, id: number) {
    return this.getOrderOrFail(id, userId, this.ordersRepo.manager, true);
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
    return this.ordersRepo.manager.transaction((manager) => this.createOrderInternal(userId, body, manager));
  }

  addItems(userId: number, orderId: number, items: AddOrderItemDTO[], manager?: EntityManager) {
    return this.runWithManager(manager)((manager) =>
      this.mutateItems(orderId, userId, manager, (order, manager) =>
        this.orderItemsService.addItems(order, items, manager),
      ),
    );
  }

  updateOrderItem(userId: number, orderId: number, itemId: number, body: UpdateOrderItemDTO) {
    return this.ordersRepo.manager.transaction((manager) =>
      this.mutateItems(orderId, userId, manager, (order, manager) =>
        this.orderItemsService.updateItem(order, itemId, body, manager),
      ),
    );
  }

  deleteOrderItem(userId: number, orderId: number, itemId: number) {
    return this.ordersRepo.manager.transaction((manager) =>
      this.mutateItems(orderId, userId, manager, (order, manager) =>
        this.orderItemsService.deleteItem(order, itemId, manager),
      ),
    );
  }

  async updateStatus(orderId: number, userId: number, status: OrderStatus) {
    return this.updateOrder(orderId, userId, (order) => {
      assertValidOrderTransition(order.status, status);
      assertStatusGuards(order, status);
      order.status = status;
    });
  }

  async updatePaymentStatus(orderId: number, userId: number, body: UpdateOrderPaymentDTO) {
    return this.updateOrder(orderId, userId, (order) => {
      assertValidPaymentTransition(order.paymentStatus, body.paymentStatus);
      order.paymentStatus = body.paymentStatus;
      if (body.paymentStatus === 'paid') order.paidAt = new Date();
    });
  }

  async updateShipping(orderId: number, userId: number, body: UpdateOrderShippingDTO) {
    return this.updateOrder(orderId, userId, (order) => {
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

    return this.getOrderOrFail(order.id, userId, manager, true);
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
    orderId: number,
    userId: number,
    manager: EntityManager,
    mutate: (order: Order, manager: EntityManager) => Promise<number>,
  ) {
    const order = await this.getOrderOrFail(orderId, userId, manager, true);

    if (!editableStatuses.includes(order.status))
      throw new BadRequestException('Order cannot be modified in its current status');

    const diff = await mutate(order, manager);

    order.subtotal += diff;
    await this.recalculateAndSaveTotals(order, manager);

    return this.getOrderOrFail(orderId, userId, manager, true);
  }

  private updateOrder(orderId: number, userId: number, mutate: (order: Order) => void | Promise<void>) {
    return this.ordersRepo.manager.transaction(async (manager) => {
      const order = await this.getOrderOrFail(orderId, userId, manager);
      await mutate(order);

      return manager.getRepository(Order).save(order);
    });
  }

  private async getOrderOrFail(id: number, userId: number, manager: EntityManager, withItems = false) {
    const order = await manager.getRepository(Order).findOne({
      where: { id, user: { id: userId } },
      relations: withItems ? { items: true } : undefined,
    });

    if (!order) throw new NotFoundException('Order not found');

    return order;
  }
}
