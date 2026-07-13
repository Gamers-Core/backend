import { Variant } from 'src/products/entities/variant.entity';

import { discountEligibilities, discountMethods, discountSorts, discountTargets, discountValueTypes } from './const';
import { Discount } from './entities/discount.entity';

export type DiscountTarget = (typeof discountTargets)[number];

export type DiscountMethod = (typeof discountMethods)[number];

export type DiscountValueType = (typeof discountValueTypes)[number];

export type DiscountEligibility = (typeof discountEligibilities)[number];

export type DiscountSort = (typeof discountSorts)[number];

export interface DiscountableItem {
  variant: Variant;
  quantity: number;
}

export interface DiscountResult {
  discount: Discount;
  discountAmount: number | null;
}
