import { defaultLocale, type Locale } from './i18n';

export const formatNumber =
  (locale: Locale = defaultLocale) =>
  (num: number, options?: Intl.NumberFormatOptions) =>
    new Intl.NumberFormat(locale, options).format(num);
