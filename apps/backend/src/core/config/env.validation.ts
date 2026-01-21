import { z } from 'zod';

// Environment variables schema
const envSchema = z.object({
    // Node environment
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),

    // Server
    API_PORT: z.coerce.number().default(3001),

    // Database
    DATABASE_URL: z.string().url(),

    // Redis
    REDIS_URL: z.string().url(),

    // JWT Authentication
    JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
    JWT_ACCESS_EXPIRATION: z.string().default('15m'),
    JWT_REFRESH_EXPIRATION: z.string().default('7d'),

    // Frontend
    FRONTEND_URL: z.string().url().default('http://localhost:3000'),

    // Billing
    BILLING_WEBHOOK_SECRET: z.string().optional(),

    // Admin
    ADMIN_EMAIL: z.string().email().optional(),

    // Observability
    LOG_LEVEL: z
        .enum(['error', 'warn', 'info', 'debug', 'verbose'])
        .default('info'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function envValidation(config: Record<string, unknown>): EnvConfig {
    const result = envSchema.safeParse(config);

    if (!result.success) {
        const errors = result.error.errors
            .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
            .join('\n');

        throw new Error(`❌ Invalid environment configuration:\n${errors}`);
    }

    return result.data;
}
