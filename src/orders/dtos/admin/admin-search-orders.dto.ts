import { IsIn, IsOptional, IsString } from 'class-validator';

import { sortOptions } from 'src/orders/const';
import { orderStatuses, paymentMethods, paymentStatuses } from 'src/orders/statuses';
import type { OrderSortOption, OrderStatus, PaymentMethod, PaymentStatus } from 'src/orders/types';

export class AdminSearchOrdersDTO {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(orderStatuses)
  status?: OrderStatus;

  @IsOptional()
  @IsIn(paymentStatuses)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsIn(paymentMethods)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsIn(sortOptions)
  sort?: OrderSortOption;
}
