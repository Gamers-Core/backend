import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MediaModule } from 'src/media/media.module';
import { Variant } from 'src/products/entities/variant.entity';

import { AdminFeaturedVariantsController } from './admin-featured-variants.controller';
import { FeaturedVariant } from './entities/featured-variant.entity';
import { FeaturedVariantsController } from './featured-variants.controller';
import { FeaturedVariantsService } from './featured-variants.service';

@Module({
  imports: [TypeOrmModule.forFeature([FeaturedVariant, Variant]), MediaModule],
  controllers: [FeaturedVariantsController, AdminFeaturedVariantsController],
  providers: [FeaturedVariantsService],
})
export class FeaturedVariantsModule {}
