import { Expose, Type } from 'class-transformer';

import { Localize } from 'src/i18n';
import { MediaAttachmentDTO } from 'src/media';

export class VariantDTO {
  @Expose()
  externalId: string;

  @Expose()
  @Localize()
  name: string;

  @Expose()
  price: number;

  @Expose()
  compareAt: number | null;

  @Expose()
  stock: number;

  @Expose()
  @Type(() => MediaAttachmentDTO)
  media: MediaAttachmentDTO[];
}
