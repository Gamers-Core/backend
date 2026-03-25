import { BadRequestException } from '@nestjs/common';

import {
  Order,
  orderStatusGuards,
  orderTransitions,
  paymentTransitions,
  type OrderStatus,
  type PaymentStatus,
} from 'src/entity';

export function assertValidOrderTransition(current: OrderStatus, next: OrderStatus) {
  const allowed = orderTransitions[current] as readonly OrderStatus[];
  if (!allowed.includes(next)) throw new BadRequestException(`Invalid transition: ${current} → ${next}`);
}

export function assertValidPaymentTransition(current: PaymentStatus, next: PaymentStatus) {
  const allowed = paymentTransitions[current] as readonly PaymentStatus[];
  if (!allowed.includes(next)) throw new BadRequestException(`Invalid payment transition: ${current} → ${next}`);
}

export function assertStatusGuards(order: Order, nextStatus: OrderStatus) {
  const guards = orderStatusGuards[nextStatus] ?? [];

  guards.forEach(({ isInvalid, message }) => {
    if (isInvalid(order)) throw new BadRequestException(message);
  });
}
