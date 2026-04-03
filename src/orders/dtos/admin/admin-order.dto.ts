import { Expose, Transform, Type } from 'class-transformer';

import { BasicUserDTO } from 'src/users';
import { type PaymentStatus } from 'src/entity';

import { OrderDTO } from '../user';
import { OrderAllowedActionsDTO } from './order-allowed-actions.dto';
import { OrderItemDTO } from '../order-item.dto';

class AdminOrderItemDTO extends OrderItemDTO {
  @Expose()
  id: number;
}

export class AdminOrderDTO extends OrderDTO {
  @Expose()
  id: number;

  @Expose()
  @Transform(({ obj }) => obj.user?.id ?? null)
  userId: number | null;

  @Expose()
  @Transform(({ obj }) => obj.user?.email ?? null)
  userEmail: string | null;

  @Expose()
  paymentStatus: PaymentStatus;

  @Expose()
  createdAt: Date;

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
