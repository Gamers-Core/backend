import { Expose } from 'class-transformer';

export class AddressDTO {
  @Expose()
  id: number;

  @Expose()
  phoneNumber: string;

  @Expose()
  detailedAddress: string;

  @Expose()
  districtId: string;

  @Expose()
  districtName: string;

  @Expose()
  cityId: string;

  @Expose()
  cityName: string;

  @Expose()
  nameAr: string;

  @Expose()
  isDefault: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
