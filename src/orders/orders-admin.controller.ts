import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';

import { IsAdminAuthGuard } from 'src/guards/is-admin-auth.guard';
import { Serialize } from 'src/interceptors';

import {
  AddOrderItemDTO,
  AdminOrderDTO,
  CreateOrderDTO,
  UpdateOrderItemDTO,
  UpdateOrderPaymentDTO,
  UpdateOrderShippingDTO,
  UpdateOrderStatusDTO,
} from './dtos/admin';
import { OrdersService } from './orders.service';

@Controller('admin/orders')
@UseGuards(IsAdminAuthGuard)
@Serialize(AdminOrderDTO)
export class OrdersAdminController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getOrders() {
    return this.ordersService.getOrders();
  }

  @Get(':orderNumber')
  getOrder(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.getOrder(orderNumber);
  }

  @Post()
  createOrder(@Body() body: CreateOrderDTO) {
    return this.ordersService.createOrder(body);
  }

  @Patch(':orderNumber/paymentStatus')
  updatePayment(@Param('orderNumber') orderNumber: string, @Body() body: UpdateOrderPaymentDTO) {
    return this.ordersService.updatePaymentStatus(orderNumber, body);
  }

  @Patch(':orderNumber/status')
  updateStatus(@Param('orderNumber') orderNumber: string, @Body() body: UpdateOrderStatusDTO) {
    return this.ordersService.updateStatus({ orderNumber }, body.status);
  }

  @Patch(':orderNumber/shipping')
  updateShipping(@Param('orderNumber') orderNumber: string, @Body() body: UpdateOrderShippingDTO) {
    return this.ordersService.updateShipping(orderNumber, body);
  }

  @Post(':orderNumber/items')
  addOrderItem(@Param('orderNumber') orderNumber: string, @Body() body: AddOrderItemDTO) {
    return this.ordersService.addItems(orderNumber, body);
  }

  @Patch(':orderNumber/items/:itemId')
  updateOrderItem(
    @Param('orderNumber') orderNumber: string,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() body: UpdateOrderItemDTO,
  ) {
    return this.ordersService.updateOrderItem(orderNumber, itemId, body);
  }

  @Delete(':orderNumber/items/:itemId')
  deleteOrderItem(@Param('orderNumber') orderNumber: string, @Param('itemId', ParseIntPipe) itemId: number) {
    return this.ordersService.deleteOrderItem(orderNumber, itemId);
  }
}
