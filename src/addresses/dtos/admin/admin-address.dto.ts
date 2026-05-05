import { Expose } from 'class-transformer';

import { AddressDTO } from '../user/address.dto';

export class AdminAddressDTO extends AddressDTO {
  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
