import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { type Request } from 'express';

import type { I18nKey, Locale, Messages, TranslateFnWithoutLocale, Translate as TranslateOption } from './types';
import { resolveLocale, translate } from './helpers';

@Injectable({ scope: Scope.REQUEST })
export class I18nService {
  constructor(@Inject(REQUEST) private request: Request) {}

  get locale(): Locale {
    return resolveLocale(this.request);
  }

  set locale(locale: Locale) {
    this.request['locale'] = locale;
  }

  t<Key extends I18nKey, L extends Locale = Locale>(
    translateOption: TranslateOption<Key>,
    locale: L = this.locale as L,
  ): Messages[L][Key] {
    return translate(translateOption, locale);
  }

  tLocale<L extends Locale = Locale>(locale: L = this.locale as L): TranslateFnWithoutLocale {
    return (options) => translate(options, locale);
  }
}
