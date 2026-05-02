import { Injectable } from '@nestjs/common';

import { CartService } from 'src/cart/cart.service';
import { withEnvironment } from 'src/common/with-environment';
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
  ) {}

  private readonly otpVerifyHandlers: OtpVerifyHandlers = {
    signin: async (email) => {
      const { user, isNewUser } = await this.usersService.findOrCreate(email);
      const cart = await this.cartService.getOrCreateCart(user.id);

      return { user, cart, isNewUser };
    },
  };

  async signin({ email }: SigninDTO) {
    return await this.otpSessionService.createSession({ purpose: 'signin', email });
  }

  async verifyOTP<P extends AuthPurpose>({
    sessionId,
    otp,
  }: VerifyOTPDTO): Promise<OtpVerifyResultByPurpose<P> & { purpose: P }> {
    const [email, purpose, data] = await this.otpSessionService.verifySession<P>({ sessionId, otp });

    const res = await this.otpVerifyHandlers[purpose](email, data);

    return { purpose, ...res };
  }

  async resendOTP({ sessionId }: ResendOTPDTO) {
    return withEnvironment(
      async (isValid) => {
        if (!isValid) return;

        return this.otpSessionService.resendSession({ sessionId });
      },
      ['staging', 'production'],
    );
  }
}
