import { Translate } from 'src/i18n/types';

import { sortOptions } from './const';
// eslint-disable-next-line import/no-cycle
import { orderStatuses, paymentMethods, paymentStatuses } from './statuses';

type OrderIdentifierType = 'orderNumber' | 'trackingNumber';

export type OrderOptions<T extends OrderIdentifierType = OrderIdentifierType> = {
  userId?: number;
} & OrderIdentifier<T>;

type OrderIdentifier<T extends OrderIdentifierType> = T extends 'orderNumber'
  ? { orderNumber: string }
  : { trackingNumber: string };

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
  message: Translate;
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
  cityDropOff: string;
}

export type OrderSortOption = (typeof sortOptions)[number];
