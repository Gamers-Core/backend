import { AnnouncementSettingDTO } from './dtos/announcement.setting.dto';
import { MaintenanceModeSettingDTO } from './dtos/maintenance-mode.setting.dto';
import type { SettingKey } from './types';

export const SETTINGS_MAP = {
  maintenanceMode: MaintenanceModeSettingDTO,
  announcement: AnnouncementSettingDTO,
};

export const SETTINGS_KEYS = Object.keys(SETTINGS_MAP) as SettingKey[];
