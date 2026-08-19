import { Expose, Type } from 'class-transformer';

import { AnnouncementSettingDTO } from '../announcement.setting.dto';
import { MaintenanceModeSettingDTO } from '../maintenance-mode.setting.dto';

export class AdminSettingsDTO {
  @Expose()
  @Type(() => MaintenanceModeSettingDTO)
  maintenanceMode: MaintenanceModeSettingDTO;

  @Expose()
  @Type(() => AnnouncementSettingDTO)
  announcement: AnnouncementSettingDTO;
}
