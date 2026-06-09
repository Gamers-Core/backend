import { Controller, Get } from '@nestjs/common';

import { SkipMaintenance } from '../decorators/skip-maintenance.decorator';
import { SettingsService } from '../settings.service';

@SkipMaintenance()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getAll();
  }
}
