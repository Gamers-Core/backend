import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';

const DEFAULT_TTL_MS = 300_000;

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    return (await this.cache.get<T>(key)) ?? null;
  }

  async set<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS): Promise<void> {
    await this.cache.set(key, value, ttlMs);
  }

  async getOrSet<T>(key: string, resolver: () => Promise<T>, options: { ttlMs?: number } = {}): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await resolver();
    await this.set(key, value, options.ttlMs ?? DEFAULT_TTL_MS);
    return value;
  }

  async delete(key: string): Promise<void> {
    await this.cache.del(key);
  }
}
