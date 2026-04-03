import { Expose, Type } from 'class-transformer';

import { Localize } from 'src/i18n';
import { MediaAttachmentDTO } from 'src/media';

export class ProductVariantDTO {
  @Expose()
  externalId: string;

  @Expose()
  @Localize()
  name: string | null;

  @Expose()
  isDefault: boolean;

  @Expose()
  price: number;

  @Expose()
  costPerItem: number;

  @Expose()
  compareAt: number | null;

  @Expose()
  @Type(() => MediaAttachmentDTO)
  media: MediaAttachmentDTO[];
}
