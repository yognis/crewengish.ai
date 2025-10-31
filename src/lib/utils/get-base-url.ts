/**
 * Get the base URL for the application.
 * 
 * In client components, this ensures we use localhost instead of 0.0.0.0,
 * which can cause issues with email confirmation links.
 * 
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL env variable (set at build time)
 * 2. window.location.origin with 0.0.0.0 replaced by localhost
 * 3. http://localhost:3001 as fallback
 */
export function getBaseUrl(): string {
  // In client components, process.env.NEXT_PUBLIC_SITE_URL is inlined at build time
  // If it's not set in .env.local, it will be undefined
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (envUrl) {
    // Even if env variable is set, replace 0.0.0.0 with localhost
    if (envUrl.includes('0.0.0.0')) {
      return envUrl.replace('0.0.0.0', 'localhost');
    }
    return envUrl;
  }

  // Fallback to window.location.origin, but replace 0.0.0.0 with localhost
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // Replace 0.0.0.0:PORT with localhost:PORT
    if (origin.includes('0.0.0.0')) {
      return origin.replace('0.0.0.0', 'localhost');
    }
    return origin;
  }

  // Server-side fallback (should not happen in client components)
  return 'http://localhost:3001';
}

/**
 * Get the base URL for server-side code (route handlers, middleware).
 * 
 * This version ensures we always use localhost instead of 0.0.0.0,
 * even when the request URL contains 0.0.0.0.
 */
export function getServerBaseUrl(requestUrl?: string | URL): string {
  // Priority 1: Environment variable
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) {
    // Replace 0.0.0.0 with localhost even in env variable
    if (envUrl.includes('0.0.0.0')) {
      return envUrl.replace('0.0.0.0', 'localhost');
    }
    return envUrl;
  }

  // Priority 2: Parse request URL and fix it
  if (requestUrl) {
    try {
      const url = typeof requestUrl === 'string' ? new URL(requestUrl) : requestUrl;
      let origin = url.origin;
      
      // Replace 0.0.0.0 with localhost
      if (origin.includes('0.0.0.0')) {
        origin = origin.replace('0.0.0.0', 'localhost');
      }
      return origin;
    } catch (e) {
      // Invalid URL, fall through to default
    }
  }

  // Priority 3: Default fallback
  return 'http://localhost:3001';
}

/**
 * Get the callback URL for auth redirects
 */
export function getAuthCallbackUrl(): string {
  return `${getBaseUrl()}/auth/callback`;
}

