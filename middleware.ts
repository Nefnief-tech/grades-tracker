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
  // Debug: log the fetched account data
  console.log(`[Middleware] fetched account data: ${JSON.stringify(user)}`);

  // Only allow the user if they have isAdmin flag in their user document
  try {
    const userDocRes = await fetch(
      `${process.env.APPWRITE_ENDPOINT}/v1/databases/${
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ||
        process.env.APPWRITE_DATABASE_ID
      }/collections/${
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID ||
        process.env.APPWRITE_USERS_COLLECTION_ID
      }/documents?queries[]=equal("userId","${user.$id}")`,
      {
        headers: {
          "X-Appwrite-Project": process.env.APPWRITE_PROJECT_ID || "",
          cookie: cookieHeader,
        },
      }
    );
    if (!userDocRes.ok) throw new Error("Failed to fetch user document");
    const userDocData = await userDocRes.json();
    const userDoc = userDocData.documents?.[0];
    if (!userDoc || !userDoc.isAdmin) {
      console.log(
        `[Middleware] Unauthorized user ${user.$id} (not admin), redirecting to home]`
      );
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch (err) {
    console.log(
      `[Middleware] Error checking admin status for user ${user.$id}: ${err}`
    );
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Authorized
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
