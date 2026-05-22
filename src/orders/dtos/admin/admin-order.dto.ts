import { Expose, Type } from 'class-transformer';

import { BasicUserDTO } from 'src/users/dtos/basic-user.dto';

import { type PaymentStatus } from '../../types';
import { OrderItemDTO } from '../order-item.dto';
import { OrderDTO } from '../user/order.dto';

import { OrderAllowedActionsDTO } from './order-allowed-actions.dto';

class AdminOrderItemDTO extends OrderItemDTO {
  @Expose()
  id: number;
}

export class AdminOrderDTO extends OrderDTO {
  @Expose()
  id: number;

  @Expose()
  paymentStatus: PaymentStatus;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => OrderAllowedActionsDTO)
  allowedActions: OrderAllowedActionsDTO;

  @Expose()
  @Type(() => BasicUserDTO)
  user: BasicUserDTO;

  @Expose()
  @Type(() => AdminOrderItemDTO)
  declare items: AdminOrderItemDTO[];
}
