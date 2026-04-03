import type { User } from 'src/entity';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
    session?: {
      userId?: number;
    };
  }
}

export {};
