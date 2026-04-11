import { Injectable } from '@nestjs/common';

import { UsersService } from 'src/users';
import { withEnvironment } from 'src/common';
import { Locale, LocaleContextService } from 'src/i18n';

import { ResendOTPDTO, SigninDTO, VerifyOTPDTO } from './dtos';
import { OtpSessionService } from './otp-session';
import { AuthPurpose, OtpVerifyHandlers, OtpVerifyResultByPurpose } from './types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private otpSessionService: OtpSessionService,
    private localeContext: LocaleContextService,
  ) {}

  private readonly otpVerifyHandlers: OtpVerifyHandlers = {
    signin: (email) => this.usersService.findOrCreate(email),
  };

  async signin({ email }: SigninDTO) {
    return await this.otpSessionService.createSession({ purpose: 'signin', email }, this.localeContext.locale);
  }

  async verifyOTP<P extends AuthPurpose>({ sessionId, otp }: VerifyOTPDTO): Promise<OtpVerifyResultByPurpose<P>> {
    const [email, purpose, data] = await this.otpSessionService.verifySession<P>({ sessionId, otp });

    return this.otpVerifyHandlers[purpose](email, data);
  }

  async resendOTP({ sessionId }: ResendOTPDTO, locale?: Locale) {
    return withEnvironment(['staging', 'production'], async (isValid) => {
      if (!isValid) return;

      return this.otpSessionService.resendSession({ sessionId }, locale);
    });
  }
}
