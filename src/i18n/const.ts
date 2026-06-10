import type { Locale, OptionalLocale } from './types';

export const locales = ['en', 'ar'] as const;

export const defaultLocale = 'en' as const satisfies Locale;

export const optionalLocales: OptionalLocale[] = locales.filter(
  (locale): locale is OptionalLocale => locale !== defaultLocale,
);
