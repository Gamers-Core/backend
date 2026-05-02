import { Controller, Get } from '@nestjs/common';

import { Public } from 'src/auth/decorators/public.decorator';
import { Serialize } from 'src/interceptors/serialize.interceptor';

import { PoliciesDTO } from '../dtos/user/policies.dto';
import { PoliciesService } from '../policies.service';

@Controller('policies')
@Serialize(PoliciesDTO)
@Public()
export class PoliciesController {
  constructor(private policiesService: PoliciesService) {}

  @Get()
  getAll() {
    return this.policiesService.getAll();
  }
}
