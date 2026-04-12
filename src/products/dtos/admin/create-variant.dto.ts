import { IsArray, IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { IsGreaterThan } from 'src/common';

import { IsLocalized, i18nKeyValidator, type Localized } from 'src/i18n';

export class CreateVariantDTO {
  @IsLocalized({ message: i18nKeyValidator('isLocalized') })
  name: Localized;

  @IsOptional({ message: i18nKeyValidator('conditionalValidation') })
  @IsBoolean({ message: i18nKeyValidator('isBoolean') })
  isActive?: boolean;

  @IsInt({ message: i18nKeyValidator('isInt') })
  @Min(0, { message: i18nKeyValidator('min') })
  stock: number;

  @IsInt({ message: i18nKeyValidator('isInt') })
  @Min(0, { message: i18nKeyValidator('min') })
  price: number;

  @IsInt({ message: i18nKeyValidator('isInt') })
  @Min(0, { message: i18nKeyValidator('min') })
  costPerItem: number;

  @IsOptional({ message: i18nKeyValidator('conditionalValidation') })
  @IsInt({ message: i18nKeyValidator('isInt') })
  @IsGreaterThan('price', { message: i18nKeyValidator('isGreaterThan') })
  compareAt: number | null;

  @IsArray({ message: i18nKeyValidator('isArray') })
  @IsInt({ each: true, message: i18nKeyValidator('isInt') })
  @Min(1, { each: true, message: i18nKeyValidator('min') })
  mediaIds: number[];
}
