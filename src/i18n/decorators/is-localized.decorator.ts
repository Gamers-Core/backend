import { registerDecorator, ValidationOptions } from 'class-validator';

import { isLocaleKey } from '../helpers';
import { Localized } from '../types';
import { defaultLocale } from '../const';

export const IsLocalized = (validationOptions?: ValidationOptions) => (target: object, propertyName: string) =>
  registerDecorator({
    name: 'isLocalized',
    propertyName,
    target: target.constructor,
    options: validationOptions,
    validator: {
      validate(value: unknown) {
        if (!value || typeof value !== 'object' || !(defaultLocale in value)) return false;

        const localized = value as Localized;
        return Object.entries(localized).every(([key, text]) => {
          if (!isLocaleKey(key)) return false;

          return typeof text === 'string' && text.trim().length >= 2;
        });
      },
    },
  });
