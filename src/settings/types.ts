import { SETTINGS_MAP } from './const';

export type SettingKey = keyof SettingsMap;
export type SettingsMap = typeof SETTINGS_MAP;
