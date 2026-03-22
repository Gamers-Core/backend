import { Expose, Transform, Type } from 'class-transformer';

class CartProductDTO {
  @Expose()
  id: number;

  @Expose()
  title: string;
}

class CartProductVariantDTO {
  @Expose()
  name: string | null;

  @Expose()
  externalId: string;

  @Expose()
  @Type(() => CartProductDTO)
  product: CartProductDTO;

  @Expose()
  price: number;

  @Expose()
  compareAt: number | null;
}

class CartItemDTO {
  @Expose()
  id: number;

  @Expose()
  @Type(() => CartProductVariantDTO)
  variant: CartProductVariantDTO;

  @Expose()
  quantity: number;

  @Expose()
  @Transform(({ obj }) => obj.variant.price * obj.quantity)
  total: number;
}

export class CartDTO {
  @Expose()
  id: number;

  @Expose()
  @Type(() => CartItemDTO)
  items: CartItemDTO[];

  @Expose()
  @Transform(({ obj }) => obj.items.reduce((sum, item) => sum + item.quantity, 0))
  count: number;

  @Expose()
  @Transform(({ obj }) => {
    const compareAtValues = obj.items.reduce((sum, item) => sum + (item.variant.compareAt ?? 0) * item.quantity, 0);

    if (!compareAtValues) return null;

    return compareAtValues;
  })
  compareAt: number | null;

  @Expose()
  @Transform(({ obj }) => obj.items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0))
  total: number;
}
