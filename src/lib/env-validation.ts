/**
 * Environment variable validation
 * Validates all required environment variables at build time and runtime
 */

import { z } from 'zod';
import { logger } from './logger';

// Define the schema for environment variables
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Supabase (required)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  
  // API Keys (optional but recommended for production)
  HYBRID_JOBS_API_KEY: z.string().min(32, 'HYBRID_JOBS_API_KEY should be at least 32 characters').optional(),
  FEED_STATS_TOKEN: z.string().optional(),
  
  // Site configuration
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  VERCEL_URL: z.string().optional(),
  
  // Analytics (optional)
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS: z.enum(['true', 'false']).optional(),
  NEXT_PUBLIC_ENABLE_VERCEL_SPEED_INSIGHTS: z.enum(['true', 'false']).optional(),
  
  // Development flags
  NEXT_PUBLIC_DEV_AUTO_AUTH: z.enum(['0', '1']).optional(),
  
  // Sentry (optional)
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

// Validate environment variables
export function validateEnv(): { success: boolean; errors?: string[] } {
  try {
    const parsed = envSchema.safeParse(process.env);
    
    if (!parsed.success) {
      const errors = parsed.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      
      logger.error('[env-validation] Environment validation failed', { errors });
      
      // In production, log warnings but don't crash
      if (process.env.NODE_ENV === 'production') {
        logger.warn('[env-validation] Running with invalid environment (production)');
        return { success: false, errors };
      }
      
      // In development, provide clear error messages
      console.error('\n❌ Environment Validation Failed:\n');
      errors.forEach(err => console.error(`  - ${err}`));
      console.error('\nPlease check your .env.local file\n');
      
      return { success: false, errors };
    }
    
    // Check for production-specific requirements
    if (process.env.NODE_ENV === 'production') {
      const warnings: string[] = [];
      
      if (!parsed.data.HYBRID_JOBS_API_KEY) {
        warnings.push('HYBRID_JOBS_API_KEY is not set - POST endpoint will be insecure');
      }
      
      if (!parsed.data.NEXT_PUBLIC_SITE_URL && !parsed.data.VERCEL_URL) {
        warnings.push('NEXT_PUBLIC_SITE_URL is not set - using fallback URL');
      }
      
      if (warnings.length > 0) {
        logger.warn('[env-validation] Production warnings', { warnings });
      }
    }
    
    logger.info('[env-validation] Environment validated successfully');
    return { success: true };
    
  } catch (error) {
    logger.error('[env-validation] Unexpected error during validation', { error });
    return { 
      success: false, 
      errors: [error instanceof Error ? error.message : 'Unknown error'] 
    };
  }
}

// Helper to get typed environment variable
export function getEnv<K extends keyof Env>(key: K): Env[K] | undefined {
  return process.env[key] as Env[K] | undefined;
}

// Helper to require environment variable (throws if missing)
export function requireEnv<K extends keyof Env>(key: K): NonNullable<Env[K]> {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is missing`);
  }
  return value as NonNullable<Env[K]>;
}

// Check if we're in a specific environment
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

// Auto-validate on import in development
if (isDevelopment || isTest) {
  const result = validateEnv();
  if (!result.success && isTest) {
    // In test environment, just warn
    console.warn('[env-validation] Test environment has validation errors (this is OK)');
  }
}

