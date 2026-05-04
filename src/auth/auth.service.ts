import { Injectable } from '@nestjs/common';

import { CartService } from 'src/cart/cart.service';
import { withEnvironment } from 'src/common/with-environment';
import { OtpSessionService } from 'src/otp-session/otp-session.service';
import { UsersService } from 'src/users/users.service';

import { ResendOTPDTO } from './dtos/resend-otp.dto';
import { SigninDTO } from './dtos/signin.dto';
import { VerifyOTPDTO } from './dtos/verify-otp.dto';
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
      const { user, isNewUser } = await this.usersService.getOrCreate(email);
      const cart = await this.cartService.getOrCreateCart(user.id);

      return { user, cart, isNewUser };
    },
  };

  signin({ email }: SigninDTO) {
    return this.otpSessionService.createSession({ purpose: 'signin', email });
  }

  async verifyOTP<P extends AuthPurpose>({
    sessionId,
    otp,
  }: VerifyOTPDTO): Promise<OtpVerifyResultByPurpose<P> & { purpose: P }> {
    const [email, purpose, data] = await this.otpSessionService.verifySession<P>({ sessionId, otp });

    const res = await this.otpVerifyHandlers[purpose](email, data);

    return { purpose, ...res };
  }

  resendOTP({ sessionId }: ResendOTPDTO) {
    return withEnvironment(
      (isValid) => {
        if (!isValid) return;

        return this.otpSessionService.resendSession({ sessionId });
      },
      ['staging', 'production'],
    );
  }
}
