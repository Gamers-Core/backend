import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddressesModule } from 'src/addresses/addresses.module';
import { BostaModule } from 'src/bosta/bosta.module';
import { CartModule } from 'src/cart/cart.module';
import { MailService } from 'src/mail/mail.service';
import { MediaModule } from 'src/media/media.module';
import { ProductsModule } from 'src/products/products.module';

import { Order } from './entities/order.entity';
import { OrderItemsService } from './order-items.service';
import { OrdersAdminController } from './orders-admin.controller';
import { OrdersBostaController } from './orders-bosta.controller';
import { OrdersUserController } from './orders-user.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Order]),
    AddressesModule,
    BostaModule,
    CartModule,
    ProductsModule,
    MediaModule,
  ],
  controllers: [OrdersUserController, OrdersAdminController, OrdersBostaController],
  providers: [OrdersService, OrderItemsService, MailService],
  exports: [OrdersService],
})
export class OrdersModule {}
