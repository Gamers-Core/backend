import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Media, MediaAttachment, Product } from 'src/entity';
import { ProductVariant } from 'src/entity/product';
import { MediaModule } from 'src/media';

import { ProductsAdminController } from './products-admin.controller';
import { ProductsUserController } from './products-user.controller';
import { ProductsService } from './products.service';
import { VariantsService } from './variants.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Media, MediaAttachment, ProductVariant]), MediaModule],
  controllers: [ProductsUserController, ProductsAdminController],
  providers: [ProductsService, VariantsService],
  exports: [VariantsService],
})
export class ProductsModule {}
