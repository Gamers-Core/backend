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
  const alias = qb.alias;

  const belongsToRoot = (key: string) =>
    key.replace(/"/g, '') === alias || key.replace(/"/g, '').startsWith(`${alias}.`);

  const idQb = qb.clone().select(`${alias}.id`, 'id');

  const rootOrderByEntries = Object.entries(idQb.expressionMap.orderBys).filter(([key]) => belongsToRoot(key));
  idQb.expressionMap.orderBys = Object.fromEntries(rootOrderByEntries);

  rootOrderByEntries.forEach(([column]) => idQb.addSelect(column));

  idQb.distinct(true);

  const totalItems = await idQb.clone().getCount();

  const idRows = await idQb
    .offset((page - 1) * limit)
    .limit(limit)
    .getRawMany<{ id: number | string }>();

  const ids = idRows.map((row) => row.id);

  const data = ids.length ? await qb.clone().andWhereInIds(ids).getMany() : [];

  const byId = new Map(data.map((entity) => [(entity as any).id, entity]));
  const orderedData = ids.map((id) => byId.get(id)).filter((e): e is T => !!e);

  return {
    data: orderedData,
    meta: {
      itemsPerPage: limit,
      totalItems,
      currentPage: page,
      totalPages: Math.max(Math.ceil(totalItems / limit), 1),
    },
  };
};
