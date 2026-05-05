import { Expose } from 'class-transformer';

import { OrderStatus, PaymentStatus } from '../../types';

export class OrderAllowedActionsDTO {
  @Expose()
  statuses: OrderStatus[];

  @Expose()
  paymentStatuses: PaymentStatus[];
}
