import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, ArrayMinSize, IsOptional, Min, ValidateNested } from 'class-validator';

import { IsLocalized } from 'src/i18n/decorators/is-localized.decorator';
import type { Localized } from 'src/i18n/types';

import { productStatuses } from '../../const';
import type { ProductStatus } from '../../types';

import { SyncVariantDTO } from './sync-variant.dto';

export class CreateProductDTO {
  @IsOptional()
  @IsIn(productStatuses)
  status?: ProductStatus;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SyncVariantDTO)
  variants: SyncVariantDTO[];

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
