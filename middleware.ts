// Temporary middleware bypass for testing
// This file will prevent any middleware from redirecting admin routes

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Allow all admin routes during testing
  if (pathname.startsWith('/admin')) {
    console.log(`[Middleware] Allowing admin route: ${pathname}`);
    return NextResponse.next();
  }
  
  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};