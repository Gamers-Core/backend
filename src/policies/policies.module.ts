import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminPoliciesController } from './controllers/admin-policies.controller';
import { PoliciesController } from './controllers/policies.controller';
import { Policy } from './entities/policy.entity';
import { PoliciesService } from './policies.service';

@Module({
  imports: [TypeOrmModule.forFeature([Policy])],
  controllers: [PoliciesController, AdminPoliciesController],
  providers: [PoliciesService],
})
export class PoliciesModule {}
