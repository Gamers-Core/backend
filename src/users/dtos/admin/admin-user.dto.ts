import { Expose, Type } from 'class-transformer';

import { AdminOrderDTO } from 'src/orders/dtos/admin/admin-order.dto';

import { FullUserDTO } from '../full-user.dto';

export class AdminUserDTO extends FullUserDTO {
  @Expose()
  ordersCount: number;

  @Expose()
  @Type(() => AdminOrderDTO)
  orders: AdminOrderDTO[];

  @Expose()
  createdAt: Date;
}
