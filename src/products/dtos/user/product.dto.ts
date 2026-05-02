import { Expose, Type } from 'class-transformer';

import { BrandDTO } from 'src/brands/dtos/user/brand.dto';
import { CategoryDTO } from 'src/categories/dtos/user/category.dto';
import { Localize } from 'src/i18n/decorators/localize.decorator';
import { ProductMediaDTO } from 'src/media/dtos/user/product-media.dto';

import { VariantDTO } from './variant.dto';

export class ProductDTO {
  @Expose()
  id: number;

  @Expose()
  @Localize()
  name: string;

  @Expose()
  @Localize()
  title: string;

  @Expose()
  @Localize()
  description: string;

  @Expose()
  @Type(() => VariantDTO)
  variants: VariantDTO[];

  @Expose()
  @Type(() => ProductMediaDTO)
  media: ProductMediaDTO[];

  @Expose()
  @Type(() => BrandDTO)
  brand: BrandDTO;

  @Expose()
  @Type(() => CategoryDTO)
  category: CategoryDTO;
}
