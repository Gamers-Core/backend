import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { deliveryStates } from 'src/addresses/bosta/const';
import { Public } from 'src/auth/decorators/public.decorator';

import { OrdersBostaWebhookDTO } from '../dtos/orders-bosta-webhook.dto';
import { BostaWebhookAuthGuard } from '../guards/bosta-webhook.guard';
import { OrdersService } from '../services/orders.service';

@Controller('bosta')
export class BostaOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Public()
  @UseGuards(BostaWebhookAuthGuard)
  @Post('webhook')
  async handleWebhook(@Body() webhookData: OrdersBostaWebhookDTO) {
    const state = deliveryStates[webhookData.state];

    if (!state || !webhookData.trackingNumber) return;

    return this.ordersService.updateStatus({ trackingNumber: webhookData.trackingNumber }, state);
  }
}
