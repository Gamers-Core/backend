import { Injectable } from '@nestjs/common';

import type { I18nKey, Locale, Localized, Messages, Translate as TranslateOption } from './types';
import { localize, translate } from './helpers';
import { LocaleContextService } from './locale-context.service';

@Injectable()
export class I18nService {
  constructor(private readonly localeContextService: LocaleContextService) {}

  get locale(): Locale {
    return this.localeContextService.locale;
  }

  localize(value: Localized): string;
  localize(value: Localized | null): string | null;
  localize(value: Localized | undefined): string | undefined;
  localize(value: Localized | null | undefined): string | null | undefined {
    if (!value) return value;

    return localize(value, this.locale);
  }

  t<Key extends I18nKey, L extends Locale = Locale>(
    translateOption: TranslateOption<Key>,
    locale: L = this.locale as L,
  ): Messages[L][Key] {
    return translate(translateOption, locale);
  }
}
