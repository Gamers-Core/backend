import { Body, Controller, Post, Req, Session } from '@nestjs/common';
import type { Request } from 'express';

import { Serialize } from 'src/common/interceptors/serialize.interceptor';

import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { OTPDTO } from './dtos/otp.dto';
import { ResendOTPDTO } from './dtos/resend-otp.dto';
import { SigninDTO } from './dtos/signin.dto';
import { VerifyOTPResponseDTO } from './dtos/verify-otp-response.dto';
import { VerifyOTPDTO } from './dtos/verify-otp.dto';
import type { AuthSession } from './types';

@Controller('auth')
@Public()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('logout')
  logout(@Req() req: Request) {
    req.session = null;

    return { isLoggedIn: false };
  }

  @Serialize(OTPDTO)
  @Post('signin')
  signin(@Session() session: AuthSession, @Req() req: Request, @Body() body: SigninDTO) {
    if (session.userId) req.session = null;

    return this.authService.signin(body);
  }

  @Serialize(VerifyOTPResponseDTO)
  @Post('verify-otp')
  async verifyOTP(@Body() body: VerifyOTPDTO, @Session() session: AuthSession) {
    const result = await this.authService.verifyOTP(body);

    if ('user' in result) session.userId = result.user.id;

    return result;
  }

  @Post('resend-otp')
  resendOtp(@Body() body: ResendOTPDTO) {
    return this.authService.resendOTP(body);
  }
}
