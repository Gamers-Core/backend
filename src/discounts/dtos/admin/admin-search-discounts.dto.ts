import { IsIn, IsOptional, IsString } from 'class-validator';

import { PaginatedDTO } from 'src/common/pagination/pagination.dto';
import { discountEligibilities, discountMethods, discountSorts, discountTargets } from 'src/discounts/const';
import type { DiscountMethod, DiscountTarget, DiscountEligibility, DiscountSort } from 'src/discounts/types';

export class AdminSearchDiscountsDTO extends PaginatedDTO {
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
