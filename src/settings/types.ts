import type { SETTINGS_MAP } from './const';

export type SettingsMap = typeof SETTINGS_MAP;
export type SettingKey = keyof SettingsMap;

export interface SettingCronHandler<T> {
  (value: T, set: (value: T) => Promise<T>): Promise<void> | void;
}
