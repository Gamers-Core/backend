import { Expose } from 'class-transformer';
import { FindOptionsSelect } from 'typeorm';

import { Address } from 'src/addresses/entities/address.entity';

import { AddressDTO } from '../user/address.dto';

export class AdminAddressDTO extends AddressDTO {
  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export const adminAddressSelect: FindOptionsSelect<Address> = {};
