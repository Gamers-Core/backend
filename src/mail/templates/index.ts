import { MailTemplatesMap } from '../types';
import { renderOrderConfirmationHtml } from './order-confirmation.template';
import { renderOrderReminderHtml } from './order-reminder.template';
import { renderResetPasswordHtml } from './reset-password.template';
import { renderSignupHtml } from './signup.template';

export const mailTemplates: MailTemplatesMap = {
  reset_password: (t) => ({
    type: 'no-reply',
    title: t(['mail.supportTitle']),
    subject: t(['mail.resetPassword.subject']),
    html: renderResetPasswordHtml,
  }),
  signup: (t) => ({
    type: 'no-reply',
    title: t(['mail.supportTitle']),
    subject: t(['mail.signup.subject']),
    html: renderSignupHtml,
  }),
  order_confirmation: (t, { orderNumber }) => ({
    type: 'no-reply',
    title: t(['mail.supportTitle']),
    subject: t(['mail.orderConfirmation.subject', { orderNumber }]),
    html: renderOrderConfirmationHtml,
  }),
  order_reminder: (t) => ({
    type: 'no-reply',
    title: t(['mail.supportTitle']),
    subject: t(['mail.orderReminder.subject']),
    html: renderOrderReminderHtml,
  }),
};
