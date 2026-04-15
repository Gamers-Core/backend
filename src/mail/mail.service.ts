import { AxiosError, AxiosInstance } from 'axios';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Locale, LocaleContextService, translateWithoutLocale } from 'src/i18n';
import { ServiceUnavailableException } from 'src/common';

import { mailTemplates } from './templates';
import { getEmail, renderMailWrapper } from './helpers';
import { MailOptions, MailOptionsType, MailType, SendMailOptions } from './types';

@Injectable()
export class MailService {
  private readonly logger = new Logger('MailErrorHandler');
  private readonly brevo: AxiosInstance;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly LocaleContextService: LocaleContextService,
  ) {
    this.brevo = this.httpService.axiosRef.create({
      baseURL: this.configService.get<string>('BREVO_API_BASE_URL') || 'https://api.brevo.com/v3',
      timeout: Number(this.configService.get<string>('BREVO_API_TIMEOUT_MS') ?? 10_000),
    });

    this.brevo.interceptors.request.use((config) => {
      const apiKey = this.configService.get<string>('BREVO_API_KEY');
      if (!apiKey) throw new ServiceUnavailableException('mail.unavailable');

      config.headers['api-key'] = apiKey;
      config.headers.accept = 'application/json';
      config.headers['content-type'] = 'application/json';

      return config;
    });

    this.brevo.interceptors.response.use(
      (res) => res,
      (err: AxiosError<{ message?: string }>) => {
        const status = err.response?.status ?? err.status;
        const upstreamMessage = err.response?.data?.message ?? err.message;

        this.logger.error(`Brevo API request failed${status ? ` (status: ${status})` : ''}: ${upstreamMessage}`);

        throw new ServiceUnavailableException('mail.unavailable');
      },
    );
  }

  send({ title, to, subject, html }: SendMailOptions, mail: MailType) {
    return this.brevo.post('/smtp/email', {
      sender: { name: title, email: getEmail(mail) },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });
  }

  sendTypedMail<T extends MailOptionsType>(
    to: string,
    type: T,
    values: MailOptions[T],
    locale: Locale = this.LocaleContextService.locale,
  ) {
    const t = translateWithoutLocale(locale);

    const { type: mail, html, ...options } = mailTemplates[type](t, values);
    const renderedHtml = renderMailWrapper(t, html(t, values, locale === 'ar'), locale);

    return this.send({ ...options, html: renderedHtml, to }, mail);
  }
}
