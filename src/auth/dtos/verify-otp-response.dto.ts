import { Expose, Type } from 'class-transformer';

import { BasicUserDTO } from 'src/users';

export class VerifyOtpResponseDTO {
  @Expose()
  @Type(() => BasicUserDTO)
  user: BasicUserDTO;

  @Expose()
  isNewUser: boolean;
}
