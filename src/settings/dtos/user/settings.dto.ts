import { Expose, Type } from 'class-transformer';

import { AnnouncementDTO } from './announcement.dto';
import { MaintenanceModeDTO } from './maintenance-mode.dto';

export class SettingsDTO {
  @Expose()
  @Type(() => MaintenanceModeDTO)
  maintenanceMode: MaintenanceModeDTO;

  @Expose()
  @Type(() => AnnouncementDTO)
  announcement: AnnouncementDTO;
}
