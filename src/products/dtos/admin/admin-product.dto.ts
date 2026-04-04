import { Expose, Type } from 'class-transformer';

import { AdminMediaAttachmentDTO } from 'src/media';
import type { Localized } from 'src/i18n';

import { AdminBrandDTO } from './admin-brand.dto';
import { AdminVariantDTO } from './admin-variant.dto';

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
  @Type(() => AdminVariantDTO)
  variants: AdminVariantDTO[];

  @Expose()
  @Type(() => AdminMediaAttachmentDTO)
  media: AdminMediaAttachmentDTO[];

  @Expose()
  @Type(() => AdminBrandDTO)
  brand: AdminBrandDTO | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
