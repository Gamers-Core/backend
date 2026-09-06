import { IsIn, IsOptional, IsString } from 'class-validator';

import { PaginatedDTO } from 'src/common/pagination/pagination.dto';
import { sortOptions } from 'src/orders/const';
import { orderStatuses, paymentMethods, paymentStatuses } from 'src/orders/statuses';
import type { OrderSortOption, OrderStatus, PaymentMethod, PaymentStatus } from 'src/orders/types';

export class AdminSearchOrdersDTO extends PaginatedDTO {
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
