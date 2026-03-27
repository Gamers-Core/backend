type Environment = 'local' | 'development' | 'staging' | 'production';

export const withEnvironment = <T>(
  envs: Environment[],
  callback: (isValid: boolean, env: Environment) => T | Promise<T>,
): T | Promise<T> => {
  const env = process.env.NODE_ENV as Environment;
  const isValid = envs.includes(env);

  return callback(isValid, env);
};
