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
  admin_notification: {
    languageCode: 'en_GB',
    buttons: (_, { orderNumber }) => [
      {
        index: '0',
        type: 'button',
        sub_type: 'url',
        parameters: [{ type: 'text', text: orderNumber }],
      },
    ],
  },
  page_review: { languageCode: 'ar_EG' },
};
