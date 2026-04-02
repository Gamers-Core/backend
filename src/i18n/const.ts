import type { Locale } from './types';

export const locales = ['en', 'ar'] as const;

export const defaultLocale = 'en' as const satisfies Locale;
