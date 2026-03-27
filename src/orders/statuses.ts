import { OrderStatus, OrderStatusGuard, PaymentStatus } from 'src/entity';

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
      message: 'Orders must be paid before shipping if not cash-on-delivery',
    },
    {
      isInvalid: ({ trackingNumber }) => !trackingNumber,
      message: 'Tracking number required before shipping',
    },
  ],
  completed: [
    {
      isInvalid: ({ status, paymentStatus }) => status !== 'delivered' || paymentStatus !== 'paid',
      message: 'Order must be delivered and paid before completion',
    },
  ],
};
export const paymentStatusGuards: Partial<Record<PaymentStatus, OrderStatusGuard[]>> = {
  refunded: [
    {
      isInvalid: ({ status }) => status !== 'returned',
      message: 'Only returned orders can be refunded',
    },
  ],
  paid: [
    {
      isInvalid: ({ paymentMethod, status }) => paymentMethod === 'cod' && status !== 'delivered',
      message: 'COD orders can only be marked as paid after delivery',
    },
    {
      isInvalid: ({ paymentMethod, status }) =>
        paymentMethod !== 'cod' &&
        paymentMethod !== 'instapay' &&
        !['pending', 'confirmed', 'on-progress', 'on-hold', 'shipped'].includes(status),
      message: 'Online payments must happen before delivery',
    },
    {
      isInvalid: ({ paymentMethod, status }) => paymentMethod === 'instapay' && status !== 'on-progress',
      message: 'Instapay payments must be marked as paid during on-progress status',
    },
  ],
};
