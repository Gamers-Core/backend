import { Controller, Get } from '@nestjs/common';

import { Public } from 'src/auth';
import { Serialize } from 'src/interceptors';

import { FeaturedVariantDTO } from './dtos';
import { FeaturedVariantsService } from './featured-variants.service';

@Controller('featured-variants')
@Public()
export class FeaturedVariantsController {
  constructor(private readonly service: FeaturedVariantsService) {}

  @Get()
  @Serialize(FeaturedVariantDTO)
  getAll() {
    return this.service.getAll();
  }
}
