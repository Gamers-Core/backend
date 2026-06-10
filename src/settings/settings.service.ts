import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CacheService } from 'src/redis/cache.service';

import { SETTINGS_MAP } from './const';
import { Setting } from './entities/setting.entity';
import { SettingKey, SettingsMap } from './types';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting) private repo: Repository<Setting>,
    private readonly cacheService: CacheService,
  ) {}

  async getAll(): Promise<SettingsMap> {
    return this.cacheService.getOrSet(
      'settings:all',
      async () => {
        const settings = await this.repo.find();
        const defaults = Object.fromEntries(
          Object.entries(SETTINGS_MAP).map(([key, DtoClass]) => [key, new DtoClass()]),
        ) as unknown as SettingsMap;

        return settings.reduce<SettingsMap>((acc, setting) => {
          acc[setting.key] = setting.value;

          return acc;
        }, defaults);
      },
      { ttlMs: 1000 * 60 * 60 },
    );
  }

  async get<K extends SettingKey>(key: K): Promise<InstanceType<SettingsMap[K]>> {
    return this.cacheService.getOrSet(
      `settings:${key}`,
      async () => {
        const setting = await this.repo.findOne({ where: { key } });

        const DTOClass = SETTINGS_MAP[key];
        const defaults = new DTOClass() as InstanceType<typeof DTOClass>;

        return (setting?.value as InstanceType<typeof DTOClass>) ?? defaults;
      },
      { ttlMs: 1000 * 60 * 60 },
    );
  }

  async set<K extends SettingKey>(key: K, value: SettingsMap[K]) {
    await this.repo.upsert({ key, value }, ['key']);

    await this.cacheService.delete(`settings:${key}`);
    await this.cacheService.delete(`settings:all`);

    return this.get(key);
  }
}
