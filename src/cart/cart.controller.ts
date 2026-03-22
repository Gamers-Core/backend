import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';

import { User } from 'src/entity';
import { Serialize } from 'src/interceptors';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';

import { CartDTO, CreateCartItemDTO, UpdateCartItemDTO } from './dtos';
import { CartService } from './cart.service';

@Serialize(CartDTO)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: User) {
    return this.cartService.getCart(user.id);
  }

  @Post()
  addItem(@CurrentUser() user: User, @Body() body: CreateCartItemDTO) {
    return this.cartService.addItem(user.id, body);
  }

  @Patch(':id')
  updateItem(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number, @Body() body: UpdateCartItemDTO) {
    return this.cartService.updateItem(user.id, id, body);
  }

  @Delete()
  clearCart(@CurrentUser() user: User) {
    return this.cartService.clearCart(user.id);
  }
}
