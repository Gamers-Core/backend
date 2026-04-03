import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { OrdersModule } from 'src/orders';
import { AddressesModule } from 'src/addresses';

import { BostaService } from './bosta.service';
import { BostaController } from './bosta.controller';
import { BostaWebhookAuthGuard } from './bosta-webhook-auth.guard';

@Module({
  imports: [HttpModule, OrdersModule, forwardRef(() => AddressesModule)],
  providers: [BostaService, BostaWebhookAuthGuard],
  controllers: [BostaController],
  exports: [BostaService],
})
export class BostaModule {}
