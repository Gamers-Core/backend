import { Body, Controller, Get, Param, ParseEnumPipe, Put, UseGuards } from '@nestjs/common';

import { IsAdminAuthGuard } from 'src/auth/guards/is-admin-auth.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';

import { policyTypes } from '../const';
import { AdminPoliciesDTO, AdminPolicyDTO } from '../dtos/admin/admin-policies.dto';
import { UpdatePolicyDTO } from '../dtos/admin/update-policy.dto';
import { PoliciesService } from '../policies.service';
import type { PolicyType } from '../types';

@Controller('admin/policies')
@UseGuards(IsAdminAuthGuard)
export class AdminPoliciesController {
  constructor(private policiesService: PoliciesService) {}

  @Get()
  @Serialize(AdminPoliciesDTO)
  getAll() {
    return this.policiesService.getAll();
  }

  @Serialize(AdminPolicyDTO)
  @Get(':type/history')
  getHistory(@Param('type', new ParseEnumPipe(policyTypes)) type: PolicyType) {
    return this.policiesService.getHistory(type);
  }

  @Put(':type')
  @Serialize(AdminPolicyDTO)
  update(@Param('type', new ParseEnumPipe(policyTypes)) type: PolicyType, @Body() dto: UpdatePolicyDTO) {
    return this.policiesService.update(type, dto);
  }
}
