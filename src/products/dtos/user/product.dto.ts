import { Expose, Type } from 'class-transformer';

import { BrandDTO } from 'src/brands/dtos/brand.dto';
import { CategoryDTO } from 'src/categories/dtos/category.dto';
import { Localize } from 'src/i18n/decorators/localize.decorator';
import { MediaAttachmentDTO } from 'src/media/dtos/media-attachment.dto';

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
