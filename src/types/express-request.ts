import type { User } from 'src/entity';
import type { Locale } from 'src/i18n';

declare module 'express-serve-static-core' {
  interface Request {
    locale: Locale;
    user?: User;
    session?: {
      userId?: number;
    };
  }
}

export {};
