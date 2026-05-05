import type { Environment } from './types';

export const environments = ['local', 'development', 'staging', 'production'] as const;

export const defaultEnvironment = 'development' as const satisfies Environment;
