// src/lib/getSafeUser.ts
import type { SupabaseClient, User } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';
import { createClient as createBrowserClient } from '@/lib/supabase/client';

type TypedSupabaseClient = SupabaseClient<Database>;

export async function getSafeUser(existingClient?: TypedSupabaseClient): Promise<{ user: User | null }> {
  const supabase = existingClient ?? createBrowserClient();

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session ?? null;
  if (!session) {
    return { user: null } as const;
  }

  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return { user: null } as const;
  }

  return { user: data.user ?? null } as const;
}

