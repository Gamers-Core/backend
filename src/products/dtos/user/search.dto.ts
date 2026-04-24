import { Exclude, Expose, Transform } from 'class-transformer';

import { ProductDTO } from './product.dto';
import { VariantDTO } from './variant.dto';
import { Variant } from 'src/entity';

export class SearchDTO extends ProductDTO {
  @Exclude()
  declare variants: VariantDTO[];

  @Exclude()
  declare description: string;

  @Expose()
  @Transform(({ obj }) => {
    const variants = obj.variants as Variant[];

    return variants.some(({ stock }) => stock > 0);
  })
  hasStock: boolean;

  @Expose()
  @Transform(({ obj }) => {
    const variants = obj.variants as Variant[];

    return Math.min(...variants.map(({ price }) => price));
  })
  minPrice: number;

  @Expose()
  @Transform(({ obj }) => {
    const variants = obj.variants as Variant[];

    return Math.max(...variants.map(({ price }) => price));
  })
  maxPrice: number;
}
