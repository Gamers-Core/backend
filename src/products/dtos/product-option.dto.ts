import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductOptionVariantDTO {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  stock: number;

  @IsInt()
  @Min(0)
  amount: number;

  @IsInt()
  @Min(0)
  costPerItem: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  compareAt?: number;
}

export class ProductOptionDTO {
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOptionVariantDTO)
  variants: ProductOptionVariantDTO[];
}
