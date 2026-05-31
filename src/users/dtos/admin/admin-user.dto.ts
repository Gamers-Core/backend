import { Expose } from 'class-transformer';

import { FullUserDTO } from '../full-user.dto';

export class AdminUserDTO extends FullUserDTO {
  @Expose()
  ordersCount: number;
}
