import { Expose } from 'class-transformer';
import { FindOptionsSelect } from 'typeorm';

import { Address } from 'src/addresses/entities/address.entity';

export class AddressDTO {
  @Expose()
  id: number;

  @Expose()
  phoneNumber: string;

  @Expose()
  secondaryPhoneNumber: string | null;

  @Expose()
  detailedAddress: string;

  @Expose()
  districtName: string;

  @Expose()
  districtId: string;

  @Expose()
  cityName: string;

  @Expose()
  cityId: string;

  @Expose()
  cityDropOff: string;

  @Expose()
  nameAr: string;

  @Expose()
  isDefault: boolean;

  @Expose()
  isWorkAddress: boolean;
}

export const addressSelect: FindOptionsSelect<Address> = {
  id: true,
  phoneNumber: true,
  secondaryPhoneNumber: true,
  detailedAddress: true,
  districtId: true,
  districtName: true,
  cityId: true,
  cityName: true,
  cityDropOff: true,
  nameAr: true,
  isDefault: true,
  isWorkAddress: true,
};
