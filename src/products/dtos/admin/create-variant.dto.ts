import { IsArray, IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { IsGreaterThan } from 'src/common';

import { IsLocalized, type Localized } from 'src/i18n';

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
  @Min(0)
  costPerItem: number;

  @IsOptional()
  @IsInt()
  @IsGreaterThan('price')
  compareAt: number | null;

  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  mediaIds: number[];
}
