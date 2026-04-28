import { Expose, Type } from 'class-transformer';

import { Localize } from 'src/i18n/decorators/localize.decorator';
import { MediaAttachmentDTO } from 'src/media/dtos/media-attachment.dto';

export class BrandDTO {
  @Expose()
  id: number;

  @Expose()
  @Localize()
  name: string;

  @Expose()
  @Type(() => MediaAttachmentDTO)
  image: MediaAttachmentDTO;
}
