import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { CartModule } from 'src/cart/cart.module';
import { MailService } from 'src/mail/mail.service';
import { OtpSessionModule } from 'src/otp-session/otp-session.module';
import { UsersModule } from 'src/users/users.module';

import { AuthContextService } from './auth-context.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [HttpModule, UsersModule, CartModule, OtpSessionModule],
  controllers: [AuthController],
  providers: [AuthService, MailService, AuthContextService],
  exports: [AuthContextService],
})
export class AuthModule {}
