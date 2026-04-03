type OrderIdentifierType = 'orderNumber' | 'trackingNumber';

export type OrderOptions<T extends OrderIdentifierType = OrderIdentifierType> = {
  userId?: number;
} & OrderIdentifier<T>;

type OrderIdentifier<T extends OrderIdentifierType> = T extends 'orderNumber'
  ? { orderNumber: string }
  : { trackingNumber: string };
