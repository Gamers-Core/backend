import { Exclude, Expose, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsInt, IsOptional, Min, ValidateIf } from 'class-validator';

import { IsLocalized } from 'src/i18n/decorators/is-localized.decorator';
import type { Localized } from 'src/i18n/types';
import { MediaDTO } from 'src/media/dtos/user/media.dto';

import type { SettingCronHandler } from '../types';

export class AnnouncementSettingDTO {
  @Expose()
  @IsBoolean()
  enabled: boolean;

  @Expose()
  @ValidateIf((o) => o.enabled === true)
  @IsLocalized()
  message: Localized;

  @Expose()
  @Type(() => MediaDTO)
  media?: MediaDTO[];

  @Expose()
  @ValidateIf((o) => o.enabled === true)
  @IsOptional()
  @IsDateString()
  disableAt?: string;

  @Expose()
  @ValidateIf((o) => o.enabled === true)
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  mediaIds?: number[];

  @Exclude()
  static cronHandler: SettingCronHandler<AnnouncementSettingDTO> = async (value, set) => {
    if (!value.enabled || !value.disableAt) return;
    if (new Date(value.disableAt) > new Date()) return;

    await set({ ...value, enabled: false });
  };
}
