import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware disabled for /admin; auth handled in page component
export async function middleware(request: NextRequest) {
  // Bypass all routes
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
