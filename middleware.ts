import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get session cookie/token
  const session = request.cookies.get("appwrite-session");
  const adminSession = request.cookies.get("admin-status");
  const isAuthenticated = !!session;
  const isAdmin = adminSession?.value === "true";

  // For admin pages, we'll redirect to login if not authenticated
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // If not authenticated at all, redirect to login
    if (!isAuthenticated) {
      console.log(
        "[Middleware] User not authenticated, redirecting to login from admin page"
      );
      const loginUrl = new URL("/login", request.url);
      // Add a redirect parameter to return to admin after login
      loginUrl.searchParams.set("from", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check admin status
    if (!isAdmin) {
      console.log(
        "[Middleware] User authenticated but not an admin, redirecting to dashboard"
      );
      return NextResponse.redirect(new URL("/", request.url));
    }

    // If authenticated and admin, allow access
    console.log("[Middleware] User is authenticated as admin, allowing access");

    // Add custom headers to help with debugging
    const response = NextResponse.next();
    response.headers.set("x-middleware-cache", "no-cache");
    response.headers.set("x-middleware-authenticated", "true");
    response.headers.set("x-middleware-admin", "true");

    // Setting cache control headers to prevent caching issues
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  }

  return NextResponse.next();
}

// Specify which paths this middleware applies to
export const config = {
  matcher: ["/admin/:path*"],
};
