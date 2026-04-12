import { Expose, Type } from 'class-transformer';

import { BasicUserDTO } from 'src/users';

import { type AuthPurpose } from '../types';

export class VerifyOtpResponseDTO {
  @Expose()
  @Type(() => BasicUserDTO)
  user: BasicUserDTO;

  @Expose()
  isNewUser: boolean;

  @Expose()
  purpose: AuthPurpose;
}
