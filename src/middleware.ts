import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

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
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // If already authenticated, redirect away from auth pages to dashboard
    if (req.nextUrl.pathname.startsWith('/auth') && session) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    if (req.nextUrl.pathname.startsWith('/exam') || req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    return response;
  }
}

export const config = {
  matcher: ['/exam/:path*', '/dashboard/:path*', '/auth/:path*'],
};
