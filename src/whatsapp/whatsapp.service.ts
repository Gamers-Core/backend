import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InternalAxiosRequestConfig } from 'axios';

import { AxiosService } from 'src/common/services/axios.service';
import { ConfigService } from 'src/config/config.service';
import { translateWithoutLocale } from 'src/i18n/helpers';

import { whatsappReplyMap, whatsappTemplates } from './templates';
import {
  SendMessageResponse,
  SendTemplateData,
  SendTextData,
  TemplateComponent,
  WhatsAppErrorResponse,
  WhatsAppMessageOptions,
  WhatsAppMessageType,
  WhatsAppReplyAction,
} from './types';

@Injectable()
export class WhatsAppService extends AxiosService<unknown, WhatsAppErrorResponse> {
  protected readonly baseURL = 'https://graph.facebook.com/v25.0';

  private get phoneNumberId() {
    return this.configService.get('WHATSAPP_PHONE_NUMBER_ID');
  }

  constructor(
    httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super(httpService);
  }

  protected onRequest(config: InternalAxiosRequestConfig) {
    config.headers.Authorization = `Bearer ${this.configService.get('WHATSAPP_TOKEN')}`;
    return config;
  }

  protected extractError(err: WhatsAppErrorResponse): string {
    return err.error?.message;
  }

  // Normalize EG numbers: 01xxxxxxxxx → 201xxxxxxxxx
  private normalizePhone(phone: string): string {
    return phone.startsWith('0') ? `2${phone}` : phone;
  }

  resolveReplyAction(payload: string): WhatsAppReplyAction | null {
    return whatsappReplyMap[payload] ?? null;
  }

  sendTypedMessage<T extends WhatsAppMessageType>(to: string, type: T, values: WhatsAppMessageOptions[T]) {
    const t = translateWithoutLocale('ar');
    const { languageCode, body, footer, header } = whatsappTemplates[type];

    const components: TemplateComponent[] = [{ type: 'body', parameters: body(t, values) }];

    if (header) components.unshift({ type: 'header', parameters: header(t, values) });
    if (footer) components.push({ type: 'footer', parameters: footer(t, values) });

    return this.post<SendMessageResponse, SendTemplateData>(`/${this.phoneNumberId}/messages`, {
      messaging_product: 'whatsapp',
      to: this.normalizePhone(to),
      type: 'template',
      template: { name: type, language: { code: languageCode }, components },
    });
  }

  sendText(to: string, body: string) {
    return this.post<SendMessageResponse, SendTextData>(`/${this.phoneNumberId}/messages`, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.normalizePhone(to),
      type: 'text',
      text: { body },
    });
  }
}
