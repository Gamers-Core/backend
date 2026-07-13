import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddressesModule } from 'src/addresses/addresses.module';
import { CartModule } from 'src/cart/cart.module';
import { DiscountsModule } from 'src/discounts/discounts.module';
import { MailService } from 'src/mail/mail.service';
import { MediaModule } from 'src/media/media.module';
import { MetaModule } from 'src/meta/meta.module';
import { ProductsModule } from 'src/products/products.module';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';

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
    CartModule,
    ProductsModule,
    MediaModule,
    DiscountsModule,
    MetaModule,
    forwardRef(() => WhatsappModule),
  ],
  controllers: [OrdersController, AdminOrdersController, BostaOrdersController],
  providers: [OrdersService, OrderItemsService, MailService],
  exports: [OrdersService],
})
export class OrdersModule {}
