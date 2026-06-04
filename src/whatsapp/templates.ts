import { WhatsAppReplyMap, WhatsAppTemplatesMap } from './types';

export const whatsappReplyMap: WhatsAppReplyMap = {
  تأكيد: { type: 'order_confirmation', action: 'confirm' },
  إلغاء: { type: 'order_confirmation', action: 'cancel' },
};

export const whatsappTemplates: WhatsAppTemplatesMap = {
  order_confirmation: {
    languageCode: 'ar_EG',
    body: (_, { orderNumber, total, currency, shippingAddress }) => [
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
