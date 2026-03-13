import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { mailsOptions } from './const';
import { getEmail } from './helpers';
import {
  MailOptions,
  MailOptionsType,
  MailType,
  SendMailOptions,
} from './types';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.getOrThrow<string>('EMAIL_USER'),
        pass: this.configService.getOrThrow<string>('EMAIL_PASS'),
      },
    });
  }

  send(
    { title, ...options }: SendMailOptions,
    mail: MailType,
  ): ReturnType<nodemailer.Transporter['sendMail']> {
    return this.transporter.sendMail({
      ...options,
      from: `"${title}" <${getEmail(mail)}>`,
    });
  }

  sendTypedMail<T extends MailOptionsType>(
    to: string,
    type: T,
    values: MailOptions[T],
  ): ReturnType<nodemailer.Transporter['sendMail']> {
    const { type: mail, ...options } = mailsOptions[type](values);

    return this.send({ ...options, to }, mail);
  }
}
