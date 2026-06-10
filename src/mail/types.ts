import { AuthPurpose } from 'src/auth/types';
import { TranslateFnWithoutLocale } from 'src/i18n/types';
import { OrderDTO } from 'src/orders/dtos/user/order.dto';
import { PolicyType } from 'src/policies/types';

import { mails, mailsOptions } from './const';

export type MailType = (typeof mails)[number];
export type MailOptionsType = (typeof mailsOptions)[number];

export interface SendMailOptions {
  title: string;
  to: string;
  subject: string;
  html: string;
}

export type MailOptions = {
  order_confirmation: OrderDTO;
  order_auto_cancellation: OrderDTO;
  order_status_update: OrderDTO;

  policy_update: { policyType: PolicyType; version: number; updatedAt: Date };
} & { [K in AuthPurpose]: { otp: string } };
export interface MailOptionsMap<T extends MailOptionsType> extends Omit<SendMailOptions, 'to' | 'html'> {
  type: MailType;
  html: MailTemplateFn<T>;
}

export type MailOptionsFn<T extends MailOptionsType> = (
  t: TranslateFnWithoutLocale,
  values: MailOptions[T],
) => MailOptionsMap<T>;
export type MailTemplatesMap = { [K in MailOptionsType]: MailOptionsFn<K> };
export type MailTemplateFn<T extends MailOptionsType> = (
  t: TranslateFnWithoutLocale,
  values: MailOptions[T],
  options: MailTemplateOptions,
) => string;

export interface MailTemplateOptions {
  isRtl: boolean;
  frontendUrl: string;
  adminFrontendUrl: string;
}
