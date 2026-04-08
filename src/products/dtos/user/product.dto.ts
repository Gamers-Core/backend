import { Expose, Type } from 'class-transformer';

import { Localize } from 'src/i18n';
import { MediaAttachmentDTO } from 'src/media';
import { BrandDTO } from 'src/brands';
import { CategoryDTO } from 'src/categories';

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
  @Type(() => MediaAttachmentDTO)
  media: MediaAttachmentDTO[];

  @Expose()
  @Type(() => BrandDTO)
  brand: BrandDTO;

  @Expose()
  @Type(() => CategoryDTO)
  category: CategoryDTO;
}
