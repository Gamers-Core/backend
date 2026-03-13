import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        if (process.env.REDIS_URL) {
          const tlsEnabled = process.env.REDIS_URL.startsWith('rediss://');

          return new Redis(process.env.REDIS_URL, {
            tls: tlsEnabled ? {} : undefined,
          });
        }

        return new Redis({
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: Number(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD,
          tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
        });
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
