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
  @Get(':id')
  async getOrderById(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    console.log(await this.ordersService.getOrder(user.id, id));

    return this.ordersService.getOrder(user.id, id);
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
  @Patch(':id/paymentStatus')
  updatePayment(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number, @Body() body: UpdateOrderPaymentDTO) {
    return this.ordersService.updatePaymentStatus(id, user.id, body);
  }

  @Serialize(OrderDTO)
  @Patch(':id/status')
  updateStatus(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number, @Body() body: UpdateOrderStatusDTO) {
    return this.ordersService.updateStatus(id, user.id, body.status);
  }

  @Serialize(OrderDTO)
  @Patch(':id/shipping')
  updateShipping(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateOrderShippingDTO,
  ) {
    return this.ordersService.updateShipping(id, user.id, body);
  }

  @Serialize(OrderDTO)
  @Post(':id/items')
  addOrderItem(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number, @Body() body: AddOrderItemDTO) {
    return this.ordersService.addItems(user.id, id, [body]);
  }

  @Serialize(OrderDTO)
  @Patch(':id/items/:itemId')
  updateOrderItem(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() body: UpdateOrderItemDTO,
  ) {
    return this.ordersService.updateOrderItem(user.id, id, itemId, body);
  }

  @Serialize(OrderDTO)
  @Delete(':id/items/:itemId')
  deleteOrderItem(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.ordersService.deleteOrderItem(user.id, id, itemId);
  }
}
