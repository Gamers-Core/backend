import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { Public } from 'src/auth/decorators/public.decorator';
import { deliveryStates } from 'src/bosta/const';
import { OrdersService } from 'src/orders/orders.service';

import { OrdersBostaWebhookDTO } from './dtos/orders-bosta-webhook.dto';
import { BostaWebhookAuthGuard } from './orders-bosta-webhook-auth.guard';

@Controller('bosta')
export class OrdersBostaController {
  constructor(private readonly ordersService: OrdersService) {}

  @Public()
  @UseGuards(BostaWebhookAuthGuard)
  @Post('webhook')
  async handleWebhook(@Body() webhookData: OrdersBostaWebhookDTO) {
    const state = deliveryStates[webhookData.state];

    if (!state || (state === 'delivered' && !webhookData.isConfirmedDelivery) || !webhookData.trackingNumber) return;

    return await this.ordersService.updateStatus({ trackingNumber: webhookData.trackingNumber }, state);
  }
}
