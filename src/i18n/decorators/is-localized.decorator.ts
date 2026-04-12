import { registerDecorator, ValidationOptions } from 'class-validator';

import { i18nKeyValidator, isLocalized } from '../helpers';

export const IsLocalized = (validationOptions?: ValidationOptions) => (target: object, propertyName: string) =>
  registerDecorator({
    name: 'isLocalized',
    propertyName,
    target: target.constructor,
    options: {
      ...validationOptions,
      message: validationOptions?.message ?? i18nKeyValidator('isLocalized'),
    },
    validator: { validate: isLocalized },
  });
