import { orderStatuses, paymentMethods, paymentStatuses } from './const';

export type OrderStatus = (typeof orderStatuses)[number];
export type PaymentStatus = (typeof paymentStatuses)[number];
export type PaymentMethod = (typeof paymentMethods)[number];

export interface OrderStatusGuardContext {
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  trackingNumber: string | null;
}

export interface OrderStatusGuard {
  isInvalid: (context: OrderStatusGuardContext) => boolean;
  message: string;
}

export interface OrderAddressSnapshot {
  id: number;
  nameAr: string;
  phoneNumber: string;
  detailedAddress: string;
  districtId: string;
  districtName: string;
  cityId: string;
  cityName: string;
}
