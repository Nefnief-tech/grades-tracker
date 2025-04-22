import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Only apply to /admin paths
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Ensure session cookie exists
  const cookieHeader = request.headers.get("cookie") || "";
  if (!cookieHeader.includes("a_session")) {
    console.log("[Middleware] No session cookie, redirecting to home");
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Fetch current user from Appwrite
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
      `[Middleware] Account fetch failed (${accountRes.status}), redirecting to home]`
    );
    return NextResponse.redirect(new URL("/", request.url));
  }
  const user = await accountRes.json();

  // Only allow the specific user ID
  if (user.$id !== "67d6f7fe0019adf0fd95") {
    console.log(
      `[Middleware] Unauthorized user ${user.$id}, redirecting to home]`
    );
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Authorized
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
