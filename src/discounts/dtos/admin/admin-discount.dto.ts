import { Expose, Transform, Type } from 'class-transformer';

import { AdminBrandDTO } from 'src/brands/dtos/admin/admin-brand.dto';
import { AdminCategoryDTO } from 'src/categories/dtos/admin/admin-category.dto';
import type { PaymentMethod } from 'src/orders/types';
import { AdminProductDTO } from 'src/products/dtos/admin/admin-product.dto';
import { AdminVariantDTO } from 'src/products/dtos/admin/admin-variant.dto';
import { BasicUserDTO } from 'src/users/dtos/basic-user.dto';

import type { DiscountEligibility, DiscountMethod, DiscountTarget, DiscountValueType } from '../../types';

class AdminVariantWithProductDTO extends AdminVariantDTO {
  @Expose()
  @Type(() => AdminProductDTO)
  product: AdminProductDTO;
}

export class AdminDiscountDTO {
  @Expose()
  id: number;

  @Expose()
  code: string | null;

  @Expose()
  method: DiscountMethod;

  @Expose()
  paymentMethods: PaymentMethod[] | null;

  @Expose()
  target: DiscountTarget;

  @Expose()
  valueType: DiscountValueType | null;

  @Expose()
  @Transform(({ value }) => (value !== null ? parseFloat(value) : null))
  value: number | null;

  @Expose()
  eligibility: DiscountEligibility;

  @Expose()
  @Transform(({ value }) => (value !== null ? parseFloat(value) : null))
  minOrderAmount: number | null;

  @Expose()
  @Transform(({ value }) => (value !== null ? parseFloat(value) : null))
  maxDiscountAmount: number | null;

  @Expose()
  @Transform(({ value }) => (value !== null ? parseFloat(value) : null))
  usageLimit: number | null;

  @Expose()
  @Transform(({ value }) => (value !== null ? parseFloat(value) : null))
  usageCount: number;

  @Expose()
  @Transform(({ value }) => (value !== null ? parseFloat(value) : null))
  usageLimitPerUser: number | null;

  @Expose()
  isActive: boolean;

  @Expose()
  startsAt: Date | null;

  @Expose()
  expiresAt: Date | null;

  @Expose()
  @Type(() => AdminVariantWithProductDTO)
  variants: AdminVariantWithProductDTO[];

  @Expose()
  @Type(() => AdminCategoryDTO)
  categories: AdminCategoryDTO[];

  @Expose()
  @Type(() => AdminBrandDTO)
  brands: AdminBrandDTO[];

  @Expose()
  @Type(() => BasicUserDTO)
  eligibleUsers: BasicUserDTO[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
