import { User } from 'src/entity';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
