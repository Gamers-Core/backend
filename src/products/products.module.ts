import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Media } from 'src/media/entities/media.entity';
import { ProductMedia } from 'src/media/entities/product-media.entity';
import { MediaModule } from 'src/media/media.module';

import { AdminProductsController } from './controllers/admin-products.controller';
import { AdminVariantsController } from './controllers/admin-variants.controller';
import { UserProductsController } from './controllers/user-products.controller';
import { Product } from './entities/product.entity';
import { Variant } from './entities/variant.entity';
import { InventoryService } from './services/inventory.service';
import { ProductsService } from './services/products.service';
import { VariantsService } from './services/variants.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Media, ProductMedia, Variant]), MediaModule],
  controllers: [UserProductsController, AdminProductsController, AdminVariantsController],
  providers: [ProductsService, VariantsService, InventoryService],
  exports: [InventoryService],
})
export class ProductsModule {}
