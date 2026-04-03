import { IsArray, IsBoolean, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

import { IsLocalized, type Localized } from 'src/i18n';

export class CreateProductVariantDTO {
  @IsOptional()
  @IsUUID('4')
  externalId?: string;

  @IsOptional()
  @IsLocalized()
  name?: Localized;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

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
  @Min(0)
  compareAt?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  mediaIds?: number[];
}
