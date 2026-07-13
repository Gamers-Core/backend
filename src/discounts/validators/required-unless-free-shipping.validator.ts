import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

import { CreateDiscountDTO } from '../dtos/admin/create-discount.dto';

export const RequiredUnlessFreeShipping =
  (validationOptions?: ValidationOptions) => (object: object, propertyName: string) =>
    registerDecorator({
      name: 'requiredUnlessFreeShipping',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const obj = args.object as CreateDiscountDTO;
          if (obj.target === 'free_shipping') return true;

          return value !== undefined && value !== null;
        },
      },
    });
