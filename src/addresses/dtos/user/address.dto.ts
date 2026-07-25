import { Expose } from 'class-transformer';
import { FindOptionsSelect } from 'typeorm';

import { Address } from 'src/addresses/entities/address.entity';

export class AddressDTO {
  @Expose()
  id: number;

  @Expose()
  phoneNumber: string;

  @Expose()
  detailedAddress: string;

  @Expose()
  districtName: string;

  @Expose()
  cityName: string;

  @Expose()
  cityDropOff: string;

  @Expose()
  nameAr: string;

  @Expose()
  isDefault: boolean;
}

export const AddressSelect: FindOptionsSelect<Address> = {
  id: true,
  phoneNumber: true,
  detailedAddress: true,
  districtName: true,
  cityName: true,
  cityDropOff: true,
  nameAr: true,
  isDefault: true,
};
