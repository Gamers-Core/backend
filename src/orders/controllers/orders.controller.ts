import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { Paginated, PaginatedDTO } from 'src/common/pagination/pagination.dto';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

import { CheckoutOrderDTO } from '../dtos/user/checkout-order.dto';
import { OrderDTO } from '../dtos/user/order.dto';
import { OrdersService } from '../services/orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get(':orderNumber')
  @Serialize(OrderDTO)
  getOne(@CurrentUser() user: User, @Param('orderNumber') orderNumber: string) {
    return this.ordersService.getOne(orderNumber, user.id);
  }

  @Get()
  @Serialize(Paginated(OrderDTO))
  getAll(@Query() query: PaginatedDTO, @CurrentUser() user: User) {
    return this.ordersService.search(query, user.id);
  }

  @Post('checkout')
  @Serialize(OrderDTO)
  checkout(@CurrentUser() user: User, @Body() body: CheckoutOrderDTO) {
    return this.ordersService.checkout(user.id, body);
  }
}
