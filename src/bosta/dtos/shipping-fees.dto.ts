import { IsOptional, IsString } from 'class-validator';
import { i18nKeyValidator } from 'src/i18n';

export class ShippingFeesDTO {
  @IsString({ message: i18nKeyValidator('isString') })
  cod: string;

  @IsString({ message: i18nKeyValidator('isString') })
  dropOffCity: string;

  @IsString({ message: i18nKeyValidator('isString') })
  @IsOptional({ message: i18nKeyValidator('conditionalValidation') })
  pickupCity?: string;
}
