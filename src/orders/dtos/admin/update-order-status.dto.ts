import { IsIn } from 'class-validator';

import { orderStatuses } from '../../statuses';
import type { OrderStatus } from '../../types';

export class UpdateOrderStatusDTO {
  @IsIn(orderStatuses)
  status: OrderStatus;
}
