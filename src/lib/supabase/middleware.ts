import { createServerClient } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';

import type { Database } from '@/lib/database.types';

type RequiredEnvKeys = 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY';

function getEnvVar(key: RequiredEnvKeys) {
  const envFromProcess =
    typeof process !== 'undefined' && process?.env ? process.env[key] : undefined;
  const envFromGlobal =
    typeof globalThis !== 'undefined' && (globalThis as any)?.process?.env
      ? (globalThis as any).process.env[key]
      : undefined;

  const value = envFromProcess ?? envFromGlobal;

  if (!value) {
    throw new Error(`${key} is not set`);
  }

  return value;
}

export function createMiddlewareClient(req: NextRequest, res: NextResponse) {
  return createServerClient<Database>(
    getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() {
          return req.cookies
            .getAll()
            .map((cookie) => ({ name: cookie.name, value: cookie.value }));
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set({
              name,
              value,
              ...options,
            });
          });
        },
      },
    }
  );
}

