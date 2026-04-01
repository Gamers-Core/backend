import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { defaultLocale, locales } from './const';
import { LocaleContextService } from './locale-context.service';
import type { Locale } from './types';

@Injectable()
export class LocaleContextMiddleware implements NestMiddleware {
  constructor(private readonly localeContextService: LocaleContextService) {}

  use(request: Request, _response: Response, next: NextFunction) {
    const localeHeader = request.headers['x-locale'] as Locale;
    const headerLocale = locales.includes(localeHeader) ? localeHeader : undefined;

    const locale = headerLocale ?? defaultLocale;
    request.locale = locale;

    this.localeContextService.run({ headerLocale, locale }, next);
  }
}
