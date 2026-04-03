import { Expose, Type } from 'class-transformer';

import { AdminMediaAttachmentDTO } from 'src/media';
import type { Localized } from 'src/i18n';

import { AdminProductBrandDTO } from './admin-product-brand.dto';
import { AdminProductVariantDTO } from './admin-product-variant.dto';

export class AdminProductDTO {
  @Expose()
  id: number;

  @Expose()
  title: Localized;

  @Expose()
  description: Localized;

  @Expose()
  status: string;

  @Expose()
  @Type(() => AdminProductVariantDTO)
  variants: AdminProductVariantDTO[];

  @Expose()
  @Type(() => AdminMediaAttachmentDTO)
  media: AdminMediaAttachmentDTO[];

  @Expose()
  @Type(() => AdminProductBrandDTO)
  brand: AdminProductBrandDTO | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
