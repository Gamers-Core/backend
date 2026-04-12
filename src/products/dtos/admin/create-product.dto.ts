import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, ArrayMinSize, IsOptional, Min, ValidateNested } from 'class-validator';

import { productStatuses } from 'src/entity';
import { type ProductStatus } from 'src/entity';
import { IsLocalized, i18nKeyValidator, type Localized } from 'src/i18n';

import { CreateVariantDTO } from './create-variant.dto';

export class CreateProductDTO {
  @IsOptional({ message: i18nKeyValidator('conditionalValidation') })
  @IsIn(productStatuses, { message: i18nKeyValidator('isIn') })
  status?: ProductStatus;

  @IsArray({ message: i18nKeyValidator('isArray') })
  @ArrayMinSize(1, { message: i18nKeyValidator('arrayMinSize') })
  @ValidateNested({ each: true, message: i18nKeyValidator('nestedValidation') })
  @Type(() => CreateVariantDTO)
  variants: CreateVariantDTO[];

  @IsOptional({ message: i18nKeyValidator('conditionalValidation') })
  @IsArray({ message: i18nKeyValidator('isArray') })
  @IsInt({ each: true, message: i18nKeyValidator('isInt') })
  @Min(1, { each: true, message: i18nKeyValidator('min') })
  mediaIds?: number[];

  @IsLocalized({ message: i18nKeyValidator('isLocalized') })
  name: Localized;

  @IsLocalized({ message: i18nKeyValidator('isLocalized') })
  title: Localized;

  @IsLocalized({ message: i18nKeyValidator('isLocalized') })
  description: Localized;

  @IsInt({ message: i18nKeyValidator('isInt') })
  @Min(1, { message: i18nKeyValidator('min') })
  brandId: number;

  @IsInt({ message: i18nKeyValidator('isInt') })
  @Min(1, { message: i18nKeyValidator('min') })
  categoryId: number;
}
