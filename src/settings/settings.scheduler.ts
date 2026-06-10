import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { SETTINGS_MAP } from './const';
import { SettingsService } from './settings.service';
import { SettingKey } from './types';

@Injectable()
export class SettingsScheduler {
  constructor(private readonly settingsService: SettingsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCrons() {
    await Promise.all(
      (Object.entries(SETTINGS_MAP) as [SettingKey, any][])
        .filter(([, DTOClass]) => DTOClass.cronHandler)
        .map(async ([key, DTOClass]) => {
          const value = await this.settingsService.get(key);

          await DTOClass.cronHandler(value, (updated: any) => this.settingsService.set(key, updated));
        }),
    );
  }
}
