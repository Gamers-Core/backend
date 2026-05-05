import { defaultLocale } from './i18n/const';
import { Locale } from './i18n/types';

export const formatNumber =
  (locale: Locale = defaultLocale) =>
  (num: number, options?: Intl.NumberFormatOptions) =>
    new Intl.NumberFormat(locale, options).format(num);
