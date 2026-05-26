import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MailService } from 'src/mail/mail.service';
import { UsersModule } from 'src/users/users.module';

import { AdminPoliciesController } from './controllers/admin-policies.controller';
import { PoliciesController } from './controllers/policies.controller';
import { Policy } from './entities/policy.entity';
import { PoliciesService } from './policies.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Policy]), UsersModule],
  controllers: [PoliciesController, AdminPoliciesController],
  providers: [PoliciesService, MailService],
})
export class PoliciesModule {}
