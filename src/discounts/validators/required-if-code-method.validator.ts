import { ValidationOptions, registerDecorator, ValidationArguments } from 'class-validator';

import { CreateDiscountDTO } from '../dtos/admin/create-discount.dto';

export const RequiredIfCodeMethod = (validationOptions?: ValidationOptions) => (object: object, propertyName: string) =>
  registerDecorator({
    name: 'requiredIfCodeMethod',
    target: object.constructor,
    propertyName,
    options: validationOptions,
    validator: {
      validate(value: unknown, args: ValidationArguments) {
        const obj = args.object as CreateDiscountDTO;
        if (obj.method === 'code') return typeof value === 'string' && value.trim().length > 0;

        return value === undefined || value === null;
      },
    },
  });
