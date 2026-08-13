import { Expose, Type } from 'class-transformer';
import { FindOptionsSelect } from 'typeorm';

import { Localize } from 'src/i18n/decorators/localize.decorator';
import { MediaDTO } from 'src/media/dtos/user/media.dto';
import { Product } from 'src/products/entities/product.entity';

class BrandDTO {
  @Expose()
  id: number;

  @Expose()
  @Localize()
  name: string;
}

class CategoryDTO {
  @Expose()
  id: number;

  @Expose()
  @Localize()
  name: string;
}

class VariantDTO {
  @Expose()
  externalId: string;

  @Expose()
  @Localize()
  name: string;

  @Expose()
  price: number;

  @Expose()
  compareAt: number | null;

  @Expose()
  @Type(() => MediaDTO)
  image: MediaDTO | null;
}

export class ProductRecommendationDTO {
  @Expose()
  id: number;

  @Expose()
  @Localize()
  name: string;

  @Expose()
  @Type(() => VariantDTO)
  variants: VariantDTO[];

  @Expose()
  @Type(() => BrandDTO)
  brand: BrandDTO;

  @Expose()
  @Type(() => CategoryDTO)
  category: CategoryDTO;
}

export const productRecommendationSelect: FindOptionsSelect<Product> = {
  id: true,
  name: true,
  variants: {
    id: true,
    externalId: true,
    name: true,
    price: true,
    compareAt: true,
    image: true,

    position: true,
    stock: true,
    isActive: true,
    deletedAt: true,
  },
  brand: { id: true, name: true },
  category: { id: true, name: true },
};
