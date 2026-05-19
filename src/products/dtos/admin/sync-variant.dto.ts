import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min, ValidateIf } from 'class-validator';

import { IsGreaterThan } from 'src/common/validators/is-greater-than.validator';
import { IsLocalized } from 'src/i18n/decorators/is-localized.decorator';
import type { Localized } from 'src/i18n/types';

export class SyncVariantDTO {
  @IsOptional()
  @IsInt()
  @Min(1)
  id?: number;

  @ValidateIf((dto: SyncVariantDTO, value) => dto.id === undefined || value !== undefined)
  @IsLocalized()
  name: Localized;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ValidateIf((dto: SyncVariantDTO, value) => dto.id === undefined || value !== undefined)
  @IsInt()
  @Min(0)
  stock: number;

  @ValidateIf((dto: SyncVariantDTO, value) => dto.id === undefined || value !== undefined)
  @IsInt()
  @Min(0)
  price: number;

  @ValidateIf((dto: SyncVariantDTO, value) => dto.id === undefined || value !== undefined)
  @IsInt()
  @Min(1)
  imageId: number;

  @ValidateIf((dto: SyncVariantDTO, value) => dto.id === undefined || value !== undefined)
  @IsInt()
  @Min(0)
  costPerItem: number;

  @IsOptional()
  @Transform(({ value }) => (value === 0 ? null : value))
  @ValidateIf((dto: SyncVariantDTO) => dto.compareAt !== null)
  @IsInt()
  @IsGreaterThan('price')
  compareAt?: number | null;
}
