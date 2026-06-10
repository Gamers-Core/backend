import { Controller, Get } from '@nestjs/common';

import { Public } from 'src/auth/decorators/public.decorator';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';

import { SkipMaintenance } from '../decorators/skip-maintenance.decorator';
import { SettingsDTO } from '../dtos/user/settings.dto';
import { SettingsService } from '../settings.service';

@SkipMaintenance()
@Public()
@Controller('settings')
@Serialize(SettingsDTO)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getAll();
  }
}
