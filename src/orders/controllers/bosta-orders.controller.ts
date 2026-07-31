import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { deliveryStates } from 'src/addresses/bosta/const';
import { Public } from 'src/auth/decorators/public.decorator';
import { WhatsAppService } from 'src/whatsapp/whatsapp.service';

import { OrdersBostaWebhookDTO } from '../dtos/orders-bosta-webhook.dto';
import { BostaWebhookAuthGuard } from '../guards/bosta-webhook.guard';
import { OrdersService } from '../services/orders.service';

@Controller('bosta')
export class BostaOrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  @Public()
  @UseGuards(BostaWebhookAuthGuard)
  @Post('webhook')
  async handleWebhook(@Body() webhookData: OrdersBostaWebhookDTO) {
    console.log(webhookData);

    await this.whatsappService.sendText('01091226543', JSON.stringify(webhookData));

    const state = deliveryStates[webhookData.state];

    if (!state || (state === 'delivered' && !webhookData.isConfirmedDelivery) || !webhookData.trackingNumber) return;

    return this.ordersService.updateStatus({ trackingNumber: webhookData.trackingNumber }, state);
  }
}
