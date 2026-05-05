import { defaultEnvironment, environments } from './const';
import { Environment } from './types';

export const getEnvironment = (value: unknown = process.env.NODE_ENV): Environment =>
  environments.find((environment) => environment === value) ?? defaultEnvironment;
