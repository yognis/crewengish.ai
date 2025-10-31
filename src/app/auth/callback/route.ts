import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerBaseUrl } from '@/lib/utils/get-base-url';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  // Get proper base URL (replaces 0.0.0.0 with localhost)
  const baseUrl = getServerBaseUrl(request.url);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      console.log('[Callback] Redirecting to:', `${baseUrl}/auth/login?error=verification_failed`);
      return NextResponse.redirect(new URL('/auth/login?error=verification_failed', baseUrl));
    }

    // Successfully verified - redirect to dashboard
    console.log('[Callback] Success! Redirecting to:', `${baseUrl}/dashboard`);
    return NextResponse.redirect(new URL('/dashboard', baseUrl));
  }

  // No code provided - redirect to login
  console.log('[Callback] No code, redirecting to:', `${baseUrl}/auth/login`);
  return NextResponse.redirect(new URL('/auth/login', baseUrl));
}
