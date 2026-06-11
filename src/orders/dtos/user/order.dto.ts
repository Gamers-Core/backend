import { Expose, Transform, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { assertValidOrderTransition } from 'src/orders/helpers';

import { type OrderHistoryStatus, type OrderHistoryType, type PaymentMethod, type OrderStatus } from '../../types';
import { OrderItemDTO } from '../order-item.dto';

class OrderAddressDTO {
  @Expose()
  id: number;

  @Expose()
  nameAr: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  detailedAddress: string;

  @Expose()
  districtName: string;

  @Expose()
  cityName: string;
}

class OrderStatusHistoryDTO {
  @Expose()
  type: OrderHistoryType;

  @Expose()
  status?: OrderHistoryStatus | null;

  @Expose()
  createdAt: Date;
}

export class OrderDTO {
  @Expose()
  orderNumber: string;

  @Expose()
  status: OrderStatus;

  @Expose()
  paymentMethod: PaymentMethod;

  @Expose()
  createdAt: Date;

  @Expose()
  @ValidateNested({ each: true })
  @Transform(({ value }) => value.filter((entry) => entry.type === 'status'))
  @Type(() => OrderStatusHistoryDTO)
  history: OrderStatusHistoryDTO[];

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDTO)
  items: OrderItemDTO[];

  @Expose()
  @Type(() => OrderAddressDTO)
  shippingAddress: OrderAddressDTO;

  @Expose()
  canOpenPackage: boolean;

  @Expose()
  note: string | null;

  @Expose()
  trackingNumber: string | null;

  @Expose()
  subtotal: number;

  @Expose()
  restocked: boolean;

  @Expose()
  shippingFee: number;

  @Expose()
  total: number;

  @Expose()
  currency: string;

  @Expose()
  @Transform(({ obj }) => {
    try {
      assertValidOrderTransition(obj.status, 'returned');
      return true;
    } catch {
      return false;
    }
  })
  canReturn: boolean;
}
