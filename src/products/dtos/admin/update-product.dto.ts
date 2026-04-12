import { IsArray, IsIn, IsInt, IsOptional, Min } from 'class-validator';

import { productStatuses } from 'src/entity';
import { type ProductStatus } from 'src/entity';
import { IsLocalized, i18nKeyValidator, type Localized } from 'src/i18n';

export class UpdateProductDTO {
  @IsOptional({ message: i18nKeyValidator('conditionalValidation') })
  @IsIn(productStatuses, { message: i18nKeyValidator('isIn') })
  status?: ProductStatus;

  @IsOptional({ message: i18nKeyValidator('conditionalValidation') })
  @IsArray({ message: i18nKeyValidator('isArray') })
  @IsInt({ each: true, message: i18nKeyValidator('isInt') })
  @Min(1, { each: true, message: i18nKeyValidator('min') })
  mediaIds?: number[];

  @IsOptional({ message: i18nKeyValidator('conditionalValidation') })
  @IsLocalized({ message: i18nKeyValidator('isLocalized') })
  title?: Localized;

  @IsOptional({ message: i18nKeyValidator('conditionalValidation') })
  @IsLocalized({ message: i18nKeyValidator('isLocalized') })
  name?: Localized;

  @IsOptional({ message: i18nKeyValidator('conditionalValidation') })
  @IsLocalized({ message: i18nKeyValidator('isLocalized') })
  description?: Localized;

  @IsOptional({ message: i18nKeyValidator('conditionalValidation') })
  @IsInt({ message: i18nKeyValidator('isInt') })
  @Min(1, { message: i18nKeyValidator('min') })
  brandId?: number;

  @IsOptional({ message: i18nKeyValidator('conditionalValidation') })
  @IsInt({ message: i18nKeyValidator('isInt') })
  @Min(1, { message: i18nKeyValidator('min') })
  categoryId?: number;
}
