import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, ArrayMinSize, IsOptional, Min, ValidateNested } from 'class-validator';

import { productStatuses } from 'src/entity';
import { type ProductStatus } from 'src/entity';
import { IsLocalized, type Localized } from 'src/i18n';

import { CreateVariantDTO } from './create-variant.dto';

export class CreateProductDTO {
  @IsOptional()
  @IsIn(productStatuses)
  status?: ProductStatus;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDTO)
  variants: CreateVariantDTO[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  mediaIds?: number[];

  @IsLocalized()
  name: Localized;

  @IsLocalized()
  title: Localized;

  @IsLocalized()
  description: Localized;

  @IsInt()
  @Min(1)
  brandId: number;

  @IsInt()
  @Min(1)
  categoryId: number;
}
