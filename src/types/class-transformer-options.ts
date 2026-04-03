import type { Locale } from 'src/i18n';

declare module 'class-transformer' {
  interface ClassTransformOptions {
    context?: {
      locale: Locale;
      userId?: number;
    };
  }
}

export {};
