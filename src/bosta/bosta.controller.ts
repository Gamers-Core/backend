import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { Public } from 'src/auth';
import { OrdersService } from 'src/orders';

import { WebhookDTO } from './dtos';
import { deliveryStates } from './const';
import { BostaWebhookAuthGuard } from './bosta-webhook-auth.guard';

@Controller('bosta')
export class BostaController {
  constructor(private readonly ordersService: OrdersService) {}

  @Public()
  @UseGuards(BostaWebhookAuthGuard)
  @Post('webhook')
  async handleWebhook(@Body() webhookData: WebhookDTO) {
    const state = deliveryStates[webhookData.state];

    if (!state || (state === 'delivered' && !webhookData.isConfirmedDelivery) || !webhookData.trackingNumber) return;

    return await this.ordersService.updateStatus({ trackingNumber: webhookData.trackingNumber }, state);
  }
}
