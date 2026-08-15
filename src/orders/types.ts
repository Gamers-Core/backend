import { Translate } from 'src/i18n/types';

import { sortOptions } from './const';
import { orderHistoryStatuses, orderHistoryTypes, orderStatuses, paymentMethods, paymentStatuses } from './statuses';

type OrderIdentifierType = 'orderNumber' | 'trackingNumber' | 'whatsappMessageId';

export type OrderOptions<T extends OrderIdentifierType = OrderIdentifierType> = {
  userId?: number;
} & OrderIdentifier<T>;

type OrderIdentifier<T extends OrderIdentifierType> = T extends 'orderNumber'
  ? { orderNumber: string }
  : T extends 'trackingNumber'
    ? { trackingNumber: string }
    : T extends 'whatsappMessageId'
      ? { whatsappMessageId: string }
      : never;

export type OrderStatus = (typeof orderStatuses)[number];
export type PaymentStatus = (typeof paymentStatuses)[number];
export type PaymentMethod = (typeof paymentMethods)[number];
export type OrderHistoryType = (typeof orderHistoryTypes)[number];
export type OrderHistoryStatus = (typeof orderHistoryStatuses)[number];

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
  secondaryPhoneNumber: string | null;
  detailedAddress: string;
  districtId: string;
  districtName: string;
  cityId: string;
  cityName: string;
  cityDropOff: string;
  isWorkAddress: boolean;
}

export type OrderSortOption = (typeof sortOptions)[number];
