import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError, AxiosInstance } from 'axios';

import { ServiceUnavailableException } from 'src/common/exceptions';
import { ConfigService } from 'src/config/config.service';
import { translateWithoutLocale } from 'src/i18n/helpers';
import { LocaleContextService } from 'src/i18n/locale-context.service';
import { Locale } from 'src/i18n/types';

import { getEmail, renderMailWrapper } from './helpers';
import { mailTemplates } from './templates';
import { MailOptions, MailOptionsType, MailType, SendMailOptions } from './types';

@Injectable()
export class MailService {
  private readonly logger = new Logger('MailErrorHandler');
  private readonly brevo: AxiosInstance;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly localeContextService: LocaleContextService,
  ) {
    this.brevo = this.httpService.axiosRef.create({ baseURL: 'https://api.brevo.com/v3', timeout: 10_000 });

    this.brevo.interceptors.request.use((config) => {
      const apiKey = this.configService.get('BREVO_API_KEY');

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

        throw ServiceUnavailableException('mail.unavailable');
      },
    );
  }

  sendTypedMail<T extends MailOptionsType>(
    to: string,
    type: T,
    values: MailOptions[T],
    locale: Locale = this.localeContextService.locale,
  ) {
    const t = translateWithoutLocale(locale);

    const { type: mail, html, ...options } = mailTemplates[type](t, values);
    const renderedHtml = renderMailWrapper(
      t,
      html(t, values, {
        isRtl: locale === 'ar',
        frontendUrl: this.getUrl(this.configService.get('FRONTEND_URL'), locale),
        adminFrontendUrl: this.getUrl(this.configService.get('ADMIN_FRONTEND_URL')),
      }),
      locale,
    );

    return this.send({ ...options, html: renderedHtml, to }, mail);
  }

  private getUrl(url: string, locale?: Locale) {
    const normalizedBaseUrl = url.replace(/\/+$/, '');

    if (locale) return `${normalizedBaseUrl}/${locale}`;

    return normalizedBaseUrl;
  }

  private send({ title, to, subject, html }: SendMailOptions, mail: MailType) {
    return this.brevo.post('/smtp/email', {
      sender: { name: title, email: getEmail(mail) },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });
  }
}
