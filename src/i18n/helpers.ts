import { formatNumber } from 'src/helpers';

import messages from './messages';
import { defaultLocale, locales } from './const';
import type { I18nKey, Locale, Localized, Messages, Translate, TranslateFnWithoutLocale } from './types';

export const translate = <Key extends I18nKey, L extends Locale = Locale>(
  options: Translate<Key>,
  locale: L = defaultLocale as L,
): Messages[L][Key] => {
  const key = (Array.isArray(options) ? options[0] : options) as Key;

  const translation = messages[locale][key];

  const params = Array.isArray(options) ? options[1] : undefined;
  if (!params) return translation;

  const fn = formatNumber(locale);

  return Object.entries(params).reduce(
    (acc, [placeholder, value]) =>
      acc.replaceAll(
        `{${placeholder}}`,
        String(typeof value === 'number' ? fn(value, { useGrouping: false }) : value),
      ) as Messages[L][Key],
    translation,
  );
};

export const translateWithoutLocale =
  <L extends Locale = Locale>(locale: L): TranslateFnWithoutLocale =>
  (options) =>
    translate(options, locale);

export const isLocaleKey = (key: string): key is Locale => locales.includes(key as Locale);

export const localize = (value: Localized, locale: Locale): string => value[locale] ?? value[defaultLocale];
