import { Exclude, Expose, Transform } from 'class-transformer';

import { MediaAttachmentDTO } from 'src/media/dtos/media-attachment.dto';
import { MediaAttachment } from 'src/media/entities/media-attachment.entity';
import { Product } from 'src/products/entities/product.entity';
import { Variant } from 'src/products/entities/variant.entity';

import { ProductDTO } from './product.dto';
import { VariantDTO } from './variant.dto';

export class SearchDTO extends ProductDTO {
  @Exclude()
  declare variants: VariantDTO[];

  @Exclude()
  declare description: string;

  @Exclude()
  declare media: MediaAttachmentDTO[];

  @Expose()
  @Transform(({ obj }) => {
    const product = obj as Product & { media: MediaAttachment[] };
    const mainVariant = product.variants[0] as Variant & { media: MediaAttachment[] };

    return mainVariant.media?.[0]?.media?.url ?? product.media?.[0]?.media?.url;
  })
  imageURL: string;

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
