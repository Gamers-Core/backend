import { Expose, Type } from 'class-transformer';

import { type Localized } from 'src/i18n';
import { MediaAttachmentDTO } from 'src/media';

export class AdminBrandDTO {
  @Expose()
  id: number;

  @Expose()
  name: Localized;

  @Expose()
  @Type(() => MediaAttachmentDTO)
  image: MediaAttachmentDTO;
}
