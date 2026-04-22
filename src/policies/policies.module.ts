import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Policy } from 'src/entity';

import { PoliciesService } from './policies.service';
import { AdminPoliciesController } from './admin-policies.controller';
import { PoliciesController } from './user-policies.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Policy])],
  controllers: [PoliciesController, AdminPoliciesController],
  providers: [PoliciesService],
})
export class PoliciesModule {}
