import { Locale, TranslateFnWithoutLocale } from 'src/i18n/types';
import { OrderDTO } from 'src/orders/dtos/user/order.dto';

import { whatsappMessageTypes } from './const';

export type WhatsAppMessageType = (typeof whatsappMessageTypes)[number];

export type WhatsAppMessageOptions = {
  order_confirmation: OrderDTO;
  admin_notification: OrderDTO;
  page_review: OrderDTO;
};

export type Region = 'EG' | 'GB';

export type LanguageCode = `${Locale}_${Region}` | Locale;

type TemplateFn<T extends WhatsAppMessageType> = (
  t: TranslateFnWithoutLocale,
  values: WhatsAppMessageOptions[T],
) => TemplateParameter[];

type ButtonTemplateFn<T extends WhatsAppMessageType> = (
  t: TranslateFnWithoutLocale,
  values: WhatsAppMessageOptions[T],
) => TemplateButtonComponent[];

export interface WhatsAppTemplateMap<T extends WhatsAppMessageType> {
  languageCode: LanguageCode;
  body?: TemplateFn<T>;
  header?: TemplateFn<T>;
  footer?: TemplateFn<T>;
  buttons?: ButtonTemplateFn<T>;
}

export type WhatsAppTemplatesMap = { [K in WhatsAppMessageType]: WhatsAppTemplateMap<K> };

export interface WhatsAppReplyAction {
  type: WhatsAppMessageType;
  action: 'confirm' | 'cancel';
}

export type WhatsAppReplyMap = Record<string, WhatsAppReplyAction>;

export interface SendTextData {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'text';
  text: { body: string };
}

export interface TemplateParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'payload';
  text?: string;
  payload?: string;
  parameter_name?: string;
}

export interface TemplateComponent {
  type: 'body' | 'header' | 'footer' | 'button';
  parameters: TemplateParameter[];
}

export interface TemplateButtonComponent {
  type: 'button';
  sub_type: 'url' | 'quick_reply' | 'catalog' | 'flow';
  index: string;
  parameters: TemplateParameter[];
}

export interface SendTemplateData<T extends WhatsAppMessageType = WhatsAppMessageType> {
  messaging_product: 'whatsapp';
  to: string;
  type: 'template';
  template: {
    name: T;
    language: { code: LanguageCode };
    components: (TemplateComponent | TemplateButtonComponent)[];
  };
}

export interface SendMessageResponse {
  messaging_product: 'whatsapp';
  contacts: { input: string; wa_id: string }[];
  messages: { id: string }[];
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

export type WhatsAppIncomingMessage =
  | { type: 'text'; from: string; id: string; text: { body: string } }
  | {
      type: 'button';
      from: string;
      id: string;
      button: { payload: string; text: string };
      context: { from: string; id: string };
    };

export interface WhatsAppWebhookEvent {
  object: 'whatsapp_business_account';
  entry: {
    id: string;
    changes: [
      {
        field: 'messages';
        value: {
          messaging_product: 'whatsapp';
          metadata: { display_phone_number: string; phone_number_id: string };
          contacts?: [{ profile: { name: string }; wa_id: string }];
        } & (
          | { messages: [WhatsAppIncomingMessage] }
          | {
              statuses: [
                {
                  id: string;
                  status: 'sent' | 'delivered' | 'read' | 'failed';
                  timestamp: string;
                  recipient_id: string;
                },
              ];
            }
        );
      },
    ];
  }[];
}
