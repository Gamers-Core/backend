import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SettingMedia } from 'src/media/entities/setting-media.entity';
import { MediaModule } from 'src/media/media.module';

import { AdminSettingsController } from './controllers/admin-settings.controller';
import { SettingsController } from './controllers/settings.controller';
import { Setting } from './entities/setting.entity';
import { SettingsScheduler } from './settings.scheduler';
import { SettingsService } from './settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Setting, SettingMedia]), MediaModule],
  controllers: [SettingsController, AdminSettingsController],
  providers: [SettingsService, SettingsScheduler],
  exports: [SettingsService],
})
export class SettingsModule {}
