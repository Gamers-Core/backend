import { Exclude, Expose, Transform, Type } from 'class-transformer';

import { Localize } from 'src/i18n/decorators/localize.decorator';
import type { Localized } from 'src/i18n/types';
import { MediaDTO } from 'src/media/dtos/user/media.dto';

import { AnnouncementSettingDTO } from '../announcement.setting.dto';

export class AnnouncementDTO extends AnnouncementSettingDTO {
  @Expose()
  @Transform(({ obj, value }) => (obj.enabled ? value : undefined))
  intervalHours?: number = 6;

  @Expose()
  @Transform(({ obj, value }) => (obj.enabled ? value : undefined))
  @Type(() => MediaDTO)
  declare media?: MediaDTO[];

  @Expose()
  @Transform(({ obj, value }) => (obj.enabled ? value : undefined))
  @Localize()
  declare message: Localized;

  @Exclude()
  declare disableAt?: string | undefined;

  @Exclude()
  declare mediaIds?: number[] | undefined;
}
