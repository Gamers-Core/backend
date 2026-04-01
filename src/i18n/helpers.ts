import { Request } from 'express';

import { formatNumber } from 'src/helpers';

import messages from './messages';
import { defaultLocale } from './const';
import type { I18nKey, Locale, Messages, Translate, TranslateFnWithoutLocale } from './types';

export const translate = <Key extends I18nKey, L extends Locale = Locale>(
  options: Translate<Key>,
  locale: L = defaultLocale as L,
): Messages[L][Key] => {
  const key = (Array.isArray(options) ? options[0] : options) as Key;

  const translation = messages[locale][key];
  if (!options[1]) return translation;

  const fn = formatNumber(locale);
  return Object.entries(options[1]).reduce(
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
