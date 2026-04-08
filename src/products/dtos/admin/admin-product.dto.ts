import { Expose, Type } from 'class-transformer';

import { AdminMediaAttachmentDTO } from 'src/media';
import type { Localized } from 'src/i18n';
import { AdminBrandDTO } from 'src/brands';
import { AdminCategoryDTO } from 'src/categories';

import { AdminVariantDTO } from './admin-variant.dto';

export class AdminProductDTO {
  @Expose()
  id: number;

  @Expose()
  name: Localized;

  @Expose()
  title: Localized;

  @Expose()
  description: Localized;

  @Expose()
  status: string;

  @Expose()
  @Type(() => AdminVariantDTO)
  variants: AdminVariantDTO[];

  @Expose()
  @Type(() => AdminMediaAttachmentDTO)
  media: AdminMediaAttachmentDTO[];

  @Expose()
  @Type(() => AdminBrandDTO)
  brand: AdminBrandDTO;

  @Expose()
  @Type(() => AdminCategoryDTO)
  category: AdminCategoryDTO;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
