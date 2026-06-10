import { Exclude } from 'class-transformer';

import { Localize } from 'src/i18n/decorators/localize.decorator';
import type { Localized } from 'src/i18n/types';

import { MaintenanceModeSettingDTO } from '../maintenance-mode.setting.dto';

export class MaintenanceModeDTO extends MaintenanceModeSettingDTO {
  @Localize()
  declare message: Localized;

  @Exclude()
  disableOnCountdownEnd?: boolean = undefined;
}
