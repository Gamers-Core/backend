import { Exclude, Expose, Transform } from 'class-transformer';

import { Localize } from 'src/i18n/decorators/localize.decorator';
import type { Localized } from 'src/i18n/types';

import { MaintenanceModeSettingDTO } from '../maintenance-mode.setting.dto';

export class MaintenanceModeDTO extends MaintenanceModeSettingDTO {
  @Expose()
  @Transform(({ obj, value }) => (obj.enabled ? value : undefined))
  declare countdown?: string | undefined;

  @Expose()
  @Transform(({ obj, value }) => (obj.enabled ? value : undefined))
  @Localize()
  declare message: Localized;

  @Exclude()
  disableOnCountdownEnd?: boolean = undefined;
}
