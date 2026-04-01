import { Request } from 'express';

import { formatNumber } from 'src/helpers';

import messages from './messages';
import type { I18nKey, Locale, Messages, Translate } from './types';
import { defaultLocale, locales } from './const';

export const translate = <Key extends I18nKey, L extends Locale = Locale>(
  [key, options]: Translate<Key>,
  locale: L = defaultLocale as L,
): Messages[L][Key] => {
  const translation = messages[locale][key];
  if (!options) return translation;

  const fn = formatNumber(locale);
  return Object.entries(options).reduce(
    (acc, [key, value]) =>
      acc.replace(
        `{${key}}`,
        String(typeof value === 'number' ? fn(value, { useGrouping: false }) : value),
      ) as Messages[L][Key],
    translation,
  );
};

export const resolveLocale = (request: Request): Locale => {
  const headerLocale = request.headers['x-locale'] as Locale | undefined;
  if (headerLocale && locales.includes(headerLocale)) return headerLocale;

  return request.user?.locale ?? defaultLocale;
};
