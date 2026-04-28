import { EnvVariablesSchemas, envVariablesSchemaMap } from './schemas';
import { getEnvironment } from './helpers';

export function validate(config: Record<string, unknown>): EnvVariablesSchemas {
  const environment = getEnvironment(config['NODE_ENV']);
  const schema = envVariablesSchemaMap[environment];

  const result = schema.safeParse(config);
  if (result.success) return result.data;

  const formatted = result.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Invalid environment config for NODE_ENV="${environment}":\n${formatted}`);
}
