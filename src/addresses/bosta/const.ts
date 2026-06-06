import { OrderStatus } from 'src/orders/types';

export const deliveryTypes = [
  'SEND',
  'EXCHANGE',
  'CUSTOMER_RETURN_PICKUP',
  'RTO',
  'SIGN_AND_RETURN',
  'FXF_SEND',
] as const;

export const deliveryStates: Record<number, OrderStatus> = {
  10: 'on-progress',
  20: 'shipped',
  21: 'shipped',
  41: 'shipped',
  24: 'shipped',
  30: 'shipped',
  45: 'delivered',
};

export const bostaPaymentMethods = ['cod', 'valu', 'card'] as const;
