import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  try {
    const supabase = createMiddlewareClient({ req, res });
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

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    if (req.nextUrl.pathname.startsWith('/exam') || req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    return res;
  }
}

export const config = {
  matcher: ['/exam/:path*', '/dashboard/:path*', '/auth/:path*'],
};
