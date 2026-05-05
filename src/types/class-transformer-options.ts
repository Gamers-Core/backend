import { Locale } from 'src/i18n/types';

declare module 'class-transformer' {
  interface ClassTransformOptions {
    context?: {
      locale: Locale;
      userId?: number;
    };
  }
}

export {};
