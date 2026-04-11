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

export interface CreateSessionOptions<P extends AuthPurpose> {
  purpose: P;
  email: string;
  data: OtpDataByPurpose<P>;
  ttlSeconds?: number;
}

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
