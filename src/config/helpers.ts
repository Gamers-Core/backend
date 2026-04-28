import { defaultEnvironment, environments } from './const';
import { Environment } from './types';

export const getEnvironment = (value: unknown): Environment =>
  environments.find((environment) => environment === value) ?? defaultEnvironment;
