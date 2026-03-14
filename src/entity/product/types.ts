import { productStatuses } from './const';

export type ProductStatus = (typeof productStatuses)[number];

export interface ProductVariantPrice {
  amount: number;
  compareAt?: number;
  costPerItem?: number;
}

export interface ProductOptionVariant {
  name: string;
  stock: number;
  price: ProductVariantPrice | number;
}

export type ProductOptionType = 'color' | 'size' | 'material' | 'other';

export interface ProductOption {
  name: string;
  type: ProductOptionType;
  variants: ProductOptionVariant[];
}
