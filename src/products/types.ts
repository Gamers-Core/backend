import { productStatuses, sortOption, stockFilters } from './const';

export type ProductStatus = (typeof productStatuses)[number];

export type StockFilter = (typeof stockFilters)[number];

export type SortOption = (typeof sortOption)[number];
