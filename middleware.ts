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
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // For authenticated users, the admin check happens in the page component
    // because we need to fetch user data from Appwrite
  }

  return NextResponse.next();
}

// Specify which paths this middleware applies to
export const config = {
  matcher: ["/admin/:path*"],
};
