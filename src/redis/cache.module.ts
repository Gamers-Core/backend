import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import Keyv from 'keyv';

import { CacheService } from './cache.service';
import { IoRedisKeyvAdapter } from './ioredis-keyv.adapter';
import { REDIS_CLIENT } from './redis.provider';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      inject: [REDIS_CLIENT],
      useFactory: (redis: Redis) => ({ stores: [new Keyv({ store: new IoRedisKeyvAdapter(redis) })] }),
    }),
  ],
  providers: [CacheService],
  exports: [NestCacheModule, CacheService],
})
export class CacheModule {}
