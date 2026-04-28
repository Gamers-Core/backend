import { Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import Redis from 'ioredis';

import { REDIS_CLIENT } from 'src/redis';
import { MailService } from 'src/mail';
import { BadRequestException, withEnvironment } from 'src/common';
import { Locale } from 'src/i18n';

import {
  OTP_DEFAULT_MAX_ATTEMPTS,
  OTP_DEFAULT_MAX_RESENDS,
  OTP_DEFAULT_MIN_RESEND_INTERVAL_MS,
  OTP_DEFAULT_TTL_SECONDS,
} from './const';
import { compareHashedOtp, generateHashedOtp, generateOtp, getSessionKey } from './helpers';
import { CreateSessionOptions, ResendSessionOptions, OTPAuthSession, VerifySessionOptions } from './types';
import { AuthPurpose, OtpDataByPurpose } from '../types';
import { authPurposes } from '../const';

@Injectable()
export class OtpSessionService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly mailService: MailService,
  ) {}

  private async readSession<P extends AuthPurpose>(sessionId: string): Promise<OTPAuthSession<P>> {
    const session = await this.redis.hgetall(getSessionKey(sessionId));

    if (!session || !session.purpose || !session.email || !session.otp)
      throw new BadRequestException('auth.otp.expired');

    let parsedData: OtpDataByPurpose<P> = undefined;

    if (session.data) {
      try {
        parsedData = JSON.parse(session.data) as OtpDataByPurpose<P>;
      } catch {
        throw new BadRequestException('auth.otp.expired');
      }
    }

    if (!authPurposes.includes(session.purpose as AuthPurpose)) throw new BadRequestException('auth.otp.expired');

    return {
      purpose: session.purpose as P,
      email: session.email,
      data: parsedData,
      otp: session.otp,
      otpAttempts: parseInt(session.otp_attempts || '0', 10),
      otpResendCount: parseInt(session.otp_resend_count || '0', 10),
      otpLastSentAt: parseInt(session.otp_last_sent_at || '0', 10),
    };
  }

  async createSession<P extends AuthPurpose>(
    { purpose, email, data, ttlSeconds = OTP_DEFAULT_TTL_SECONDS }: CreateSessionOptions<P>,
    locale?: Locale,
  ) {
    const sessionId = randomBytes(16).toString('hex');
    const key = getSessionKey(sessionId);

    const otp = generateOtp();
    const hashedOtp = await generateHashedOtp(otp);
    const now = Date.now();

    const sessionData = data ? { data: JSON.stringify(data) } : {};

    await this.redis
      .multi()
      .hset(key, {
        purpose,
        email,
        ...sessionData,
        otp: hashedOtp,
        otp_attempts: '0',
        otp_resend_count: '0',
        otp_last_sent_at: `${now}`,
      })
      .expire(key, ttlSeconds)
      .exec();

    await withEnvironment(
      async (isValid) => {
        if (!isValid) return;

        await this.mailService.sendTypedMail(email, purpose, { otp }, locale);
      },
      ['staging', 'production'],
    );

    return { sessionId };
  }

  async verifySession<P extends AuthPurpose>({
    sessionId,
    otp,
    maxAttempts = OTP_DEFAULT_MAX_ATTEMPTS,
  }: VerifySessionOptions): Promise<[string, P, OtpDataByPurpose<P>]> {
    const key = getSessionKey(sessionId);
    const session = await this.readSession<P>(sessionId);

    if (session.otpAttempts >= maxAttempts) {
      await this.redis.del(key);
      throw new BadRequestException('auth.otp.tooManyAttempts');
    }

    await withEnvironment(
      async (isValid) => {
        if (!isValid) return;

        if (!(await compareHashedOtp(otp, session.otp))) {
          await this.redis.hincrby(key, 'otp_attempts', 1);
          throw new BadRequestException('auth.otp.invalid');
        }
      },
      ['staging', 'production'],
    );

    await this.redis.del(key);

    return [session.email, session.purpose, session.data];
  }

  async resendSession(
    {
      sessionId,
      maxResends = OTP_DEFAULT_MAX_RESENDS,
      minResendIntervalMs = OTP_DEFAULT_MIN_RESEND_INTERVAL_MS,
    }: ResendSessionOptions,
    locale?: Locale,
  ) {
    const key = getSessionKey(sessionId);
    const session = await this.readSession(sessionId);

    if (session.otpResendCount >= maxResends) throw new BadRequestException('auth.otp.resendLimitExceeded');

    const now = Date.now();
    const canResendOtp = session.otpLastSentAt && now - session.otpLastSentAt > minResendIntervalMs;
    if (!canResendOtp) throw new BadRequestException('auth.otp.resendTooSoon');

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

    await this.mailService.sendTypedMail(session.email, session.purpose, { otp }, locale);
  }
}
