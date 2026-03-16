import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import type {
  ProductOption,
  ProductOptionVariant,
  ProductVariantPrice,
} from 'src/entity';

export class ProductVariantPriceDTO implements ProductVariantPrice {
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

export class ProductOptionVariantDTO implements ProductOptionVariant {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  stock: number;

  @ValidateNested()
  @Type(() => ProductVariantPriceDTO)
  price: ProductVariantPriceDTO;
}

export class ProductOptionDTO implements ProductOption {
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOptionVariantDTO)
  variants: ProductOptionVariantDTO[];
}
