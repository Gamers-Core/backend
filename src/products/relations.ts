import { FindOptionsRelations } from 'typeorm';

import { Cart, CartItem, FeaturedVariant, Product, Variant } from 'src/entity';

export const productBrandCategoryRelations = {
  brand: true,
  category: true,
} as const satisfies FindOptionsRelations<Product>;

export const productFullRelations = {
  variants: true,
  ...productBrandCategoryRelations,
} as const satisfies FindOptionsRelations<Product>;

export const variantWithProductBrandCategoryRelations = {
  product: productBrandCategoryRelations,
} as const satisfies FindOptionsRelations<Variant>;

export const variantWithProductFullRelations = {
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
