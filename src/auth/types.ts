import { authPurposes } from './const';

export type AuthPurpose = (typeof authPurposes)[number];

export interface OtpDataMap {
  reset_password: {
    password: string;
  };
}

export type OtpDataByPurpose<P extends AuthPurpose> = OtpDataMap[P];
