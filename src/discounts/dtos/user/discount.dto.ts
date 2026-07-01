import { Expose } from 'class-transformer';

import type { DiscountTarget, DiscountValueType } from '../../types';

export class DiscountDTO {
  @Expose()
  code: string | null;

  @Expose()
  target: DiscountTarget;

  @Expose()
  valueType: DiscountValueType | null;

  @Expose()
  value: number | null;

  @Expose()
  discountAmount: number;

  @Expose()
  shippingDiscount: number;

  @Expose()
  isFreeShipping: boolean;
}
