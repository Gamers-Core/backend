import { Locale, TranslateFnWithoutLocale } from 'src/i18n/types';
import { OrderDTO } from 'src/orders/dtos/user/order.dto';

import { whatsappMessageTypes } from './const';

export type WhatsAppMessageType = (typeof whatsappMessageTypes)[number];

export type WhatsAppMessageOptions = {
  order_confirmation: OrderDTO;
};
export type WhatsappComponents = { [K in WhatsAppMessageType]: WhatsAppTemplateMap<K> };

export type LanguageCode = `${Locale}_EG` | Locale;

type TemplateFn<T extends WhatsAppMessageType, R extends TemplateParameter[] = TemplateParameter[]> = (
  t: TranslateFnWithoutLocale,
  values: WhatsAppMessageOptions[T],
) => R;

export interface WhatsAppTemplateMap<T extends WhatsAppMessageType> {
  languageCode: LanguageCode;
  body: TemplateFn<T>;
  header?: TemplateFn<T, TemplateParameter[]>;
  Footer?: TemplateFn<T, TemplateParameter[]>;
}

export type WhatsAppTemplatesMap = { [K in WhatsAppMessageType]: WhatsAppTemplateMap<K> };

export interface TemplateParameter {
  type: 'text' | 'currency' | 'date_time' | 'image';
  text: string;
}

export interface SendMessageResponse {
  messaging_product: 'whatsapp';
  contacts: { input: string; wa_id: string }[];
  messages: { id: string }[];
}

export interface TemplateComponent {
  type: 'body' | 'header' | 'footer';
  parameters: TemplateParameter[];
}

export interface SendTemplateData<T extends WhatsAppMessageType = WhatsAppMessageType> {
  messaging_product: 'whatsapp';
  to: string;
  type: 'template';
  template: {
    name: T;
    language: { code: LanguageCode };
    components: TemplateComponent[];
  };
}

export interface WhatsAppErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
  };
}

export interface WhatsAppWebhookVerificationQuery {
  hub_mode: string;
  hub_verify_token: string;
  hub_challenge: string;
}

export interface WhatsAppWebhookEvent {
  object: 'whatsapp_business_account';
  entry: {
    id: string;
    changes: [
      {
        field: 'messages';
        value: {
          messaging_product: 'whatsapp';
          metadata: {
            display_phone_number: string;
            phone_number_id: string;
          };
          contacts: [
            {
              profile: { name: string };
              wa_id: string;
              user_id: `EG.${string}`;
            },
          ];
        } & (
          | {
              messages: [
                {
                  from: string;
                  from_user_id: `EG.${string}`;
                  id: string;
                  timestamp: string;
                } & (
                  | { type: 'text'; text: { body: string } }
                  | {
                      type: 'button';
                      button: { payload: string; text: string };
                      context: { from: string; id: string };
                    }
                ),
              ];
            }
          | {
              statuses: [
                {
                  id: 'wamid.HBgMMjAxMDkxMjI2NTQzFQIAERgSNEQwNDk2QzYxNEM2MDFDQzk5AA==';
                  status: 'read';
                  timestamp: '1780543732';
                  recipient_id: '201091226543';
                  recipient_user_id: 'EG.26868530196161437';
                },
              ];
            }
        );
      },
    ];
  }[];
}
