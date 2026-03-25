import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddressesModule } from 'src/addresses';
import { BostaModule } from 'src/bosta';
import { Order } from 'src/entity';
import { CartModule } from 'src/cart';
import { ProductsModule } from 'src/products';

import { OrdersController } from './orders.controller';
import { OrderItemsService } from './order-items.service';
import { OrdersService } from './orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), AddressesModule, CartModule, BostaModule, ProductsModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderItemsService],
})
export class OrdersModule {}
