import { Body, Controller, Get, Post, Session } from '@nestjs/common';

import { Serialize } from 'src/interceptors';
import { CurrentUser } from 'src/users';
import { User } from 'src/entity';

import {
  AuthUserDTO,
  CreateUserDTO,
  ForgotPasswordDTO,
  IsLoggedInDTO,
  LoginUserDTO,
  OtpDTO,
  ResendOTPDTO,
  VerifyOTPDTO,
} from './dtos';
import { AuthService } from './auth.service';
import { Public } from './decorators';

@Controller('auth')
@Public()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Serialize(IsLoggedInDTO)
  @Get()
  isLoggedIn(@CurrentUser() user: User) {
    return { isLoggedIn: !!user };
  }

  @Serialize(IsLoggedInDTO)
  @Post('logout')
  logout(@Session() session: any) {
    session.userId = null;

    return { isLoggedIn: false };
  }

  @Serialize(OtpDTO)
  @Post('signup')
  async signup(@Body() body: CreateUserDTO) {
    return await this.authService.signup(body);
  }

  @Serialize(AuthUserDTO)
  @Post('login')
  async login(@Body() body: LoginUserDTO, @Session() session: any) {
    const user = await this.authService.login(body);

    session.userId = user.id;

    return user;
  }

  @Serialize(OtpDTO)
  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDTO) {
    return await this.authService.forgotPassword(body);
  }

  @Serialize(AuthUserDTO)
  @Post('verify-otp')
  async verifyOTP(@Body() body: VerifyOTPDTO, @Session() session: any) {
    const result = await this.authService.verifyOTP(body);

    if (result instanceof User) session.userId = result.id;

    return result;
  }

  @Post('resend-otp')
  resendOtp(@Body() body: ResendOTPDTO) {
    return this.authService.resendOTP(body);
  }
}
