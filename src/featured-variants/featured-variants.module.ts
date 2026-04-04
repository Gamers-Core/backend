import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeaturedVariant, Variant } from 'src/entity';

import { AdminFeaturedVariantsController } from './admin-featured-variants.controller';
import { FeaturedVariantsController } from './featured-variants.controller';
import { FeaturedVariantsService } from './featured-variants.service';

@Module({
  imports: [TypeOrmModule.forFeature([FeaturedVariant, Variant])],
  controllers: [FeaturedVariantsController, AdminFeaturedVariantsController],
  providers: [FeaturedVariantsService],
})
export class FeaturedVariantsModule {}
