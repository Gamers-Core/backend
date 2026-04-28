import { Environment, getEnvironment } from 'src/config';

export const withEnvironment = <T>(
  envs: Environment[],
  callback: (isValid: boolean, env: Environment) => T | Promise<T>,
): T | Promise<T> => {
  const env = getEnvironment(process.env.NODE_ENV);

  const isValid = envs.includes(env);

  return callback(isValid, env);
};
