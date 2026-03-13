import { User } from 'src/entity';
import { authPurposes } from './const';

export type AuthPurpose = (typeof authPurposes)[number];

export type OtpVerifyResultByPurpose<P extends AuthPurpose> =
  OtpVerifyResultMap[P];

export type OtpVerifyHandlers = {
  [P in AuthPurpose]: (
    email: string,
    data: OtpDataByPurpose<P>,
  ) => Promise<OtpVerifyResultByPurpose<P>>;
};

export interface OtpDataMap {
  reset_password: {
    password: string;
  };
  signup: {
    name: string;
    password: string;
  };
}

export interface OtpVerifyResultMap {
  reset_password: void;
  signup: User;
}

export type OtpDataByPurpose<P extends AuthPurpose> = OtpDataMap[P];
