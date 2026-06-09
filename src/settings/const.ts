import { MaintenanceModeSettingDTO } from './dtos/maintenance-mode.setting.dto';
import { SettingKey } from './types';

export const SETTINGS_MAP = {
  maintenanceMode: MaintenanceModeSettingDTO,
};

export const SETTINGS_KEYS = Object.keys(SETTINGS_MAP) as SettingKey[];
