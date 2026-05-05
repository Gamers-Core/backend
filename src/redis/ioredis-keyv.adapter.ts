import Redis from 'ioredis';

export class IoRedisKeyvAdapter {
  readonly namespace = undefined;
  readonly ttlSupport = true;

  constructor(private readonly redis: Redis) {}

  async get(key: string): Promise<string | undefined> {
    const val = await this.redis.get(key);

    return val ?? undefined;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.set(key, value, 'PX', ttl);
      return;
    }

    await this.redis.set(key, value);
  }

  async delete(key: string): Promise<boolean> {
    const result = await this.redis.del(key);

    return result > 0;
  }

  async clear(): Promise<void> {
    await this.redis.flushdb();
  }

  async has(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);

    return result > 0;
  }
}
