import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Public GET endpoints — frontend fetches these without auth
const PUBLIC_GET_ROUTES = [
  '/api/projects',
  '/api/services',
  '/api/team',
  '/api/testimonials',
  '/api/blog',
  '/api/settings',
  '/api/stats',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const reqMethod = req.method;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const role = (token as any)?.role as string | undefined;

  // ── /login ──────────────────────────────────────────────────────────────
  if (pathname === '/login') {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // ── /dashboard ──────────────────────────────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!isLoggedIn) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    const adminRoutes = ['/dashboard/users', '/dashboard/settings'];
    if (adminRoutes.some((r) => pathname.startsWith(r)) && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // ── /api routes ──────────────────────────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    // Always allow: auth + setup
    if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/setup')) {
      return NextResponse.next();
    }

    // Allow public GET requests (frontend reads)
    const isPublicGet =
      reqMethod === 'GET' &&
      PUBLIC_GET_ROUTES.some((route) => pathname.startsWith(route));

    if (isPublicGet) {
      return NextResponse.next();
    }

    // Everything else requires login
    if (!isLoggedIn) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Admin-only write routes
    if (pathname.startsWith('/api/users') && role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/api/:path*'],
};
