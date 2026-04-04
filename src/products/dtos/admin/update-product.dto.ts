import { IsArray, IsIn, IsInt, IsOptional, Min } from 'class-validator';

import { productStatuses } from 'src/entity';
import { type ProductStatus } from 'src/entity';
import { IsLocalized, type Localized } from 'src/i18n';

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
  description?: Localized;

  @IsOptional()
  @IsInt()
  @Min(1)
  brandId?: number;
}
