import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Cart, CartItem, ProductVariantEntity } from 'src/entity';
import { ProductsModule } from 'src/products';

import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, ProductVariantEntity]), ProductsModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
