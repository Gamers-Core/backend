import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';

import { User } from 'src/entity';
import { Serialize } from 'src/interceptors';
import { CurrentUser } from 'src/users/decorators';

import {
  AddOrderItemDTO,
  CheckoutOrderDTO,
  CreateOrderDTO,
  OrderDTO,
  UpdateOrderItemDTO,
  UpdateOrderPaymentDTO,
  UpdateOrderShippingDTO,
  UpdateOrderStatusDTO,
} from './dtos';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Serialize(OrderDTO)
  @Get(':orderNumber')
  async getOrderById(@CurrentUser() user: User, @Param('orderNumber') orderNumber: string) {
    return this.ordersService.getOrder(user.id, orderNumber);
  }

  @Serialize(OrderDTO)
  @Get()
  getOrders(@CurrentUser() user: User) {
    return this.ordersService.getOrders(user.id);
  }

  @Serialize(OrderDTO)
  @Post('checkout')
  checkout(@CurrentUser() user: User, @Body() body: CheckoutOrderDTO) {
    return this.ordersService.checkout(user.id, body);
  }

  @Serialize(OrderDTO)
  @Post()
  createOrder(@CurrentUser() user: User, @Body() body: CreateOrderDTO) {
    return this.ordersService.createOrder(user.id, body);
  }

  @Serialize(OrderDTO)
  @Patch(':orderNumber/paymentStatus')
  updatePayment(
    @CurrentUser() user: User,
    @Param('orderNumber') orderNumber: string,
    @Body() body: UpdateOrderPaymentDTO,
  ) {
    return this.ordersService.updatePaymentStatus(orderNumber, user.id, body);
  }

  @Serialize(OrderDTO)
  @Patch(':orderNumber/status')
  updateStatus(
    @CurrentUser() user: User,
    @Param('orderNumber') orderNumber: string,
    @Body() body: UpdateOrderStatusDTO,
  ) {
    return this.ordersService.updateStatus({ orderNumber }, user.id, body.status);
  }

  @Serialize(OrderDTO)
  @Patch(':orderNumber/shipping')
  updateShipping(
    @CurrentUser() user: User,
    @Param('orderNumber') orderNumber: string,
    @Body() body: UpdateOrderShippingDTO,
  ) {
    return this.ordersService.updateShipping(orderNumber, user.id, body);
  }

  @Serialize(OrderDTO)
  @Post(':orderNumber/items')
  addOrderItem(@CurrentUser() user: User, @Param('orderNumber') orderNumber: string, @Body() body: AddOrderItemDTO) {
    return this.ordersService.addItems(user.id, orderNumber, [body]);
  }

  @Serialize(OrderDTO)
  @Patch(':orderNumber/items/:itemId')
  updateOrderItem(
    @CurrentUser() user: User,
    @Param('orderNumber') orderNumber: string,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() body: UpdateOrderItemDTO,
  ) {
    return this.ordersService.updateOrderItem(user.id, orderNumber, itemId, body);
  }

  @Serialize(OrderDTO)
  @Delete(':orderNumber/items/:itemId')
  deleteOrderItem(
    @CurrentUser() user: User,
    @Param('orderNumber') orderNumber: string,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.ordersService.deleteOrderItem(user.id, orderNumber, itemId);
  }
}
