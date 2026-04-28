import { Expose, Type } from 'class-transformer';

import type { Localized } from 'src/i18n/types';
import { AdminMediaAttachmentDTO } from 'src/media/dtos/admin-media-attachment.dto';

export class AdminVariantDTO {
  @Expose()
  id: number;

  @Expose()
  externalId: string;

  @Expose()
  name: Localized | null;

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
