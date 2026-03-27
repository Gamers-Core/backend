import { BadRequestException } from '@nestjs/common';

import { Order, type OrderStatus, type PaymentStatus } from 'src/entity';
import { orderStatusGuards, orderTransitions, paymentStatusGuards, paymentTransitions } from './statuses';

export const assertValidOrderTransition = (current: OrderStatus, next: OrderStatus) => {
  const allowed = orderTransitions[current] ?? [];

  if (!allowed.includes(next)) throw new BadRequestException(`Invalid transition: ${current} → ${next}`);
};

export const assertValidPaymentTransition = (current: PaymentStatus, next: PaymentStatus) => {
  const allowed = paymentTransitions[current] ?? [];

  if (!allowed.includes(next)) throw new BadRequestException(`Invalid payment transition: ${current} → ${next}`);
};

export const assertStatusGuards = (order: Order, nextStatus: OrderStatus) => {
  const guards = orderStatusGuards[nextStatus] ?? [];

  guards.forEach(({ isInvalid, message }) => {
    if (isInvalid(order)) throw new BadRequestException(message);
  });
};
export const assertPaymentStatusGuards = (order: Order, nextStatus: PaymentStatus) => {
  const guards = paymentStatusGuards[nextStatus] ?? [];

  guards.forEach(({ isInvalid, message }) => {
    if (isInvalid(order)) throw new BadRequestException(message);
  });
};

export const getAllowedStatuses = (order: Order): OrderStatus[] => {
  return (orderTransitions[order.status] ?? []).filter((next) => {
    try {
      assertStatusGuards(order, next);
      return true;
    } catch {
      return false;
    }
  });
};

export const getAllowedPaymentStatuses = (order: Order): PaymentStatus[] => {
  return (paymentTransitions[order.paymentStatus] ?? []).filter((next) => {
    try {
      assertPaymentStatusGuards(order, next);
      return true;
    } catch {
      return false;
    }
  });
};
