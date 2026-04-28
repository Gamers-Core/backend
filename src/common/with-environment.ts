import { Environment, getEnvironment } from 'src/config';

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
  environment: string | undefined = process.env.NODE_ENV,
): T | Promise<T> {
  const env = getEnvironment(environment);

  const isValid = envs.includes(env);

  return callback(isValid, env);
}
