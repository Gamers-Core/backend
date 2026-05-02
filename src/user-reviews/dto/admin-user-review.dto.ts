import { Expose, Type } from 'class-transformer';

import { MediaDTO } from 'src/media/dtos/media.dto';

export class AdminUserReviewDTO {
  @Expose()
  id: number;

  @Expose()
  position: number;

  @Expose()
  facebookURL: string;

  @Expose()
  @Type(() => MediaDTO)
  image: MediaDTO | null;
}
