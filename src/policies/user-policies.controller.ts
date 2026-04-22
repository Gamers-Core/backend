import { Controller, Get } from '@nestjs/common';

import { Serialize } from 'src/interceptors';
import { Public } from 'src/auth';

import { PoliciesService } from './policies.service';
import { PoliciesDTO } from './dtos';

@Controller('policies')
@Serialize(PoliciesDTO)
@Public()
export class PoliciesController {
  constructor(private policiesService: PoliciesService) {}

  @Get()
  getAll() {
    return this.policiesService.getLatestAll();
  }
}
