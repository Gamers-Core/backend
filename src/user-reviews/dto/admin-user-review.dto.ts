import { Expose, Type } from 'class-transformer';

import { AdminMediaAttachmentDTO } from 'src/media/dtos/admin-media-attachment.dto';

export class AdminUserReviewDTO {
  @Expose()
  id: number;

  @Expose()
  position: number;

  @Expose()
  facebookURL: string;

  @Expose()
  @Type(() => AdminMediaAttachmentDTO)
  image: AdminMediaAttachmentDTO;
}
