import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { MailService } from 'src/mail/mail.service';

import { OtpSessionService } from './otp-session.service';

@Module({
  imports: [HttpModule],
  providers: [OtpSessionService, MailService],
  exports: [OtpSessionService],
})
export class OtpSessionModule {}
