import { IsBoolean, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class CreateAddressDTO {
  @IsString()
  @IsPhoneNumber('EG')
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber('EG')
  secondaryPhoneNumber: string | null;

  @IsString()
  detailedAddress: string;

  @IsString()
  districtId: string;

  @IsString()
  cityId: string;

  @IsString()
  nameAr: string;

  @IsOptional()
  @IsBoolean()
  isWorkAddress?: boolean;
}
