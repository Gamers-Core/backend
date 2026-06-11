import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InternalAxiosRequestConfig } from 'axios';

import { AxiosService } from 'src/common/services/axios.service';
import { ConfigService } from 'src/config/config.service';
import { translateWithoutLocale } from 'src/i18n/helpers';
import { LocaleContextService } from 'src/i18n/locale-context.service';
import { Locale } from 'src/i18n/types';

import { getEmail, renderMailWrapper } from './helpers';
import { mailTemplates } from './templates';
import { MailOptions, MailOptionsType, MailType, SendMailOptions } from './types';

@Injectable()
export class MailService extends AxiosService {
  protected readonly baseURL = 'https://api.brevo.com/v3';

  constructor(
    readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly localeContextService: LocaleContextService,
  ) {
    super(httpService);
  }

  protected onRequest(config: InternalAxiosRequestConfig) {
    config.headers['api-key'] = this.configService.get('BREVO_API_KEY');
    config.headers.accept = 'application/json';
    config.headers['content-type'] = 'application/json';

    return config;
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
    return this.post('/smtp/email', {
      sender: { name: title, email: getEmail(mail) },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });
  }
}
