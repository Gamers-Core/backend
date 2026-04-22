import { Body, Controller, Get, Param, ParseEnumPipe, Put, UseGuards } from '@nestjs/common';

import { policyTypes, type PolicyType } from 'src/entity';
import { IsAdminAuthGuard } from 'src/guards';
import { Serialize } from 'src/interceptors';

import { PoliciesService } from './policies.service';
import { AdminPoliciesDTO, AdminPolicyDTO, UpdatePolicyDTO } from './dtos';

@Controller('admin/policies')
@UseGuards(IsAdminAuthGuard)
export class AdminPoliciesController {
  constructor(private policiesService: PoliciesService) {}

  @Get()
  @Serialize(AdminPoliciesDTO)
  getAll() {
    return this.policiesService.getLatestAll();
  }

  @Serialize(AdminPolicyDTO)
  @Get(':type/history')
  history(@Param('type', new ParseEnumPipe(policyTypes)) type: PolicyType) {
    return this.policiesService.getHistory(type);
  }

  @Put(':type')
  @Serialize(AdminPolicyDTO)
  update(@Param('type', new ParseEnumPipe(policyTypes)) type: PolicyType, @Body() dto: UpdatePolicyDTO) {
    return this.policiesService.updatePolicy(type, dto);
  }
}
