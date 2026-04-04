import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Media, MediaAttachment, Product } from 'src/entity';
import { Variant } from 'src/entity/product';
import { MediaModule } from 'src/media';

import { AdminProductsController, AdminVariantsController, UserProductsController } from './controllers';
import { InventoryService, ProductsService, VariantsService } from './services';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Media, MediaAttachment, Variant]), MediaModule],
  controllers: [UserProductsController, AdminProductsController, AdminVariantsController],
  providers: [ProductsService, VariantsService, InventoryService],
  exports: [InventoryService],
})
export class ProductsModule {}
