import { Module } from '@nestjs/common';

import { UsersModule } from 'src/users';
import { MailService } from 'src/mail';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpSessionService } from './otp-session';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, OtpSessionService, MailService],
})
export class AuthModule {}
