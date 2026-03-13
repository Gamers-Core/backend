import { Body, Controller, Get, Post, Session } from '@nestjs/common';

import { Serialize } from 'src/interceptors';
import { CurrentUser } from 'src/users';
import { User } from 'src/entity';

import {
  AuthUserDTO,
  CreateUserDTO,
  IsLoggedInDTO,
  LoginUserDTO,
  ResendOTPDTO,
  VerifyOTPDTO,
} from './dtos';
import { AuthService } from './auth.service';
import { Public } from './decorators';

@Controller('auth')
@Public()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get()
  @Serialize(IsLoggedInDTO)
  isLoggedIn(@CurrentUser() user: User) {
    return { isLoggedIn: !!user };
  }

  @Post('logout')
  @Serialize(IsLoggedInDTO)
  logout(@Session() session: any) {
    session.userId = null;

    return { isLoggedIn: false };
  }

  @Serialize(AuthUserDTO)
  @Post('signup')
  async signup(@Body() body: CreateUserDTO, @Session() session: any) {
    const user = await this.authService.signup(body);

    session.userId = user.id;
    return user;
  }

  @Serialize(AuthUserDTO)
  @Post('login')
  async login(@Body() body: LoginUserDTO, @Session() session: any) {
    const user = await this.authService.login(body);

    session.userId = user.id;

    return user;
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: LoginUserDTO) {
    const sessionId = await this.authService.forgotPassword(body);

    return { sessionId };
  }

  @Post('verify-otp')
  async verifyOTP(@Body() body: VerifyOTPDTO) {
    return await this.authService.verifyOTP(body);
  }

  @Post('resend-otp')
  resendOtp(@Body() body: ResendOTPDTO) {
    return this.authService.resendOTP(body.sessionId);
  }
}
