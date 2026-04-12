import { IsIn } from 'class-validator';

import { paymentStatuses } from 'src/entity/order/const';
import type { PaymentStatus } from 'src/entity/order/types';

export class UpdateOrderPaymentDTO {
  @IsIn(paymentStatuses)
  paymentStatus: PaymentStatus;
}
