import { Expose, Transform, Type } from 'class-transformer';

import { Localize } from 'src/i18n';
import { BrandDTO } from 'src/brands';
import { CategoryDTO } from 'src/categories';

class CartProductDTO {
  @Expose()
  id: number;

  @Expose()
  @Localize()
  name: string;

  @Expose()
  @Localize()
  title: string;

  @Expose()
  @Type(() => BrandDTO)
  brand: BrandDTO;

  @Expose()
  @Type(() => CategoryDTO)
  category: CategoryDTO;
}

class CartProductVariantDTO {
  @Expose()
  @Localize()
  name: string | null;

  @Expose()
  imageURL: string;

  @Expose()
  externalId: string;

  @Expose()
  stock: number;

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
