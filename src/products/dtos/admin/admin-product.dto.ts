import { Expose, Type } from 'class-transformer';

import { AdminBrandDTO } from 'src/brands/dtos/admin/admin-brand.dto';
import { AdminCategoryDTO } from 'src/categories/dtos/admin/admin-category.dto';
import type { Localized } from 'src/i18n/types';
import { AdminProductMediaDTO } from 'src/media/dtos/admin/admin-product-media.dto';
import type { ProductStatus } from 'src/products/types';

import { AdminVariantDTO } from './admin-variant.dto';

export class AdminProductDTO {
  @Expose()
  id: number;

  @Expose()
  name: Localized;

  @Expose()
  title: Localized;

  @Expose()
  description: Localized;

  @Expose()
  status: ProductStatus;

  @Expose()
  @Type(() => AdminVariantDTO)
  variants: AdminVariantDTO[];

  @Expose()
  @Type(() => AdminProductMediaDTO)
  media: AdminProductMediaDTO[];

  @Expose()
  @Type(() => AdminBrandDTO)
  brand: AdminBrandDTO;

  @Expose()
  @Type(() => AdminCategoryDTO)
  category: AdminCategoryDTO;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
