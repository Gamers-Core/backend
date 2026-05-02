import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddressesModule } from 'src/addresses/addresses.module';
import { BostaModule } from 'src/bosta/bosta.module';
import { CartModule } from 'src/cart/cart.module';
import { MailService } from 'src/mail/mail.service';
import { MediaModule } from 'src/media/media.module';
import { ProductsModule } from 'src/products/products.module';

import { AdminOrdersController } from './controllers/admin-orders.controller';
import { BostaOrdersController } from './controllers/bosta-orders.controller';
import { OrdersController } from './controllers/orders.controller';
import { Order } from './entities/order.entity';
import { OrderItemsService } from './services/order-items.service';
import { OrdersService } from './services/orders.service';

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
  controllers: [OrdersController, AdminOrdersController, BostaOrdersController],
  providers: [OrdersService, OrderItemsService, MailService],
  exports: [OrdersService],
})
export class OrdersModule {}
