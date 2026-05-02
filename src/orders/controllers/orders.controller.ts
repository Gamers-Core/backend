import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { Serialize } from 'src/interceptors/serialize.interceptor';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

import { CheckoutOrderDTO } from '../dtos/user/checkout-order.dto';
import { OrderDTO } from '../dtos/user/order.dto';
import { OrdersService } from '../services/orders.service';

@Controller('orders')
@Serialize(OrderDTO)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get(':orderNumber')
  getOrder(@CurrentUser() user: User, @Param('orderNumber') orderNumber: string) {
    return this.ordersService.getOrder(orderNumber, user.id);
  }

  @Get()
  getOrders(@CurrentUser() user: User) {
    return this.ordersService.getOrders(user.id);
  }

  @Post('checkout')
  checkout(@CurrentUser() user: User, @Body() body: CheckoutOrderDTO) {
    return this.ordersService.checkout(user.id, body);
  }
}
