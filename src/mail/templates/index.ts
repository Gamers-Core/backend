import { MailTemplatesMap } from '../types';

import { renderOrderAutoCancellationHtml } from './order-auto-cancellation.template';
import { renderOrderConfirmationHtml } from './order-confirmation.template';
import { renderOrderNotifyAdminHtml } from './order-notify-admin.template';
import { renderOrderStatusUpdateHtml } from './order-status-update.template';
import { renderPolicyUpdateHtml } from './policy-update.template';
import { renderSigninHtml } from './signin.template';

export const mailTemplates: MailTemplatesMap = {
  signin: (t) => ({
    type: 'no-reply',
    title: t('mail.supportTitle'),
    subject: t('mail.signin.subject'),
    html: renderSigninHtml,
  }),
  admin_signin: (t) => ({
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
  order_auto_cancellation: (t, { orderNumber }) => ({
    type: 'no-reply',
    title: t('mail.supportTitle'),
    subject: t(['mail.orderAutoCancellation.subject', { orderNumber }]),
    html: renderOrderAutoCancellationHtml,
  }),
  order_status_update: (t, { orderNumber, status }) => ({
    type: 'no-reply',
    title: t('mail.supportTitle'),
    subject: t(['mail.orderStatusUpdate.subject', { orderNumber, status: t(`orders.status.${status}`) }]),
    html: renderOrderStatusUpdateHtml,
  }),
  order_notify_admin: (t, { orderNumber }) => ({
    type: 'no-reply',
    title: t('mail.notifyAdminNewOrder.header'),
    subject: t(['mail.notifyAdminNewOrder.subject', { orderNumber }]),
    html: renderOrderNotifyAdminHtml,
  }),
  policy_update: (t, { policyType }) => ({
    type: 'no-reply',
    title: t('mail.supportTitle'),
    subject: t(['mail.policyUpdate.subject', { policyType: t(`policies.type.${policyType}`) }]),
    html: renderPolicyUpdateHtml,
  }),
};
