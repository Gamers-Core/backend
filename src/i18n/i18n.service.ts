import { Injectable } from '@nestjs/common';

import type { I18nKey, Locale, Messages, Translate as TranslateOption } from './types';
import { translate } from './helpers';
import { LocaleContextService } from './locale-context.service';

@Injectable()
export class I18nService {
  constructor(private readonly localeContextService: LocaleContextService) {}

  get locale(): Locale {
    return this.localeContextService.locale;
  }

  t<Key extends I18nKey, L extends Locale = Locale>(
    translateOption: TranslateOption<Key>,
    locale: L = this.locale as L,
  ): Messages[L][Key] {
    return translate(translateOption, locale);
  }
}
