import { Expose, Type } from 'class-transformer';

import { AdminMediaDTO } from 'src/media/dtos/admin-media.dto';

export class AdminUserReviewDTO {
  @Expose()
  id: number;

  @Expose()
  position: number;

  @Expose()
  facebookURL: string;

  @Expose()
  @Type(() => AdminMediaDTO)
  image: AdminMediaDTO | null;
}
