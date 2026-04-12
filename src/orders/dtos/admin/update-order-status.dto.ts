import { IsIn } from 'class-validator';

import { orderStatuses, type OrderStatus } from 'src/entity';

export class UpdateOrderStatusDTO {
  @IsIn(orderStatuses)
  status: OrderStatus;
}
