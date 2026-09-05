import { Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';

import { PaginationMeta, PaginationParams } from './pagination.dto';

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export const paginate = async <T extends ObjectLiteral>(
  source: Repository<T> | SelectQueryBuilder<T>,
  { page = 1, limit = 20 }: PaginationParams,
): Promise<Paginated<T>> => {
  const qb = source instanceof SelectQueryBuilder ? source : source.createQueryBuilder();

  qb.skip((page - 1) * limit).take(limit);

  const [data, totalItems] = await qb.getManyAndCount();

  return {
    data,
    meta: {
      itemsPerPage: limit,
      totalItems,
      currentPage: page,
      totalPages: Math.max(Math.ceil(totalItems / limit), 1),
    },
  };
};
