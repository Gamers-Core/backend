import { FindOptionsRelations } from 'typeorm';

import { CartItem } from 'src/cart/entities/cart-item.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { FeaturedVariant } from 'src/featured-variants/entities/featured-variant.entity';

import { Product } from './entities/product.entity';
import { Variant } from './entities/variant.entity';

export const productBrandCategoryRelations = {
  brand: { image: true },
  category: true,
  media: { media: true },
} as const satisfies FindOptionsRelations<Product>;

export const productFullRelations = {
  variants: { image: true },
  ...productBrandCategoryRelations,
} as const satisfies FindOptionsRelations<Product>;

export const variantWithProductBrandCategoryRelations = {
  image: true,
  product: productBrandCategoryRelations,
} as const satisfies FindOptionsRelations<Variant>;

export const variantWithProductFullRelations = {
  image: true,
  product: productFullRelations,
} as const satisfies FindOptionsRelations<Variant>;

export const featuredVariantRelations = {
  variant: variantWithProductBrandCategoryRelations,
} as const satisfies FindOptionsRelations<FeaturedVariant>;

export const cartRelations = {
  items: {
    variant: variantWithProductBrandCategoryRelations,
  },
} as const satisfies FindOptionsRelations<Cart>;

export const cartItemRelations = {
  variant: variantWithProductBrandCategoryRelations,
} as const satisfies FindOptionsRelations<CartItem>;
