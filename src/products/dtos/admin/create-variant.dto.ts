import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

import { IsGreaterThan } from 'src/common/validators/is-greater-than.validator';
import { IsLocalized } from 'src/i18n/decorators/is-localized.decorator';
import type { Localized } from 'src/i18n/types';
export class CreateVariantDTO {
  @IsLocalized()
  name: Localized;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsInt()
  @Min(0)
  stock: number;

  @IsInt()
  @Min(0)
  price: number;

  @IsInt()
  @Min(1)
  imageId: number;

  @IsInt()
  @Min(0)
  costPerItem: number;

  @IsOptional()
  @IsInt()
  @IsGreaterThan('price')
  compareAt: number | null;
}
