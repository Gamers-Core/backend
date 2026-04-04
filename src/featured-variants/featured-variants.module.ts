import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeaturedVariant, Variant } from 'src/entity';
import { MediaModule } from 'src/media';

import { AdminFeaturedVariantsController } from './admin-featured-variants.controller';
import { FeaturedVariantsController } from './featured-variants.controller';
import { FeaturedVariantsService } from './featured-variants.service';

@Module({
  imports: [TypeOrmModule.forFeature([FeaturedVariant, Variant]), MediaModule],
  controllers: [FeaturedVariantsController, AdminFeaturedVariantsController],
  providers: [FeaturedVariantsService],
})
export class FeaturedVariantsModule {}
