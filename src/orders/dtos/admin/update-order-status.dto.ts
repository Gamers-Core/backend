import { IsIn } from 'class-validator';
import { i18nKeyValidator } from 'src/i18n';

import { orderStatuses, type OrderStatus } from 'src/entity';

export class UpdateOrderStatusDTO {
  @IsIn(orderStatuses, { message: i18nKeyValidator('isIn') })
  status: OrderStatus;
}
