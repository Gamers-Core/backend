import { Expose, Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

type Constructor<T = object> = new (...args: any[]) => T;

export interface PaginationMeta {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export class PaginatedDTO {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export type Paginate<T> = T & PaginationParams;

export const Paginated = <TItem>(ItemDto: Constructor<TItem>) => {
  class PaginatedResponseDTO {
    @Expose()
    @Type(() => ItemDto)
    data: TItem[];

    @Expose()
    meta: PaginationMeta;
  }

  return PaginatedResponseDTO;
};
