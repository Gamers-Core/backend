import { IsIn } from 'class-validator';
import { i18nKeyValidator } from 'src/i18n';

import { paymentStatuses } from 'src/entity/order/const';
import type { PaymentStatus } from 'src/entity/order/types';

export class UpdateOrderPaymentDTO {
  @IsIn(paymentStatuses, { message: i18nKeyValidator('isIn') })
  paymentStatus: PaymentStatus;
}
