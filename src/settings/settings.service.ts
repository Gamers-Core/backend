import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { BadRequestException } from 'src/common/exceptions';
import { MediaDTO } from 'src/media/dtos/user/media.dto';
import { SettingMedia } from 'src/media/entities/setting-media.entity';
import { MediaService } from 'src/media/services/media.service';
import { CacheService } from 'src/redis/cache.service';

import { SETTINGS_MAP } from './const';
import { Setting } from './entities/setting.entity';
import { SettingKey, SettingsMap } from './types';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting) private repo: Repository<Setting>,
    private readonly cacheService: CacheService,
    private readonly mediaService: MediaService,
  ) {}

  async getAll(): Promise<SettingsMap> {
    return this.cacheService.getOrSet(
      'settings:all',
      async () => {
        const settings = await this.repo.find({
          relations: { media: { media: true } },
          order: { media: { order: 'ASC' } },
        });
        const defaults = Object.fromEntries(
          Object.entries(SETTINGS_MAP).map(([key, DtoClass]) => [key, new DtoClass()]),
        ) as unknown as SettingsMap;

        return settings.reduce<SettingsMap>((acc, setting) => {
          acc[setting.key] = setting.value;

          const media = setting.media.map((m) => m.media);
          if (media.length) (acc[setting.key] as unknown as { media: MediaDTO[] }).media = media;

          return acc;
        }, defaults);
      },
      { ttlMs: 1000 * 60 * 60 * 12 },
    );
  }

  async get<K extends SettingKey>(key: K): Promise<InstanceType<SettingsMap[K]>> {
    return this.cacheService.getOrSet(
      `settings:${key}`,
      async () => {
        const setting = await this.repo.findOne({
          where: { key },
          relations: { media: { media: true } },
          order: { media: { order: 'ASC' } },
        });

        const DTOClass = SETTINGS_MAP[key];
        const defaults = new DTOClass() as InstanceType<typeof DTOClass>;
        if (!setting) return defaults;

        const value = setting.value as InstanceType<typeof DTOClass>;

        const media = setting.media.map((m) => m.media);
        if (media.length) (value as unknown as { media: MediaDTO[] }).media = media;

        return value;
      },
      { ttlMs: 1000 * 60 * 60 * 12 },
    );
  }

  async set<K extends SettingKey>(key: K, value: SettingsMap[K]) {
    await this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Setting);

      await repo.upsert({ key, value }, ['key']);

      const settingValue = value as InstanceType<(typeof SETTINGS_MAP)[K]>;
      if ('mediaIds' in settingValue) await this.attachMediaToSetting(key, settingValue.mediaIds, manager);
    });

    await this.cacheService.delete(`settings:${key}`);
    await this.cacheService.delete(`settings:all`);

    return this.get(key);
  }

  private async attachMediaToSetting(key: SettingKey, mediaIds: number[] | undefined, manager: EntityManager) {
    const repo = manager.getRepository(Setting);
    const settingMediaRepo = manager.getRepository(SettingMedia);

    const setting = await repo.findOne({
      where: { key },
      select: { id: true, media: { id: true } },
      relations: { media: true },
    });
    if (!setting) throw BadRequestException('settings.settingNotFound');

    for (const media of setting.media) await this.mediaService.detach(media.id, manager);

    await settingMediaRepo.delete({ setting: { id: setting.id } });

    if (!mediaIds) return;
    const uniqueMediaIds = [...new Set(mediaIds)];

    const attachments = uniqueMediaIds.map((mediaId, index) =>
      settingMediaRepo.create({
        setting: { id: setting.id },
        media: { id: mediaId },
        order: index + 1,
      }),
    );
    await settingMediaRepo.save(attachments);

    for (const id of uniqueMediaIds) await this.mediaService.attach(id, manager);
  }
}
