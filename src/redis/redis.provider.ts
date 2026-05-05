import { FactoryProvider } from '@nestjs/common';
import Redis from 'ioredis';

import { ConfigService } from 'src/config/config.service';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

export const RedisProvider: FactoryProvider<Redis> = {
  provide: REDIS_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const redisUrl = configService.get('REDIS_URL');

    return new Redis(redisUrl, { tls: redisUrl.startsWith('rediss://') ? {} : undefined });
  },
};
