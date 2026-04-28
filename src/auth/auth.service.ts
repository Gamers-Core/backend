import { Injectable } from '@nestjs/common';

import { CartService } from 'src/cart/cart.service';
import { withEnvironment } from 'src/common/with-environment';
import { LocaleContextService } from 'src/i18n/locale-context.service';
import { Locale } from 'src/i18n/types';
import { UsersService } from 'src/users/users.service';

import { ResendOTPDTO } from './dtos/resend-otp.dto';
import { SigninDTO } from './dtos/signin.dto';
import { VerifyOTPDTO } from './dtos/verify-otp.dto';
import { OtpSessionService } from './otp-session/otp-session.service';
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

  async verifyOTP<P extends AuthPurpose>({
    sessionId,
    otp,
  }: VerifyOTPDTO): Promise<OtpVerifyResultByPurpose<P> & { purpose: P }> {
    const [email, purpose, data] = await this.otpSessionService.verifySession<P>({ sessionId, otp });

    const res = await this.otpVerifyHandlers[purpose](email, data);

    return { purpose, ...res };
  }

  async resendOTP({ sessionId }: ResendOTPDTO, locale?: Locale) {
    return withEnvironment(
      async (isValid) => {
        if (!isValid) return;

        return this.otpSessionService.resendSession({ sessionId }, locale);
      },
      ['staging', 'production'],
    );
  }
}
