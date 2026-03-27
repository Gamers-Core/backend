import { Body, Controller, Post } from '@nestjs/common';

import { User } from 'src/entity';
import { CurrentUser } from 'src/users/decorators';
import { OrdersService } from 'src/orders';

import { WebhookDTO } from './dtos';
import { deliveryStates } from './const';

@Controller('bosta')
export class BostaController {
  constructor(private readonly ordersService: OrdersService) {}
  @Post('webhook')
  async handleWebhook(@CurrentUser() user: User, @Body() webhookData: WebhookDTO) {
    const state = deliveryStates[webhookData.state];
    if (!state) return;
    if (state === 'delivered' && !webhookData.isConfirmedDelivery) return;

    return await this.ordersService.updateStatus({ trackingNumber: webhookData.trackingNumber }, user.id, state);
  }
}
