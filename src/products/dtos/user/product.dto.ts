import { Expose, Type } from 'class-transformer';

import { Localize } from 'src/i18n';
import { MediaAttachmentDTO } from 'src/media';

import { ProductBrandDTO } from './product-brand.dto';
import { ProductVariantDTO } from './product-variant.dto';

export class ProductDTO {
  @Expose()
  id: number;

  @Expose()
  @Localize()
  title: string;

  @Expose()
  @Localize()
  description: string;

  @Expose()
  @Type(() => ProductVariantDTO)
  variants: ProductVariantDTO[];

  @Expose()
  @Type(() => MediaAttachmentDTO)
  media: MediaAttachmentDTO[];

  @Expose()
  @Type(() => ProductBrandDTO)
  brand: ProductBrandDTO | null;
}
