import { productStatuses } from './const';

export type ProductStatus = (typeof productStatuses)[number];

export interface ProductVariantPrice {
  amount: number;
  compareAt?: number;
  costPerItem?: number;
}

export interface ProductOptionVariant {
  name: string;
  imageId?: number;
  stock: number;
  price: ProductVariantPrice;
}

export interface ProductOption {
  name: string;
  variants: ProductOptionVariant[];
}
