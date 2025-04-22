import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get Appwrite session cookie and admin-status
  const allCookies = request.cookies.getAll();
  const sessionCookie = allCookies.find((c) => c.name.startsWith("a_session"));
  const isAuthenticated = !!sessionCookie;

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

    // If authenticated, allow access only if user ID matches
    // Decode the Appwrite JWT from the session cookie
    const token = sessionCookie?.value || "";
    const parts = token.split(".");
    let userId = "";
    try {
      const payload = parts[1] || "";
      const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      const decoded = JSON.parse(json);
      userId = decoded.userId ?? decoded.sub;
    } catch (err) {
      console.error("[Middleware] Failed to decode session JWT:", err);
    }
    if (userId !== "67d6f7fe0019adf0fd95") {
      console.log(
        `[Middleware] User ID ${userId} not authorized for admin, redirecting to home`
      );
      return NextResponse.redirect(new URL("/", request.url));
    }
    console.log("[Middleware] Authorized admin user, allowing access");

    // Add custom headers to help with debugging
    const response = NextResponse.next();
    response.headers.set("x-middleware-cache", "no-cache");
    response.headers.set("x-middleware-authenticated", "true");

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
