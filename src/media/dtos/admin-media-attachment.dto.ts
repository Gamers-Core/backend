import { Expose, Transform } from 'class-transformer';

import { MediaAttachmentDTO } from './media-attachment.dto';

export class AdminMediaAttachmentDTO extends MediaAttachmentDTO {
  @Expose()
  @Transform(({ obj, value }) => obj.media?.id ?? obj.id ?? value)
  id: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
