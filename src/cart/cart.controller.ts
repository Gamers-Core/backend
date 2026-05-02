import { Body, Controller, Get, ParseArrayPipe, Post } from '@nestjs/common';

import { Serialize } from 'src/interceptors/serialize.interceptor';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

import { CartService } from './cart.service';
import { CartDTO } from './dtos/cart.dto';
import { SyncCartItemDTO } from './dtos/sync-cart-item.dto';

@Serialize(CartDTO)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: User) {
    return this.cartService.getCart(user.id);
  }

  @Post()
  sync(@CurrentUser() user: User, @Body(new ParseArrayPipe({ items: SyncCartItemDTO })) body: SyncCartItemDTO[]) {
    return this.cartService.sync(user.id, body);
  }
}
