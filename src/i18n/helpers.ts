import { formatNumber } from 'src/helpers';

import { defaultLocale, locales } from './const';
import messages from './messages';
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

export const localize = (value: Localized, locale: Locale = defaultLocale): string =>
  value[locale] || value[defaultLocale];

export const isLocaleKey = (key: string): key is Locale => locales.includes(key as Locale);

export const isLocalized = (value: unknown): value is Localized => {
  if (!value || typeof value !== 'object') return false;
  if (!(defaultLocale in value)) return false;

  const obj = value as Record<string, unknown>;
  if (typeof obj[defaultLocale] !== 'string' || !obj[defaultLocale].trim()) return false;

  return Object.entries(obj).every(([key, val]) => isLocaleKey(key) && (val === undefined || typeof val === 'string'));
};

export const i18nKeyValidator = <K extends I18nKey>(value: K) => value as unknown as Messages[Locale][K];
