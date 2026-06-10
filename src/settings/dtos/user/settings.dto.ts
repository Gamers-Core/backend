import { Expose, Type } from 'class-transformer';

import { MaintenanceModeDTO } from './maintenance-mode.dto';

export class SettingsDTO {
  @Expose()
  @Type(() => MaintenanceModeDTO)
  maintenanceMode: MaintenanceModeDTO;
}
