import { Expose, Type } from 'class-transformer';
import { FindOptionsSelect } from 'typeorm';

import { FeaturedVariant } from 'src/featured-variants/entities/featured-variant.entity';
import { Localize } from 'src/i18n/decorators/localize.decorator';
import { MediaDTO } from 'src/media/dtos/user/media.dto';

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

class ProductDTO {
  @Expose()
  id: number;

  @Expose()
  @Localize()
  name: string;

  @Expose()
  @Type(() => BrandDTO)
  brand: BrandDTO;

  @Expose()
  @Type(() => CategoryDTO)
  category: CategoryDTO;
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

  @Expose()
  @Type(() => ProductDTO)
  product: ProductDTO;
}

export class FeaturedVariantDTO {
  @Expose()
  @Localize()
  title: string;

  @Expose()
  @Type(() => VariantDTO)
  variant: VariantDTO;
}

export const featuredVariantSelect: FindOptionsSelect<FeaturedVariant> = {
  title: true,
  variant: {
    externalId: true,
    name: true,
    price: true,
    compareAt: true,
    image: true,
    product: {
      id: true,
      name: true,
      brand: { id: true, name: true },
      category: { id: true, name: true },
    },
  },
};
