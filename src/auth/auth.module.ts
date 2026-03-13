import { Module } from '@nestjs/common';

import { UsersModule } from 'src/users';
import { MailService } from 'src/mail';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, MailService],
})
export class AuthModule {}
