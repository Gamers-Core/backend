import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

import { Public } from 'src/auth/decorators/public.decorator';
import { Serialize } from 'src/interceptors/serialize.interceptor';

import { BrandsService } from './brands.service';
import { BrandDTO } from './dtos/brand.dto';

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
