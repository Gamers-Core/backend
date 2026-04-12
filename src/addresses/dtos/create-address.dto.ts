import { IsPhoneNumber, IsString } from 'class-validator';
import { i18nKeyValidator } from 'src/i18n';

export class CreateAddressDTO {
  @IsString({ message: i18nKeyValidator('isString') })
  @IsPhoneNumber('EG', { message: i18nKeyValidator('isPhoneNumber') })
  phoneNumber: string;

  @IsString({ message: i18nKeyValidator('isString') })
  detailedAddress: string;

  @IsString({ message: i18nKeyValidator('isString') })
  districtId: string;

  @IsString({ message: i18nKeyValidator('isString') })
  cityId: string;

  @IsString({ message: i18nKeyValidator('isString') })
  nameAr: string;
}
