import { Injectable } from '@nestjs/common';

import { UsersService } from 'src/users';
import { CartService } from 'src/cart';
import { withEnvironment } from 'src/common';
import { Locale, LocaleContextService } from 'src/i18n';

import { ResendOTPDTO, SigninDTO, VerifyOTPDTO } from './dtos';
import { OtpSessionService } from './otp-session';
import { AuthPurpose, OtpVerifyHandlers, OtpVerifyResultByPurpose } from './types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private cartService: CartService,
    private otpSessionService: OtpSessionService,
    private localeContext: LocaleContextService,
  ) {}

  private readonly otpVerifyHandlers: OtpVerifyHandlers = {
    signin: async (email) => {
      const { user, isNewUser } = await this.usersService.findOrCreate(email);
      const cart = await this.cartService.getCart(user.id);

      return {
        user,
        cart,
        isNewUser,
      };
    },
  };

  async signin({ email }: SigninDTO) {
    return await this.otpSessionService.createSession({ purpose: 'signin', email }, this.localeContext.locale);
  }

  async verifyOTP<P extends AuthPurpose>({ sessionId, otp }: VerifyOTPDTO): Promise<OtpVerifyResultByPurpose<P>> {
    const [email, purpose, data] = await this.otpSessionService.verifySession<P>({ sessionId, otp });

    const res = await this.otpVerifyHandlers[purpose](email, data);

    return { purpose, ...res };
  }

  async resendOTP({ sessionId }: ResendOTPDTO, locale?: Locale) {
    return withEnvironment(['staging', 'production'], async (isValid) => {
      if (!isValid) return;

      return this.otpSessionService.resendSession({ sessionId }, locale);
    });
  }
}
