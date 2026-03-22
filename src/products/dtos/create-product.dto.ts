import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  ArrayMinSize,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { productStatuses } from 'src/entity';
import type { ProductStatus } from 'src/entity';

import { ProductVariantDTO } from './product-variant.dto';

export class CreateProductDTO {
  @IsOptional()
  @IsIn(productStatuses)
  status?: ProductStatus;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDTO)
  variants: ProductVariantDTO[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  mediaIds?: number[];

  @IsString()
  @MinLength(2)
  title: string;

  @IsString()
  @MinLength(5)
  description: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  brandId?: number;
}
