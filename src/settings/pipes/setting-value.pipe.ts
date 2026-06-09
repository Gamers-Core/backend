import { Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

import { BadRequestException, ValidationException } from 'src/common/exceptions';

import { SETTINGS_MAP } from '../const';
import type { SettingKey } from '../types';

@Injectable()
export class SettingValuePipe implements PipeTransform {
  constructor(private readonly key: SettingKey) {}

  async transform(value: unknown) {
    if (value === undefined || value === null) throw BadRequestException('isNotEmpty');

    const DefaultClass = SETTINGS_MAP[this.key] as new (...args: any[]) => unknown;
    const defaults = new DefaultClass() as Record<string, unknown>;
    const instance = plainToInstance(
      DefaultClass,
      {
        ...defaults,
        ...(value as Record<string, unknown>),
      },
      { excludeExtraneousValues: true },
    );

    await validateOrReject(instance as object).catch(([error]) => {
      throw new ValidationException([error]);
    });

    return instance;
  }
}
