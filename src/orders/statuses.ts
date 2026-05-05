// eslint-disable-next-line import/no-cycle
import { OrderStatus, OrderStatusGuard, PaymentStatus } from './types';

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

export const orderTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['on-progress', 'on-hold', 'cancelled'],
  'on-hold': ['on-progress', 'cancelled'],
  'on-progress': ['shipped', 'on-hold', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: ['completed', 'returned'],
  completed: ['returned', 'on-progress'],
  returned: [],
  cancelled: [],
};

export const paymentTransitions: Partial<Record<PaymentStatus, PaymentStatus[]>> = {
  unpaid: ['paid'],
  paid: ['refunded'],
  refunded: [],
};

export const editableStatuses: OrderStatus[] = ['pending', 'confirmed', 'on-hold', 'on-progress'];
export const nonUpdatableShippingStatuses: OrderStatus[] = ['delivered', 'completed', 'cancelled', 'returned'];

export const orderStatusGuards: Partial<Record<OrderStatus, OrderStatusGuard[]>> = {
  shipped: [
    {
      isInvalid: ({ paymentMethod, paymentStatus }) => paymentMethod !== 'cod' && paymentStatus !== 'paid',
      message: 'orders.shipped.mustBePaidBeforeCOD',
    },
    {
      isInvalid: ({ trackingNumber }) => !trackingNumber,
      message: 'orders.shipped.trackingNumberRequired',
    },
  ],
  completed: [
    {
      isInvalid: ({ status, paymentStatus }) => status !== 'delivered' || paymentStatus !== 'paid',
      message: 'orders.completed.mustBeDeliveredAndPaid',
    },
  ],
};
export const paymentStatusGuards: Partial<Record<PaymentStatus, OrderStatusGuard[]>> = {
  refunded: [
    {
      isInvalid: ({ status }) => status !== 'returned',
      message: 'orders.refunded.onlyReturned',
    },
  ],
  paid: [
    {
      isInvalid: ({ paymentMethod, status }) => paymentMethod === 'cod' && status !== 'delivered',
      message: 'orders.paid.CODOnlyAfterDelivery',
    },
    {
      isInvalid: ({ paymentMethod, status }) =>
        paymentMethod !== 'cod' &&
        paymentMethod !== 'instapay' &&
        !['pending', 'confirmed', 'on-progress', 'on-hold', 'shipped'].includes(status),
      message: 'orders.paid.onlinePaymentsBeforeDelivery',
    },
    {
      isInvalid: ({ paymentMethod, status }) => paymentMethod === 'instapay' && status !== 'on-progress',
      message: 'orders.paid.instapayPaymentsBeforeDelivery',
    },
  ],
};
