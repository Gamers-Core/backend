import { z } from 'zod';

import { environments, defaultEnvironment } from './const';
import { Environment } from './types';

const baseSchema = z.object({
  NODE_ENV: z.enum(environments).default(defaultEnvironment),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  COOKIE_KEY: z.string(),
  REDIS_URL: z.string(),
  BOSTA_TOKEN: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  FRONTEND_URL: z.url(),
});

const localSchema = z.object({
  ...baseSchema.shape,
});

const developmentSchema = z.object({
  ...localSchema.shape,
  COOKIE_DOMAIN: z.string(),
});
const stagingSchema = z.object({
  ...developmentSchema.shape,
  BREVO_API_KEY: z.string(),
  EMAIL_USER: z.string(),
  EMAIL_PASS: z.string(),
});
const productionSchema = z.object({
  ...stagingSchema.shape,
  WHATSAPP_PHONE_NUMBER_ID: z.string(),
  WHATSAPP_TOKEN: z.string(),
  WHATSAPP_WEBHOOK_SECRET: z.string(),
  WHATSAPP_APP_SECRET: z.string(),
  BOSTA_WEBHOOK_SECRET: z.string(),
});

export const envVariablesSchemaMap = {
  local: localSchema,
  development: developmentSchema,
  staging: stagingSchema,
  production: productionSchema,
} satisfies Record<Environment, z.ZodType>;
export type EnvVariablesSchemas = z.infer<(typeof envVariablesSchemaMap)[Environment]>;

export type BaseSchema = z.infer<typeof baseSchema>;
export type ExtendedEnv = Omit<z.infer<typeof productionSchema>, keyof BaseSchema>;
export type EnvVariables = BaseSchema & {
  [K in keyof ExtendedEnv]?: ExtendedEnv[K];
};
