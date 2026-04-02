import { ValueTransformer } from 'typeorm';

export const parse: ValueTransformer = {
  to: <T extends object>(value: T) => value,
  from: <T extends object>(value: T | string): T => {
    if (typeof value === 'string') return JSON.parse(value);

    return value;
  },
};
