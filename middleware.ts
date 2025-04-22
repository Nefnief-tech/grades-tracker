import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get session cookie/token
  const session = request.cookies.get("appwrite-session");
  const isAuthenticated = !!session;

  // For admin pages, we'll redirect to login if not authenticated
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // If not authenticated at all, redirect to login
    if (!isAuthenticated) {
      console.log(
        "[Middleware] User not authenticated, redirecting to login from admin page"
      );
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If authenticated, allow access - the admin check happens in the page component
    console.log(
      "[Middleware] User appears authenticated, allowing access to admin page"
    );

    // Add a custom header so the client knows the middleware allowed the request
    // This can help with debugging
    const response = NextResponse.next();
    response.headers.set("x-middleware-cache", "no-cache");
    response.headers.set("x-middleware-authenticated", "true");
    return response;
  }

  return NextResponse.next();
}

// Specify which paths this middleware applies to
export const config = {
  matcher: ["/admin/:path*"],
};
