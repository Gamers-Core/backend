import { Expose, Type } from 'class-transformer';

import { BasicUserDTO } from 'src/users';
import { CartDTO } from 'src/cart';

import { type AuthPurpose } from '../types';

export class VerifyOtpResponseDTO {
  @Expose()
  @Type(() => BasicUserDTO)
  user: BasicUserDTO;

  @Expose()
  @Type(() => CartDTO)
  cart: CartDTO;

  @Expose()
  isNewUser: boolean;

  @Expose()
  purpose: AuthPurpose;
}
