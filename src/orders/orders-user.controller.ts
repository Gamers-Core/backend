import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { User } from 'src/entity';
import { Serialize } from 'src/interceptors';
import { CurrentUser } from 'src/users/decorators';

import { CheckoutOrderDTO, OrderDTO } from './dtos/user';
import { OrdersService } from './orders.service';

@Controller('orders')
@Serialize(OrderDTO)
export class OrdersUserController {
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
