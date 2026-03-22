import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Media, MediaAttachment, Product } from 'src/entity';
import { ProductVariantEntity } from 'src/entity/product';
import { MediaModule } from 'src/media';

import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { VariantsService } from './variants.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Media, MediaAttachment, ProductVariantEntity]), MediaModule],
  controllers: [ProductsController],
  providers: [ProductsService, VariantsService],
  exports: [VariantsService],
})
export class ProductsModule {}
