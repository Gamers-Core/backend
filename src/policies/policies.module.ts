import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminPoliciesController } from './admin-policies.controller';
import { Policy } from './entities/policy.entity';
import { PoliciesService } from './policies.service';
import { PoliciesController } from './user-policies.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Policy])],
  controllers: [PoliciesController, AdminPoliciesController],
  providers: [PoliciesService],
})
export class PoliciesModule {}
