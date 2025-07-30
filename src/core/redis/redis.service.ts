import { Inject, Injectable } from '@nestjs/common';
import Redis, { RedisKey } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async set(
    key: RedisKey,
    value: string,
    mode?: 'EX' | 'PX' | 'NX' | 'XX' | 'KEEPTTL',
    duration?: number,
  ): Promise<void> {
    const args: [RedisKey, string, ...any[]] = [key, value];

    if (mode == 'EX' || mode == 'PX') {
      if (typeof duration !== 'number') {
        throw new Error('Duration must be a number when using EX or PX mode');
      }
      args.push(mode, duration);
    } else if (mode) {
      args.push(mode);
    }
    await this.redisClient.set(...args);
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async del(key: string): Promise<number> {
    return this.redisClient.del(key);
  }
}
