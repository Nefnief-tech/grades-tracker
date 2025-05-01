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

// Middleware function to capture MFA redirects
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip exempt paths
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
  ],
};
