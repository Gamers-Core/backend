import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { type OrderStatus, type PaymentMethod } from 'src/entity';
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
  status: OrderStatus;

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
  note: string | null;

  @Expose()
  trackingNumber: string | null;

  @Expose()
  subtotal: number;

  @Expose()
  shippingFee: number;

  @Expose()
  total: number;

  @Expose()
  currency: string;
}
