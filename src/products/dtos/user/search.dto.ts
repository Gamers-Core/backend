import { Exclude, Expose, Transform, Type } from 'class-transformer';

import { MediaDTO } from 'src/media/dtos/user/media.dto';
import { ProductMediaDTO } from 'src/media/dtos/user/product-media.dto';
import { Variant } from 'src/products/entities/variant.entity';

import { ProductDTO } from './product.dto';
import { VariantDTO } from './variant.dto';

export class SearchDTO extends ProductDTO {
  @Exclude()
  declare variants: VariantDTO[];

  @Exclude()
  declare description: string;

  @Exclude()
  declare media: ProductMediaDTO[];

  @Expose()
  @Transform(({ obj }) => obj.variants[0].image)
  @Type(() => MediaDTO)
  image: MediaDTO;

  @Expose()
  @Transform(({ obj }) => {
    const variants = obj.variants as Variant[];

    return variants.some(({ stock }) => stock > 0);
  })
  hasStock: boolean;

  @Expose()
  @Transform(({ obj }) => {
    const variants = obj.variants as Variant[];

    const prices = variants.map(({ price }) => price);
    return { min: Math.min(...prices), max: Math.max(...prices), sale: variants.some(({ compareAt }) => !!compareAt) };
  })
  price: { min: number; max: number; sale: boolean };
}
