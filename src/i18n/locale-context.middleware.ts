import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { locales } from './const';
import { LocaleContextService } from './locale-context.service';
import type { Locale } from './types';

@Injectable()
export class LocaleContextMiddleware implements NestMiddleware {
  constructor(private readonly localeContextService: LocaleContextService) {}

  use(request: Request, response: Response, next: NextFunction) {
    const localeHeader = request.headers['x-locale'] as Locale;
    const headerLocale = locales.includes(localeHeader) ? localeHeader : undefined;

    response.setHeader('x-locale', headerLocale ?? this.localeContextService.locale);

    this.localeContextService.run(next, headerLocale);
  }
}
