import { Body, Controller, Post } from '@nestjs/common';

import { OrdersService } from 'src/orders';

import { WebhookDTO } from './dtos';
import { deliveryStates } from './const';

@Controller('bosta')
export class BostaController {
  constructor(private readonly ordersService: OrdersService) {}

  // TODO: add auth guard to ensure only bosta can access this endpoint
  @Post('webhook')
  async handleWebhook(@Body() webhookData: WebhookDTO) {
    const state = deliveryStates[webhookData.state];
    if (!state) return;
    if (state === 'delivered' && !webhookData.isConfirmedDelivery) return;

    return await this.ordersService.updateStatus({ trackingNumber: webhookData.trackingNumber }, state);
  }
}
