import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

import { productStatuses } from 'src/entity';
import type { ProductOption, ProductStatus } from 'src/entity';

import { ProductOptionDTO } from './product-option.dto';

export class ProductSharedFieldsDTO {
  @IsOptional()
  @IsIn(productStatuses)
  status?: ProductStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOptionDTO)
  options?: ProductOption[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  mediaIds?: number[];
}
