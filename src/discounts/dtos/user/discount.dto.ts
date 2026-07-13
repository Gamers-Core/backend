import { Expose } from 'class-transformer';

export class DiscountDTO {
  @Expose()
  code: string | null;

  @Expose()
  discountAmount: number;

  @Expose()
  isFreeShipping: boolean;
}
