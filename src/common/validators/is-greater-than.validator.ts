import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsGreaterThan(property: string, options?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isGreaterThan',
      propertyName,
      target: object.constructor,
      constraints: [property],
      options,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;

          if (!(relatedPropertyName in args.object)) return true;

          const relatedValue = args.object[relatedPropertyName];

          if (typeof value !== 'number' || typeof relatedValue !== 'number') return true;

          return value > relatedValue;
        },
      },
    });
  };
}
