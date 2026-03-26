import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import type { OrderStatus, PaymentMethod, PaymentStatus } from 'src/entity';

class OrderItemDTO {
  @Expose()
  id: number;

  @Expose()
  productId: number;

  @Expose()
  productTitle: string;

  @Expose()
  variantExternalId: string;

  @Expose()
  variantName: string;

  @Expose()
  quantity: number;

  @Expose()
  unitPrice: number;

  @Expose()
  lineTotal: number;
}

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
  districtId: string;

  @Expose()
  districtName: string;

  @Expose()
  cityId: string;

  @Expose()
  cityName: string;
}

export class OrderDTO {
  @Expose()
  id: number;

  @Expose()
  status: OrderStatus;

  @Expose()
  paymentMethod: PaymentMethod;

  @Expose()
  paymentStatus: PaymentStatus;

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
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
