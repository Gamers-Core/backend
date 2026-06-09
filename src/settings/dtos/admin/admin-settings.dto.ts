import { Expose, Type } from 'class-transformer';

import { MaintenanceModeSettingDTO } from '../maintenance-mode.setting.dto';

export class AdminSettingsDTO {
  @Expose()
  @Type(() => MaintenanceModeSettingDTO)
  maintenanceMode: MaintenanceModeSettingDTO;
}
