import { registerDecorator, ValidationOptions } from 'class-validator';

import { isLocalized } from '../helpers';

export const IsLocalized = (validationOptions?: ValidationOptions) => (target: object, propertyName: string) =>
  registerDecorator({
    name: 'isLocalized',
    propertyName,
    target: target.constructor,
    options: validationOptions,
    validator: { validate: isLocalized },
  });
