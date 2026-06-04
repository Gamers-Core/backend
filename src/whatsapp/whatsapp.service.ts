import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InternalAxiosRequestConfig } from 'axios';

import { AxiosService } from 'src/common/services/axios.service';
import { ConfigService } from 'src/config/config.service';
import { translateWithoutLocale } from 'src/i18n/helpers';
import { LocaleContextService } from 'src/i18n/locale-context.service';
import { Locale } from 'src/i18n/types';

import { whatsappTemplates } from './const';
import {
  SendMessageResponse,
  SendTemplateData,
  TemplateComponent,
  WhatsAppErrorResponse,
  WhatsAppMessageOptions,
  WhatsAppMessageType,
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
    private readonly localeContextService: LocaleContextService,
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

  sendTypedMessage<T extends WhatsAppMessageType>(
    to: string,
    type: T,
    values: WhatsAppMessageOptions[T],
    locale: Locale = this.localeContextService.locale,
  ) {
    const t = translateWithoutLocale(locale);
    const { languageCode, body, Footer, header } = whatsappTemplates[type];

    const components: TemplateComponent[] = [
      {
        type: 'body',
        parameters: body(t, values),
      },
    ];

    if (Footer) components.push({ type: 'footer', parameters: Footer(t, values) });
    if (header) components.unshift({ type: 'header', parameters: header(t, values) });

    return this.post<SendMessageResponse, SendTemplateData>(`/${this.phoneNumberId}/messages`, {
      messaging_product: 'whatsapp',
      to: `2${to}`,
      type: 'template',
      template: { name: type, language: { code: languageCode }, components },
    });
  }
}
