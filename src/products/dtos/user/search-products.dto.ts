import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

import { PaginatedDTO } from 'src/common/pagination/pagination.dto';

import { sortOption, stockFilters } from '../../const';
import type { SortOption, StockFilter } from '../../types';

export class SearchProductsDTO extends PaginatedDTO {
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
  @IsIn(sortOption)
  sort?: SortOption;
}
