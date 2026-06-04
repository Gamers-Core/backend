import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { Public } from 'src/auth/decorators/public.decorator';
import { translateWithoutLocale } from 'src/i18n/helpers';
import { OrdersService } from 'src/orders/services/orders.service';

import { WhatsAppWebhookGuard } from './guards/whatsapp-webhook.guard';
import type { WhatsAppWebhookEvent, WhatsAppWebhookVerificationQuery } from './types';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly ordersService: OrdersService,
  ) {}

  @Public()
  @UseGuards(WhatsAppWebhookGuard)
  @Get('webhook')
  verifyWebhook(@Query() query: WhatsAppWebhookVerificationQuery) {
    return query.hub_challenge;
  }

  @Public()
  @Post('webhook')
  async handleWebhook(@Body() data: WhatsAppWebhookEvent) {
    const value = data.entry?.[0]?.changes?.[0]?.value;
    if (!value || !('messages' in value)) return;

    const message = value.messages?.[0];
    if (!message) return;

    const { from } = message;
    const t = translateWithoutLocale('ar');

    if (message.type === 'text') {
      await this.whatsappService.sendText(
        from,
        t(['whatsapp.replies.unsupportedMessage', { waLink: 'https://wa.me/201559241000' }]),
      );
      return;
    }

    if (message.type === 'button') {
      const action = this.whatsappService.resolveReplyAction(message.button.payload);

      if (!action) {
        await this.whatsappService.sendText(from, t('whatsapp.replies.unknownAction'));
        return;
      }

      if (action.type === 'order_confirmation') {
        const isConfirm = action.action === 'confirm';
        try {
          await this.ordersService.handleWhatsAppStatusUpdate(message.context.id, isConfirm);
          await this.whatsappService.sendText(
            from,
            isConfirm ? t('whatsapp.replies.confirmed') : t('whatsapp.replies.cancelled'),
          );
        } catch {
          await this.whatsappService.sendText(from, t('whatsapp.replies.alreadyActioned'));
        }
      }
      return;
    }

    await this.whatsappService.sendText(
      from,
      t(['whatsapp.replies.unsupportedMessage', { waLink: 'https://wa.me/201559241000' }]),
    );
  }
}
