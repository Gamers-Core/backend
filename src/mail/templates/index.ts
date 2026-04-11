import { MailTemplatesMap } from '../types';
import { renderOrderConfirmationHtml } from './order-confirmation.template';
import { renderOrderReminderHtml } from './order-reminder.template';
import { renderSigninHtml } from './signin.template';

export const mailTemplates: MailTemplatesMap = {
  signin: (t) => ({
    type: 'no-reply',
    title: t('mail.supportTitle'),
    subject: t('mail.signin.subject'),
    html: renderSigninHtml,
  }),
  order_confirmation: (t, { orderNumber }) => ({
    type: 'no-reply',
    title: t('mail.supportTitle'),
    subject: t(['mail.orderConfirmation.subject', { orderNumber }]),
    html: renderOrderConfirmationHtml,
  }),
  order_reminder: (t) => ({
    type: 'no-reply',
    title: t('mail.supportTitle'),
    subject: t('mail.orderReminder.subject'),
    html: renderOrderReminderHtml,
  }),
};
