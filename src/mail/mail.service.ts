import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { mailsOptions } from './const';
import { getEmail } from './helpers';
import { MailOptions, MailOptionsType, MailType, SendMailOptions } from './types';

@Injectable()
export class MailService {
  private transporter?: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {}

  private getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      const user = this.configService.get<string>('EMAIL_USER');
      const pass = this.configService.get<string>('EMAIL_PASS');
      if (!user || !pass) throw new Error('MailService: EMAIL_USER and EMAIL_PASS must be set to send mail.');

      this.transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: { user, pass },
      });
    }

    return this.transporter;
  }
  send({ title, ...options }: SendMailOptions, mail: MailType): ReturnType<nodemailer.Transporter['sendMail']> {
    return this.getTransporter().sendMail({
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
