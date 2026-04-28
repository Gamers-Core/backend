import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { Serialize } from 'src/interceptors/serialize.interceptor';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

import { CartService } from './cart.service';
import { AddCartItemDTO } from './dtos/add-cart-item.dto';
import { CartDTO } from './dtos/cart.dto';
import { CreateCartItemDTO } from './dtos/create-cart-item.dto';
import { UpdateCartItemDTO } from './dtos/update-cart-item.dto';

@Serialize(CartDTO)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: User) {
    return this.cartService.getCart(user.id);
  }

  @Post(':externalId')
  addItems(
    @CurrentUser() user: User,
    @Param('externalId', new ParseUUIDPipe({ version: '4' })) externalId: string,
    @Body() body: AddCartItemDTO,
  ) {
    return this.cartService.addItem(user.id, { ...body, externalId });
  }

  @Post()
  sync(@CurrentUser() user: User, @Body(new ParseArrayPipe({ items: CreateCartItemDTO })) body: CreateCartItemDTO[]) {
    return this.cartService.sync(user.id, body);
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
