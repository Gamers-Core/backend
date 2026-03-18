import { Controller, Get, Param } from '@nestjs/common';

import { Serialize } from 'src/interceptors';

import { CityDTO, DistrictDTO } from './dtos';
import { BostaService } from './bosta.service';

@Controller()
export class BostaController {
  constructor(private readonly bostaService: BostaService) {}

  @Serialize(CityDTO)
  @Get('address/cities')
  getCities() {
    return this.bostaService.getCities();
  }

  @Serialize(DistrictDTO)
  @Get('address/cities/:id/districts')
  getDistricts(@Param('id') id: string) {
    return this.bostaService.getDistricts(id);
  }
}
