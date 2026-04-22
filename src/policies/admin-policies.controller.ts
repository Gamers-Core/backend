import { Body, Controller, Get, Param, ParseEnumPipe, Put, UseGuards } from '@nestjs/common';

import { policyTypes, type PolicyType } from 'src/entity';
import { IsAdminAuthGuard } from 'src/guards';
import { Serialize } from 'src/interceptors';

import { PoliciesService } from './policies.service';
import { AdminPoliciesDTO, UpdatePolicyDTO } from './dtos';

@Controller('admin/policies')
@UseGuards(IsAdminAuthGuard)
@Serialize(AdminPoliciesDTO)
export class PoliciesAdminController {
  constructor(private policiesService: PoliciesService) {}

  @Get()
  getAll() {
    return this.policiesService.getLatestAll();
  }

  @Put(':type')
  update(@Param('type', new ParseEnumPipe(policyTypes)) type: PolicyType, @Body() dto: UpdatePolicyDTO) {
    return this.policiesService.updatePolicy(type, dto);
  }

  @Get(':type/history')
  history(@Param('type', new ParseEnumPipe(policyTypes)) type: PolicyType) {
    return this.policiesService.getHistory(type);
  }
}
