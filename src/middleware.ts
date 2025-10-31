import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';
import { getServerBaseUrl } from '@/lib/utils/get-base-url';

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Get proper base URL (replaces 0.0.0.0 with localhost)
  const baseUrl = getServerBaseUrl(req.url);

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              req.cookies.set(name, value);
            });
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            });
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      logger.debug('Auth error in middleware:', error.message);
    }

    // Protect /exam and /dashboard routes - require authentication
    if ((req.nextUrl.pathname.startsWith('/exam') || req.nextUrl.pathname.startsWith('/dashboard')) && !session) {
      return NextResponse.redirect(new URL('/auth/login', baseUrl));
    }

    // If already authenticated, redirect away from auth pages to dashboard
    // EXCEPT for reset-password and verify-otp pages (needed for password reset flow)
    if (req.nextUrl.pathname.startsWith('/auth') && session) {
      const isResetPassword = req.nextUrl.pathname === '/auth/reset-password';
      const isVerifyOtp = req.nextUrl.pathname === '/auth/verify-otp';

      if (!isResetPassword && !isVerifyOtp) {
        return NextResponse.redirect(new URL('/dashboard', baseUrl));
      }
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    if (req.nextUrl.pathname.startsWith('/exam') || req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth/login', baseUrl));
    }
    return response;
  }
}

export const config = {
  matcher: ['/exam/:path*', '/dashboard/:path*', '/auth/:path*'],
};
