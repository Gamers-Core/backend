import { getEnvironment } from 'src/config/helpers';
import { Environment } from 'src/config/types';

export function withEnvironment<T>(
  callback: (isValid: boolean, env: Environment) => T,
  envs: Environment[],
  env?: Environment,
): T;

export function withEnvironment<T>(
  callback: (isValid: boolean, env: Environment) => Promise<T>,
  envs: Environment[],
  env?: Environment,
): Promise<T>;

export function withEnvironment<T>(
  callback: (isValid: boolean, env: Environment) => T | Promise<T>,
  envs: Environment[],
  environment?: string,
): T | Promise<T> {
  const env = getEnvironment(environment);

  const isValid = envs.includes(env);

  return callback(isValid, env);
}
