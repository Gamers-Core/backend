import { Expose, Type } from 'class-transformer';

import { MediaDTO } from 'src/media/dtos/user/media.dto';

export class UserReviewDTO {
  @Expose()
  facebookURL: string;

  @Expose()
  @Type(() => MediaDTO)
  image: MediaDTO | null;
}
