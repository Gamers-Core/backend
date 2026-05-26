import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { BasicUserDTO } from 'src/users/dtos/basic-user.dto';

import type { OrderHistoryStatus, OrderHistoryType, OrderStatus, PaymentMethod, PaymentStatus } from '../../types';

import { AdminOrderItemDTO } from './admin-order-item.dto';
import { OrderAllowedActionsDTO } from './order-allowed-actions.dto';

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

export class AdminOrderDTO {
  @Expose()
  id: number;

  @Expose()
  paymentStatus: PaymentStatus;

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
  @Type(() => AdminOrderItemDTO)
  items: AdminOrderItemDTO[];

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
  shippingFee: number;

  @Expose()
  total: number;

  @Expose()
  currency: string;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => OrderAllowedActionsDTO)
  allowedActions: OrderAllowedActionsDTO;

  @Expose()
  @Type(() => BasicUserDTO)
  user: BasicUserDTO;
}
