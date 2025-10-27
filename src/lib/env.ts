import { logger } from './logger';

/**
 * Centralized environment variable validation.
 * Throws descriptive errors when required values are missing.
 */
interface EnvVars {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  OPENAI_API_KEY: string;
}

function getEnvVar(key: keyof EnvVars, isPublic = false): string {
  const value = process.env[key];

  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
        `Please add it to your .env.local file.\n` +
        (isPublic
          ? 'Public variables must be prefixed with NEXT_PUBLIC_.'
          : 'Server-side variables must NOT have the NEXT_PUBLIC_ prefix.')
    );
  }

  return value;
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: getEnvVar('NEXT_PUBLIC_SUPABASE_URL', true),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', true),
  get SUPABASE_SERVICE_ROLE_KEY() {
    if (typeof window !== 'undefined') {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY cannot be accessed on the client side.');
    }
    return getEnvVar('SUPABASE_SERVICE_ROLE_KEY');
  },
  get OPENAI_API_KEY() {
    if (typeof window !== 'undefined') {
      throw new Error('OPENAI_API_KEY cannot be accessed on the client side.');
    }
    return getEnvVar('OPENAI_API_KEY');
  },
} as const;

if (typeof window === 'undefined') {
  logger.info('✅ All environment variables validated');
} else {
  logger.info('✅ Public environment variables validated');
}
