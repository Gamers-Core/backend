import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { UsersModule } from 'src/users';
import { MailService } from 'src/mail';
import { CartModule } from 'src/cart';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpSessionService } from './otp-session';

@Module({
  imports: [HttpModule, UsersModule, CartModule],
  controllers: [AuthController],
  providers: [AuthService, OtpSessionService, MailService],
})
export class AuthModule {}
