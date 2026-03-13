import { MailOptionsFn, MailOptionsType } from './types';

export const MAIL_DOMAIN = 'gamers-core.net';

export const mails = ['admin', 'contact', 'support', 'no-reply'] as const;

type MailOptionsMap = {
  [K in MailOptionsType]: MailOptionsFn<K>;
};

export const mailsOptions = {
  reset_password: ({ otp }) =>
    ({
      type: 'no-reply',
      title: 'Gamers Core Support',
      subject: 'Password Reset Code',
      text: `Your password reset code is: ${otp}`,
    }) as const,
  signup: ({ otp }) =>
    ({
      type: 'no-reply',
      title: 'Gamers Core Support',
      subject: 'Account Verification Code',
      text: `Your account verification code is: ${otp}`,
    }) as const,
} satisfies MailOptionsMap;
