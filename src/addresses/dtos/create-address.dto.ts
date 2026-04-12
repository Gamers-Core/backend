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
  cityId: string;

  @IsString()
  nameAr: string;
}
