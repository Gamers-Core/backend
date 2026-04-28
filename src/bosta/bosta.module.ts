import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { OrdersModule } from 'src/orders/orders.module';

import { BostaWebhookAuthGuard } from './bosta-webhook-auth.guard';
import { BostaController } from './bosta.controller';
import { BostaService } from './bosta.service';

@Module({
  imports: [HttpModule, OrdersModule],
  providers: [BostaService, BostaWebhookAuthGuard],
  controllers: [BostaController],
  exports: [BostaService],
})
export class BostaModule {}
