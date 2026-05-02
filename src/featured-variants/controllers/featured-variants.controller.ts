import { Controller, Get } from '@nestjs/common';

import { Public } from 'src/auth/decorators/public.decorator';
import { Serialize } from 'src/interceptors/serialize.interceptor';

import { FeaturedVariantDTO } from '../dtos/user/featured-variant.dto';
import { FeaturedVariantsService } from '../featured-variants.service';

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
