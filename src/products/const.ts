export const productStatuses = ['active', 'draft', 'unlisted'] as const;

export const stockFilters = ['all', 'in-stock', 'out-of-stock'] as const;

export const sortOption = [
  'most-relevant',
  'title-ascending',
  'title-descending',
  'price-ascending',
  'price-descending',
  'created-ascending',
  'created-descending',
] as const;
