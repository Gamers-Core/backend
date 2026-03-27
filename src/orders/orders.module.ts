import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddressesModule } from 'src/addresses';
import { BostaModule } from 'src/bosta';
import { Order } from 'src/entity';
import { CartModule } from 'src/cart';
import { ProductsModule } from 'src/products';
import { MailService } from 'src/mail';

import { OrdersController } from './orders.controller';
import { OrderItemsService } from './order-items.service';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    forwardRef(() => AddressesModule),
    forwardRef(() => BostaModule),
    CartModule,
    ProductsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderItemsService, MailService],
  exports: [OrdersService],
})
export class OrdersModule {}
