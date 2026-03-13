import { MailOptionsFn, MailOptionsType } from './types';

export const MAIL_DOMAIN = 'gamers-core.net';

export const mails = ['admin', 'contact', 'support', 'no-reply'] as const;

type MailOptionsMap = {
  [K in MailOptionsType]: MailOptionsFn<K>;
};

export const mailsOptions = {
  'reset-password': ({ code }) =>
    ({
      type: 'no-reply',
      title: 'Gamers Core Support',
      subject: 'Password Reset Code',
      text: `Your password reset code is: ${code}`,
    }) as const,
} satisfies MailOptionsMap;
