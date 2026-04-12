import { IsString, MaxLength } from 'class-validator';
import { i18nKeyValidator } from 'src/i18n';

export class UpdateOrderShippingDTO {
  @IsString({ message: i18nKeyValidator('isString') })
  @MaxLength(255, { message: i18nKeyValidator('maxLength') })
  trackingNumber: string;
}
