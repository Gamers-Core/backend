import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { i18nKeyValidator } from 'src/i18n';

import { paymentMethods, type PaymentMethod } from 'src/entity';

export class CheckoutOrderDTO {
  @IsString({ message: i18nKeyValidator('isString') })
  @IsIn(paymentMethods, { message: i18nKeyValidator('isIn') })
  paymentMethod: PaymentMethod;

  @IsInt({ message: i18nKeyValidator('isInt') })
  @Min(1, { message: i18nKeyValidator('min') })
  addressId: number;

  @IsOptional({ message: i18nKeyValidator('conditionalValidation') })
  @IsString({ message: i18nKeyValidator('isString') })
  note?: string;

  @IsOptional({ message: i18nKeyValidator('conditionalValidation') })
  @IsBoolean({ message: i18nKeyValidator('isBoolean') })
  canOpenPackage?: boolean;
}
