import { Expose, Type } from 'class-transformer';

import type { Localized } from 'src/i18n/types';
import { MediaAttachmentDTO } from 'src/media/dtos/media-attachment.dto';

export class AdminBrandDTO {
  @Expose()
  id: number;

  @Expose()
  name: Localized;

  @Expose()
  @Type(() => MediaAttachmentDTO)
  image: MediaAttachmentDTO;
}
