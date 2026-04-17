import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddressesModule } from 'src/addresses';
import { BostaModule } from 'src/bosta';
import { Order } from 'src/entity';
import { CartModule } from 'src/cart';
import { ProductsModule } from 'src/products';
import { MailService } from 'src/mail';
import { MediaModule } from 'src/media';

import { OrdersAdminController } from './orders-admin.controller';
import { OrdersUserController } from './orders-user.controller';
import { OrderItemsService } from './order-items.service';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Order]),
    forwardRef(() => AddressesModule),
    forwardRef(() => BostaModule),
    CartModule,
    ProductsModule,
    MediaModule,
  ],
  controllers: [OrdersUserController, OrdersAdminController],
  providers: [OrdersService, OrderItemsService, MailService],
  exports: [OrdersService],
})
export class OrdersModule {}
