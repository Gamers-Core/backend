import { Expose, Type } from 'class-transformer';
import { FindOptionsSelect } from 'typeorm';

import { Localize } from 'src/i18n/decorators/localize.decorator';
import { MediaDTO } from 'src/media/dtos/user/media.dto';
import { Product } from 'src/products/entities/product.entity';

class SimpleVariantDTO {
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
  stock: number;

  @Expose()
  @Type(() => MediaDTO)
  image: MediaDTO | null;
}

export class SimpleProductDTO {
  @Expose()
  id: number;

  @Expose()
  @Localize()
  name: string;

  @Expose()
  @Type(() => SimpleVariantDTO)
  variants: SimpleVariantDTO[];
}

export const simpleProductSelect: FindOptionsSelect<Product> = {
  id: true,
  name: true,
  variants: {
    id: true,
    externalId: true,
    name: true,
    price: true,
    compareAt: true,
    stock: true,
    image: true,
  },
};
