import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

import { CreateDiscountDTO } from '../dtos/admin/create-discount.dto';

export const MaxIfPercentage = (validationOptions?: ValidationOptions) => (object: object, propertyName: string) =>
  registerDecorator({
    name: 'maxIfPercentage',
    target: object.constructor,
    propertyName,
    options: validationOptions,
    validator: {
      validate(value: number, args: ValidationArguments) {
        const obj = args.object as CreateDiscountDTO;
        if (obj.valueType === 'percentage') return value <= 100;

        return true;
      },
    },
  });
