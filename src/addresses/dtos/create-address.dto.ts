import { IsPhoneNumber, IsString } from 'class-validator';

export class CreateAddressDTO {
  @IsString()
  @IsPhoneNumber('EG')
  phoneNumber: string;

  @IsString()
  detailedAddress: string;

  @IsString()
  districtId: string;

  @IsString()
  districtName: string;

  @IsString()
  cityId: string;

  @IsString()
  cityName: string;

  @IsString()
  nameAr: string;
}
