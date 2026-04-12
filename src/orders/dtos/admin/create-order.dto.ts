import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { i18nKeyValidator } from 'src/i18n';

import { CheckoutOrderDTO } from '../user';

class VariantDTO {
  @IsUUID(undefined, { message: i18nKeyValidator('isUuid') })
  externalId: string;

  @IsInt({ message: i18nKeyValidator('isInt') })
  @Min(1, { message: i18nKeyValidator('min') })
  quantity: number;
}

export class CreateOrderDTO extends CheckoutOrderDTO {
  @ArrayNotEmpty({ message: i18nKeyValidator('arrayNotEmpty') })
  @ValidateNested({ each: true, message: i18nKeyValidator('nestedValidation') })
  @Type(() => VariantDTO)
  variants: VariantDTO[];

  @IsInt({ message: i18nKeyValidator('isInt') })
  @Min(1, { message: i18nKeyValidator('min') })
  userId: number;
}
