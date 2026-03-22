import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import { randomBytes } from 'crypto';
import Redis from 'ioredis';

import { REDIS_CLIENT } from 'src/redis';

import {
  OTP_DEFAULT_MAX_ATTEMPTS,
  OTP_DEFAULT_MAX_RESENDS,
  OTP_DEFAULT_MIN_RESEND_INTERVAL_MS,
  OTP_DEFAULT_TTL_SECONDS,
} from './const';
import { generateHashedOtp, generateOtp, getSessionKey } from './helpers';
import { CreateSessionOptions, ResendSessionOptions, OTPAuthSession, VerifySessionOptions } from './types';
import { MailService } from 'src/mail';
import { AuthPurpose, OtpDataByPurpose } from '../types';

@Injectable()
export class OtpSessionService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly mailService: MailService,
  ) {}

  private async readSession<P extends AuthPurpose>(sessionId: string, expectedPurpose: P): Promise<OTPAuthSession<P>> {
    const session = await this.redis.hgetall(getSessionKey(sessionId));

    if (!session || !session.purpose || !session.email || !session.otp || !session.data)
      throw new BadRequestException('Session expired');

    let parsedData: OtpDataByPurpose<P>;
    try {
      parsedData = JSON.parse(session.data) as OtpDataByPurpose<P>;
    } catch {
      throw new BadRequestException('Session expired');
    }

    if (session.purpose !== expectedPurpose) throw new BadRequestException('Session expired');

    return {
      purpose: expectedPurpose,
      email: session.email,
      data: parsedData,
      otp: session.otp,
      otpAttempts: parseInt(session.otp_attempts || '0', 10),
      otpResendCount: parseInt(session.otp_resend_count || '0', 10),
      otpLastSentAt: parseInt(session.otp_last_sent_at || '0', 10),
    };
  }

  async createSession<P extends AuthPurpose>({
    purpose,
    email,
    data,
    ttlSeconds = OTP_DEFAULT_TTL_SECONDS,
  }: CreateSessionOptions<P>) {
    const sessionId = randomBytes(16).toString('hex');
    const key = getSessionKey(sessionId);

    const otp = generateOtp();
    const hashedOtp = await generateHashedOtp(otp);
    const now = Date.now();

    await this.redis
      .multi()
      .hset(key, {
        purpose,
        email,
        data: JSON.stringify(data),
        otp: hashedOtp,
        otp_attempts: '0',
        otp_resend_count: '0',
        otp_last_sent_at: `${now}`,
      })
      .expire(key, ttlSeconds)
      .exec();

    await this.mailService.sendTypedMail(email, purpose, { otp });

    return { purpose, sessionId };
  }

  async verifySession<P extends AuthPurpose>({
    purpose,
    sessionId,
    otp,
    maxAttempts = OTP_DEFAULT_MAX_ATTEMPTS,
  }: VerifySessionOptions<P>): Promise<[string, OtpDataByPurpose<P>]> {
    const key = getSessionKey(sessionId);
    const session = await this.readSession<P>(sessionId, purpose);

    if (session.otpAttempts >= maxAttempts) {
      await this.redis.del(key);
      throw new BadRequestException('Too many attempts');
    }

    const isValid = await compare(otp, session.otp);
    if (!isValid) {
      await this.redis.hincrby(key, 'otp_attempts', 1);
      throw new BadRequestException('Invalid OTP');
    }

    await this.redis.del(key);

    return [session.email, session.data];
  }

  async resendSession<P extends AuthPurpose>({
    purpose,
    sessionId,
    maxResends = OTP_DEFAULT_MAX_RESENDS,
    minResendIntervalMs = OTP_DEFAULT_MIN_RESEND_INTERVAL_MS,
  }: ResendSessionOptions<P>) {
    const key = getSessionKey(sessionId);
    const session = await this.readSession<P>(sessionId, purpose);

    if (session.otpResendCount >= maxResends) throw new BadRequestException('OTP resend limit reached');

    const now = Date.now();
    const canResendOtp = session.otpLastSentAt && now - session.otpLastSentAt > minResendIntervalMs;
    if (!canResendOtp) throw new BadRequestException('Please wait before resending OTP');

    const otp = generateOtp();
    const hashedOtp = await generateHashedOtp(otp);

    await this.redis.hset(key, {
      otp: hashedOtp,
      otp_attempts: '0',
      otp_resend_count: `${session.otpResendCount + 1}`,
      otp_last_sent_at: `${now}`,
    });

    const ttl = await this.redis.ttl(key);
    if (ttl > 0) await this.redis.expire(key, ttl);

    await this.mailService.sendTypedMail(session.email, purpose, { otp });
  }
}
