import { Body, Controller, Get, Param, ParseEnumPipe, Put } from '@nestjs/common';

import { SETTINGS_KEYS } from '../const';
import { SettingValuePipe } from '../pipes/setting-value.pipe';
import { SettingsService } from '../settings.service';
import type { SettingKey } from '../types';

@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(':key')
  getSetting(@Param('key', new ParseEnumPipe(SETTINGS_KEYS)) key: SettingKey) {
    return this.settingsService.get(key);
  }

  @Put(':key')
  async updateSetting(@Param('key', new ParseEnumPipe(SETTINGS_KEYS)) key: SettingKey, @Body() value: unknown) {
    return await this.settingsService.set(key, (await new SettingValuePipe(key).transform(value)) as any);
  }
}
