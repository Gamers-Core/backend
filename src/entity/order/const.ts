import type { OrderStatus, OrderStatusGuard } from './types';

export const orderStatuses = [
  'pending',
  'confirmed',
  'on-hold',
  'on-progress',
  'shipped',
  'delivered',
  'completed',
  'returned',
  'cancelled',
] as const;

export const paymentStatuses = ['unpaid', 'paid', 'refunded'] as const;

export const paymentMethods = ['cod', 'instapay', 'valu', 'card'] as const;

export const orderTransitions = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['on-progress', 'on-hold', 'cancelled'],
  'on-progress': ['shipped', 'on-hold', 'cancelled'],
  'on-hold': ['on-progress', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: ['completed', 'returned'],
  completed: [],
  returned: [],
  cancelled: [],
} as const;

export const editableStatuses: OrderStatus[] = ['pending', 'confirmed', 'on-hold', 'on-progress'];
export const nonUpdatableShippingStatuses: OrderStatus[] = ['delivered', 'completed', 'cancelled'];

export const paymentTransitions = {
  unpaid: ['paid'],
  paid: ['refunded'],
  refunded: [],
} as const;

export const orderStatusGuards: Partial<Record<OrderStatus, OrderStatusGuard[]>> = {
  confirmed: [
    {
      isInvalid: ({ paymentMethod, paymentStatus }) => paymentMethod !== 'cod' && paymentStatus !== 'paid',
      message: 'Cannot confirm unpaid order',
    },
  ],
  shipped: [
    {
      isInvalid: ({ trackingNumber }) => !trackingNumber,
      message: 'Tracking number required before shipping',
    },
  ],
};
