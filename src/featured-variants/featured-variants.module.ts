import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/auth/auth.module';
import { MediaModule } from 'src/media/media.module';
import { Variant } from 'src/products/entities/variant.entity';

import { AdminFeaturedVariantsController } from './controllers/admin-featured-variants.controller';
import { FeaturedVariantsController } from './controllers/featured-variants.controller';
import { FeaturedVariant } from './entities/featured-variant.entity';
import { FeaturedVariantsService } from './featured-variants.service';

@Module({
  imports: [TypeOrmModule.forFeature([FeaturedVariant, Variant]), MediaModule, AuthModule],
  controllers: [FeaturedVariantsController, AdminFeaturedVariantsController],
  providers: [FeaturedVariantsService],
})
export class FeaturedVariantsModule {}
