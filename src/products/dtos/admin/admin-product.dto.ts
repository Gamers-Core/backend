import { Expose, Type } from 'class-transformer';

import { AdminBrandDTO } from 'src/brands/dtos/admin-brand.dto';
import { AdminCategoryDTO } from 'src/categories/dtos/admin-category.dto';
import type { Localized } from 'src/i18n/types';
import { AdminMediaAttachmentDTO } from 'src/media/dtos/admin-media-attachment.dto';

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
