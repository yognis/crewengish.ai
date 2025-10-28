import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(new URL('/auth/login?error=verification_failed', request.url));
    }

    // Successfully verified - redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // No code provided - redirect to login
  return NextResponse.redirect(new URL('/auth/login', request.url));
}
