import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { CartModule } from 'src/cart/cart.module';
import { MailService } from 'src/mail/mail.service';
import { UsersModule } from 'src/users/users.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpSessionService } from './otp-session/otp-session.service';

@Module({
  imports: [HttpModule, UsersModule, CartModule],
  controllers: [AuthController],
  providers: [AuthService, OtpSessionService, MailService],
})
export class AuthModule {}
