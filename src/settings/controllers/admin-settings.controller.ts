import { Body, Controller, Get, Param, ParseEnumPipe, Put, UseGuards } from '@nestjs/common';

import { IsAdminAuthGuard } from 'src/auth/guards/is-admin-auth.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';

import { SETTINGS_KEYS } from '../const';
import { AdminSettingsDTO } from '../dtos/admin/admin-settings.dto';
import { SettingValuePipe } from '../pipes/setting-value.pipe';
import { SettingsService } from '../settings.service';
import type { SettingKey } from '../types';

@Controller('admin/settings')
@UseGuards(IsAdminAuthGuard)
export class AdminSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Serialize(AdminSettingsDTO)
  getSettings() {
    return this.settingsService.getAll();
  }

  @Get(':key')
  getSetting(@Param('key', new ParseEnumPipe(SETTINGS_KEYS)) key: SettingKey) {
    return this.settingsService.get(key);
  }

  @Put(':key')
  async updateSetting(@Param('key', new ParseEnumPipe(SETTINGS_KEYS)) key: SettingKey, @Body() value: unknown) {
    return this.settingsService.set(key, (await new SettingValuePipe(key).transform(value)) as any);
  }
}
