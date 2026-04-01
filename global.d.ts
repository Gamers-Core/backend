import { User } from 'src/entity';
import { Locale } from 'src/i18n';

declare global {
  namespace Express {
    interface Request {
      locale: Locale;
      user?: User;
      session?: {
        userId?: number;
      };
    }
  }
}
