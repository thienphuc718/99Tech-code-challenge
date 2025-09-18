import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().default(process.env.NODE_ENV === 'test' ? 'file:./test.db' : 'file:./dev.db'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  RATE_LIMIT_CREATE_USER_MAX: z.string().transform(Number).default('5'),
  RATE_LIMIT_STRICT_MAX: z.string().transform(Number).default('20'),
});

function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('Invalid environment configuration:', error);
    process.exit(1);
  }
}

export const config = validateEnv();

export type Config = typeof config;