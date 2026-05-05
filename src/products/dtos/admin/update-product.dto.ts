import { IsArray, IsIn, IsInt, IsOptional, Min } from 'class-validator';

import { IsLocalized } from 'src/i18n/decorators/is-localized.decorator';
import type { Localized } from 'src/i18n/types';

import { productStatuses } from '../../const';
import type { ProductStatus } from '../../types';

export class UpdateProductDTO {
  @IsOptional()
  @IsIn(productStatuses)
  status?: ProductStatus;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  mediaIds?: number[];

  @IsOptional()
  @IsLocalized()
  title?: Localized;

  @IsOptional()
  @IsLocalized()
  name?: Localized;

  @IsOptional()
  @IsLocalized()
  description?: Localized;

  @IsOptional()
  @IsInt()
  @Min(1)
  brandId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  categoryId?: number;
}
