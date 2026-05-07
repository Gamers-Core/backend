import { Cart } from 'src/cart/entities/cart.entity';
import { User } from 'src/users/entities/user.entity';

import { authPurposes } from './const';

export type AuthPurpose = (typeof authPurposes)[number];

export interface AuthSession {
  userId?: number | null;
}

export type OtpVerifyResultByPurpose<P extends AuthPurpose> = OtpVerifyResultMap[P];

export type OtpVerifyHandlers = {
  [P in AuthPurpose]: (email: string, data: OtpDataByPurpose<P>) => Promise<OtpVerifyResultByPurpose<P>>;
};

export interface OtpDataMap {
  signin: undefined;
  admin_signin: undefined;
}

export interface OtpVerifyResultMap {
  signin: {
    user: User;
    cart: Cart;
    isNewUser: boolean;
  };
  admin_signin: {
    user: User;
  };
}

export type OtpDataByPurpose<P extends AuthPurpose> = OtpDataMap[P];
