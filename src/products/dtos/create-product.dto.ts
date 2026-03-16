import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { productStatuses } from 'src/entity';
import type {
  ProductOption,
  ProductOptionVariant,
  ProductStatus,
  ProductVariantPrice,
} from 'src/entity';

class ProductVariantPriceDTO implements ProductVariantPrice {
  @IsInt()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  compareAt?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  costPerItem?: number;
}

class ProductOptionVariantDTO implements ProductOptionVariant {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  stock: number;

  @ValidateNested()
  @Type(() => ProductVariantPriceDTO)
  price: ProductVariantPriceDTO;
}

class ProductOptionDTO implements ProductOption {
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOptionVariantDTO)
  variants: ProductOptionVariantDTO[];
}

export class CreateProductDTO {
  @IsString()
  @MinLength(2)
  title: string;

  @IsString()
  @MinLength(5)
  description: string;

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
