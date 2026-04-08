import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

import { Public } from 'src/auth';
import { Serialize } from 'src/interceptors';

import { BrandDTO } from './dtos';
import { BrandsService } from './brands.service';

@Controller('brands')
@Public()
@Serialize(BrandDTO)
export class BrandsController {
  constructor(private readonly service: BrandsService) {}

  @Get()
  getAll() {
    return this.service.getAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOne(id);
  }
}
