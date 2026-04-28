import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

import { BaseSchema, EnvVariables, ExtendedEnv } from './schemas';
import { Environment } from './types';

@Injectable()
export class ConfigService {
  constructor(private readonly configService: NestConfigService<EnvVariables, true>) {}

  get<K extends keyof BaseSchema>(key: K): BaseSchema[K];
  get<K extends keyof EnvVariables>(key: K): EnvVariables[K];
  get<K extends keyof ExtendedEnv>(key: K): ExtendedEnv[K] {
    return this.configService.get(key, { infer: true });
  }

  get environment(): Environment {
    return this.get('NODE_ENV');
  }
}
