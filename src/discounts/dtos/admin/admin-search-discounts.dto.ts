import { IsIn, IsOptional, IsString } from 'class-validator';

import { discountEligibilities, discountMethods, discountSorts, discountTargets } from 'src/discounts/const';
import type { DiscountMethod, DiscountTarget, DiscountEligibility, DiscountSort } from 'src/discounts/types';

export class AdminSearchDiscountsDTO {
  @IsString()
  @IsOptional()
  q?: string;

  @IsIn(discountMethods)
  @IsOptional()
  method?: DiscountMethod;

  @IsIn(discountTargets)
  @IsOptional()
  target?: DiscountTarget;

  @IsIn(discountEligibilities)
  @IsOptional()
  eligibility?: DiscountEligibility;

  @IsIn(discountSorts)
  @IsOptional()
  sort?: DiscountSort;
}
