import { Expose, Type } from 'class-transformer';

import { MediaAttachmentDTO } from 'src/media/dtos/media-attachment.dto';

export class UserReviewDTO {
  @Expose()
  facebookURL: string;

  @Expose()
  @Type(() => MediaAttachmentDTO)
  image: MediaAttachmentDTO;
}
