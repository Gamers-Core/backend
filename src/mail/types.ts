import { AuthPurpose } from 'src/auth';
import { Order } from 'src/entity';

import { mails } from './const';

export type MailType = (typeof mails)[number];

export interface SendMailOptions {
  title: string;
  to: string;
  subject: string;
  html: string;
}

export type MailOptions = {
  order_reminder: Order;
  order_confirmation: Order;
} & { [K in AuthPurpose]: { otp: string } };
interface MailOptionsMap extends Omit<SendMailOptions, 'to'> {
  type: MailType;
}

export type MailOptionsType = keyof MailOptions;
export type MailOptionsFn<T extends MailOptionsType> = (values: MailOptions[T]) => MailOptionsMap;
