import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsIn, IsNumber, IsOptional, Min, ValidateIf } from 'class-validator';

import { MaxIfPercentage } from 'src/discounts/validators/max-if-percent.validator';
import { RequiredIfCodeMethod } from 'src/discounts/validators/required-if-code-method.validator';
import { RequiredIfCustomEligibility } from 'src/discounts/validators/required-if-custom-eligibility.validator';
import { RequiredIfTarget } from 'src/discounts/validators/required-if-target.validator';
import { RequiredUnlessFreeShipping } from 'src/discounts/validators/required-unless-free-shipping.validator';

import { discountEligibilities, discountMethods, discountTargets, discountValueTypes } from '../../const';
import type { DiscountEligibility, DiscountMethod, DiscountTarget, DiscountValueType } from '../../types';

export class CreateDiscountDTO {
  @RequiredIfCodeMethod()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  code?: string;

  @IsIn(discountMethods)
  method: DiscountMethod;

  @IsIn(discountTargets)
  target: DiscountTarget;

  @RequiredUnlessFreeShipping()
  @ValidateIf((dto: CreateDiscountDTO) => dto.target !== 'free_shipping')
  @IsIn(discountValueTypes)
  valueType?: DiscountValueType;

  @RequiredUnlessFreeShipping()
  @ValidateIf((dto: CreateDiscountDTO) => dto.target !== 'free_shipping')
  @IsNumber()
  @Min(0)
  @MaxIfPercentage()
  value?: number;

  @IsIn(discountEligibilities)
  @IsOptional()
  eligibility?: DiscountEligibility;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minOrderAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxDiscountAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  usageLimit?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  usageLimitPerUser?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDateString()
  @IsOptional()
  startsAt?: string;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @RequiredIfTarget('product')
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  variantIds?: number[];

  @RequiredIfTarget('category')
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  categoryIds?: number[];

  @RequiredIfTarget('brand')
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  brandIds?: number[];

  @RequiredIfCustomEligibility()
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  eligibleUserIds?: number[];
}
