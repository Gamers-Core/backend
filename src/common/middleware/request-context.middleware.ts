import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { AuthContextService } from 'src/auth/auth-context.service';
import { locales } from 'src/i18n/const';
import { LocaleContextService } from 'src/i18n/locale-context.service';
import type { Locale } from 'src/i18n/types';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(
    private readonly localeContextService: LocaleContextService,
    private readonly authContextService: AuthContextService,
  ) {}

  use(request: Request, response: Response, next: NextFunction) {
    const localeHeader = request.headers['x-locale'] as Locale;
    const headerLocale = locales.includes(localeHeader) ? localeHeader : undefined;

    response.setHeader('x-locale', headerLocale ?? this.localeContextService.locale);

    this.localeContextService.run(() => this.authContextService.run(next), headerLocale);
  }
}
