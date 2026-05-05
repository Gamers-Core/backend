import { Expose, Type } from 'class-transformer';

import { CartDTO } from 'src/cart/dtos/cart.dto';
import { BasicUserDTO } from 'src/users/dtos/basic-user.dto';

import { type AuthPurpose } from '../types';

export class VerifyOTPResponseDTO {
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
