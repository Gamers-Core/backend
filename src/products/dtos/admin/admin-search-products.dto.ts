import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

import { adminSortOptions, productStatuses, stockFilters } from '../../const';
import type { AdminSortOption, ProductStatus, StockFilter } from '../../types';

export class AdminSearchProductsDTO {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  brandId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsIn(stockFilters)
  stock?: StockFilter;

  @IsOptional()
  @IsIn(productStatuses)
  status?: ProductStatus;

  @IsOptional()
  @IsIn(adminSortOptions)
  sort?: AdminSortOption;
}
