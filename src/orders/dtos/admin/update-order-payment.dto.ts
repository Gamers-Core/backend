import { IsIn } from 'class-validator';

import { paymentStatuses } from '../../statuses';
import type { PaymentStatus } from '../../types';

export class UpdateOrderPaymentDTO {
  @IsIn(paymentStatuses)
  paymentStatus: PaymentStatus;
}
