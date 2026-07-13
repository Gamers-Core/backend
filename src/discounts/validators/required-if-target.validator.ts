import { ValidationOptions, registerDecorator, ValidationArguments } from 'class-validator';

import { CreateDiscountDTO } from '../dtos/admin/create-discount.dto';

export const RequiredIfTarget =
  (target: string, validationOptions?: ValidationOptions) => (object: object, propertyName: string) =>
    registerDecorator({
      name: 'requiredIfTarget',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const obj = args.object as CreateDiscountDTO;
          if (obj.target !== target) return true;

          return Array.isArray(value) && value.length > 0;
        },
      },
    });
