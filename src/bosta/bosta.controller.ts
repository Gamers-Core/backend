import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { Public } from 'src/auth/decorators/public.decorator';
import { OrdersService } from 'src/orders/orders.service';

import { BostaWebhookAuthGuard } from './bosta-webhook-auth.guard';
import { deliveryStates } from './const';
import { WebhookDTO } from './dtos/webhook.dto';

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
