import { IsOptional, getMetadataStorage } from 'class-validator';

type ClassConstructor<T = object> = new (...args: never[]) => T;

export function PartialType<T>(
  classRef: ClassConstructor<T>,
): ClassConstructor<Partial<T>> {
  abstract class PartialClass extends (classRef as ClassConstructor) {}

  const metadataStorage = getMetadataStorage();
  const validations = metadataStorage.getTargetValidationMetadatas(
    classRef,
    '',
    false,
    false,
  );

  const properties = new Set(
    validations.map(({ propertyName }) => propertyName),
  );

  for (const property of properties) {
    IsOptional()(PartialClass.prototype, property);
  }

  return PartialClass as ClassConstructor<Partial<T>>;
}
