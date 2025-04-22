import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
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

    // Fetch current user directly from Appwrite REST API
    const cookieHeader = request.headers.get("cookie") || "";
    const accountRes = await fetch(
      `${process.env.APPWRITE_ENDPOINT}/v1/account`,
      {
        headers: {
          "X-Appwrite-Project": process.env.APPWRITE_PROJECT_ID || "",
          cookie: cookieHeader,
        },
      }
    );
    if (!accountRes.ok) {
      console.log(
        `[Middleware] Appwrite account fetch failed (${accountRes.status}), redirecting to login`
      );
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    const user = await accountRes.json();
    if (user.$id !== "67d6f7fe0019adf0fd95") {
      console.log(
        `[Middleware] User ${user.$id} not authorized for admin, redirecting to home`
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
