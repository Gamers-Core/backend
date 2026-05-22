import { FindOptionsRelations } from 'typeorm';

import { Cart } from 'src/cart/entities/cart.entity';
import { FeaturedVariant } from 'src/featured-variants/entities/featured-variant.entity';

import { Product } from './entities/product.entity';
import { Variant } from './entities/variant.entity';

export const productWithFullRelations = {
  brand: { image: true },
  category: true,
  media: { media: true },
  variants: { image: true },
} as const satisfies FindOptionsRelations<Product>;

export const variantWithProductBrandCategoryRelations = {
  image: true,
  product: productWithFullRelations,
} as const satisfies FindOptionsRelations<Variant>;

export const variantWithProductFullRelations = {
  image: true,
  product: productWithFullRelations,
} as const satisfies FindOptionsRelations<Variant>;

export const featuredVariantRelations = {
  variant: variantWithProductBrandCategoryRelations,
} as const satisfies FindOptionsRelations<FeaturedVariant>;

export const cartRelations = {
  items: {
    variant: variantWithProductBrandCategoryRelations,
  },
} as const satisfies FindOptionsRelations<Cart>;
