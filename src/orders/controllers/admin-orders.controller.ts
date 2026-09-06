import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { IsAdminAuthGuard } from 'src/auth/guards/is-admin-auth.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { Paginated } from 'src/common/pagination/pagination.dto';

import { AddOrderItemDTO } from '../dtos/admin/add-order-item.dto';
import { AdminOrderDTO } from '../dtos/admin/admin-order.dto';
import { AdminSearchOrdersDTO } from '../dtos/admin/admin-search-orders.dto';
import { CreateOrderDTO } from '../dtos/admin/create-order.dto';
import { UpdateOrderPaymentDTO } from '../dtos/admin/update-order-payment.dto';
import { UpdateOrderShippingDTO } from '../dtos/admin/update-order-shipping.dto';
import { UpdateOrderStatusDTO } from '../dtos/admin/update-order-status.dto';
import { UpdateOrderItemDTO } from '../dtos/admin/update-order.dto';
import { OrdersService } from '../services/orders.service';

@Controller('admin/orders')
@UseGuards(IsAdminAuthGuard)
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Serialize(Paginated(AdminOrderDTO))
  search(@Query() dto: AdminSearchOrdersDTO, @Query('userId') userId?: number) {
    return this.ordersService.search(dto, userId);
  }

  @Get(':orderNumber')
  @Serialize(AdminOrderDTO)
  getOne(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.getOne(orderNumber);
  }

  @Post()
  @Serialize(AdminOrderDTO)
  create(@Body() body: CreateOrderDTO) {
    return this.ordersService.create(body);
  }

  @Patch(':orderNumber/payment-status')
  @Serialize(AdminOrderDTO)
  updatePayment(@Param('orderNumber') orderNumber: string, @Body() body: UpdateOrderPaymentDTO) {
    return this.ordersService.updatePaymentStatus(orderNumber, body);
  }

  @Patch(':orderNumber/status')
  @Serialize(AdminOrderDTO)
  updateStatus(@Param('orderNumber') orderNumber: string, @Body() body: UpdateOrderStatusDTO) {
    return this.ordersService.updateStatus({ orderNumber }, body.status);
  }

  @Patch(':orderNumber/shipping')
  @Serialize(AdminOrderDTO)
  updateShipping(@Param('orderNumber') orderNumber: string, @Body() body: UpdateOrderShippingDTO) {
    return this.ordersService.updateShipping(orderNumber, body);
  }

  @Post(':orderNumber/restock')
  @Serialize(AdminOrderDTO)
  restock(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.restockReturnedOrder(orderNumber);
  }

  @Post(':orderNumber/items')
  @Serialize(AdminOrderDTO)
  addItems(@Param('orderNumber') orderNumber: string, @Body() body: AddOrderItemDTO) {
    return this.ordersService.addItems(orderNumber, body);
  }

  @Patch(':orderNumber/items/:itemId')
  @Serialize(AdminOrderDTO)
  updateOrderItem(
    @Param('orderNumber') orderNumber: string,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() body: UpdateOrderItemDTO,
  ) {
    return this.ordersService.updateOrderItem(orderNumber, itemId, body);
  }

  @Delete(':orderNumber/items/:itemId')
  @Serialize(AdminOrderDTO)
  removeOrderItem(@Param('orderNumber') orderNumber: string, @Param('itemId', ParseIntPipe) itemId: number) {
    return this.ordersService.removeOrderItem(orderNumber, itemId);
  }
}
