import { Body, Controller, Post, Req, Session } from '@nestjs/common';

import { Serialize } from 'src/interceptors';
import { CurrentUser } from 'src/users';
import { User } from 'src/entity';

import { OtpDTO, ResendOTPDTO, SigninDTO, VerifyOTPDTO, VerifyOtpResponseDTO } from './dtos';
import { AuthService } from './auth.service';
import { Public } from './decorators';
import type { AuthSession } from './types';
import type { Request } from 'express';

@Controller('auth')
@Public()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('logout')
  logout(@Req() req: Request) {
    req.session = undefined;

    return { isLoggedIn: false };
  }

  @Serialize(OtpDTO)
  @Post('signin')
  async signin(@Session() session: AuthSession, @Req() req: Request, @Body() body: SigninDTO) {
    if (session.userId) req.session = undefined;

    return await this.authService.signin(body);
  }

  @Serialize(VerifyOtpResponseDTO)
  @Post('verify-otp')
  async verifyOTP(@Body() body: VerifyOTPDTO, @Session() session: AuthSession) {
    const result = await this.authService.verifyOTP(body);

    if ('user' in result) session.userId = result.user.id;

    return result;
  }

  @Post('resend-otp')
  resendOtp(@CurrentUser() user: User | undefined, @Body() body: ResendOTPDTO) {
    return this.authService.resendOTP(body, user?.locale);
  }
}
