import { AuthPurpose, OtpDataByPurpose } from '../types';

export interface OTPAuthSession<P extends AuthPurpose> {
  purpose: P;
  data: OtpDataByPurpose<P>;
  email: string;
  otp: string;
  otpAttempts: number;
  otpResendCount: number;
  otpLastSentAt: number;
}

export type CreateSessionOptions<P extends AuthPurpose> = {
  purpose: P;
  email: string;
  ttlSeconds?: number;
} & (OtpDataByPurpose<P> extends undefined ? { data?: never } : { data: OtpDataByPurpose<P> });

export interface VerifySessionOptions {
  sessionId: string;
  otp: string;
  maxAttempts?: number;
}

export interface ResendSessionOptions {
  sessionId: string;
  maxResends?: number;
  minResendIntervalMs?: number;
}
