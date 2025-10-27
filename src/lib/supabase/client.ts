import { createBrowserClient } from '@supabase/ssr';

import type { Database } from '@/lib/database.types';

export function createClient() {
  // Use process.env.NEXT_PUBLIC_* directly for client components
  // Next.js inlines these at build time, making them available in the browser
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
