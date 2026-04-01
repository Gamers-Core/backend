import { ValidationError } from 'class-validator';

export const formatErrors = (errors: ValidationError[]) =>
  errors.map((error) => ({
    property: error.property,
    codes: Object.keys(error.constraints ?? {}),
    children: error.children?.length ? formatErrors(error.children) : [],
  }));
