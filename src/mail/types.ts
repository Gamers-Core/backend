import { AuthPurpose } from 'src/auth';

import { mails } from './const';

export interface MailCreds {
  user: string;
  pass: string;
}

export type MailType = (typeof mails)[number];

export interface SendMailOptions {
  title: string;
  to: string;
  subject: string;
  text: string;
}

export type MailOptions = {
  //TODO: Add Other mail types and their options here
} & { [K in AuthPurpose]: { otp: string } };
interface MailOptionsMap extends Omit<SendMailOptions, 'to'> {
  type: MailType;
}

export type MailOptionsType = keyof MailOptions;
export type MailOptionsFn<T extends MailOptionsType> = (
  values: MailOptions[T],
) => MailOptionsMap;
