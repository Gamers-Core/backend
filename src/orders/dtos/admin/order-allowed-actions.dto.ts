import { Expose } from 'class-transformer';

import { OrderStatus, PaymentStatus } from 'src/entity';

export class OrderAllowedActionsDTO {
  @Expose()
  statuses: OrderStatus[];

  @Expose()
  paymentStatuses: PaymentStatus[];
}
