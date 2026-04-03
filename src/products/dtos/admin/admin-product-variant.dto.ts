import { Expose, Type } from 'class-transformer';

import type { Localized } from 'src/i18n';

import { AdminMediaAttachmentDTO } from 'src/media';

export class AdminProductVariantDTO {
  @Expose()
  id: number;

  @Expose()
  externalId: string;

  @Expose()
  name: Localized | null;

  @Expose()
  isDefault: boolean;

  @Expose()
  isActive: boolean;

  @Expose()
  stock: number;

  @Expose()
  price: number;

  @Expose()
  costPerItem: number;

  @Expose()
  compareAt: number | null;

  @Expose()
  @Type(() => AdminMediaAttachmentDTO)
  media: AdminMediaAttachmentDTO[];
}
