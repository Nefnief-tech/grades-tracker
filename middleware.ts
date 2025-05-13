import { NextResponse, type NextRequest } from "next/server";

// Paths that should skip MFA checks
const exemptPaths = [
  '/login',
  '/register', 
  '/verify-mfa', 
  '/reset-password', 
  '/verify-email',
  '/privacy-policy',
  '/terms-of-service',
  '/api/',
  '/_next/',
  '/favicon.ico',
];

// Middleware function to handle both MFA redirects and admin API requests
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Handle admin API routes - add authorization headers
  if (pathname.startsWith('/api/admin')) {
    // Get the session cookie and admin status
    const appwriteSession = request.cookies.get('appwrite_session')?.value;
    const adminStatus = request.cookies.get('admin-status')?.value;
    
    // Create a new request with the Authorization header
    if (appwriteSession) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('Authorization', `Bearer ${appwriteSession}`);
      
      // Add admin status as a custom header
      if (adminStatus === 'true') {
        requestHeaders.set('X-Admin-Status', 'true');
      }
      
      // Return with the added headers
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
    
    return NextResponse.next();
  }
  
  // Skip exempt paths for MFA checks
  if (exemptPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Check for the special MFA error cookie
  const mfaRequired = request.cookies.get('mfa_required')?.value;
  
  if (mfaRequired === 'true') {
    // Clear the cookie
    const response = NextResponse.redirect(new URL('/verify-mfa', request.url));
    response.cookies.delete('mfa_required');
    
    // Add return path
    const returnUrl = new URL('/verify-mfa', request.url);
    returnUrl.searchParams.set('returnTo', pathname);
    
    // Redirect to verification
    return NextResponse.redirect(returnUrl);
  }
  
  // Continue to the requested page
  return NextResponse.next();
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /fonts (inside /public)
     * 4. /examples (inside /public)
     * 5. all files in the /public folder
     */
    '/((?!api|_next|fonts|examples|[\\w-]+\\.\\w+).*)',
    '/api/admin/:path*',
  ],
};
