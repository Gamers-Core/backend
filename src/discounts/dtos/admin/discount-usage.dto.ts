import { Expose, Type } from 'class-transformer';

import { AdminUserDTO } from 'src/users/dtos/admin/admin-user.dto';

class DiscountUsageOrderRefDTO {
  @Expose()
  orderNumber: string;

  @Expose()
  total: number;

  @Expose()
  createdAt: Date;
}

export class DiscountUsageDTO {
  @Expose()
  id: number;

  @Expose()
  discountAmount: number | null;

  @Expose()
  shippingDiscount: number;

  @Expose()
  @Type(() => AdminUserDTO)
  user: AdminUserDTO;

  @Expose()
  @Type(() => DiscountUsageOrderRefDTO)
  order: DiscountUsageOrderRefDTO;

  @Expose()
  createdAt: Date;
}
