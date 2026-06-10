export const MAIL_DOMAIN = 'gamers-core.net';

export const mails = ['admin', 'contact', 'support', 'no-reply'] as const;

export const mailsOptions = [
  'signin',
  'admin_signin',
  'order_confirmation',
  'order_auto_cancellation',
  'order_status_update',
  'order_notify_admin',
  'policy_update',
] as const;
