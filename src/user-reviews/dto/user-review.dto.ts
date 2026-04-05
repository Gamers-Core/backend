import { Expose, Type } from 'class-transformer';

import { MediaAttachmentDTO } from 'src/media';

export class UserReviewDTO {
  @Expose()
  facebookURL: string;

  @Expose()
  @Type(() => MediaAttachmentDTO)
  image: MediaAttachmentDTO;
}
