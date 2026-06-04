import { WhatsAppTemplatesMap } from './types';

export const whatsappMessageTypes = ['order_confirmation'] as const;

export const whatsappTemplates: WhatsAppTemplatesMap = {
  order_confirmation: {
    languageCode: 'ar_EG',
    body: (t, { orderNumber, total, currency, shippingAddress }) => [
      { type: 'text', text: shippingAddress.nameAr },
      { type: 'text', text: orderNumber },
      { type: 'text', text: `${total} ${currency}` },
      {
        type: 'text',
        text: `${shippingAddress.cityName}, ${shippingAddress.districtName} - ${shippingAddress.detailedAddress}`,
      },
    ],
  },
};
