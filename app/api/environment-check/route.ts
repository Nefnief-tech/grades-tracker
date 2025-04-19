import { NextResponse } from "next/server";

export async function GET() {
  // Only expose the presence of variables, not their values (for security)
  const envStatus = {
    NEXT_PUBLIC_APPWRITE_ENDPOINT: !!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    NEXT_PUBLIC_APPWRITE_PROJECT_ID:
      !!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    NEXT_PUBLIC_APPWRITE_DATABASE_ID:
      !!process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID:
      !!process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
    NEXT_PUBLIC_APPWRITE_SUBJECTS_COLLECTION_ID:
      !!process.env.NEXT_PUBLIC_APPWRITE_SUBJECTS_COLLECTION_ID,
    NEXT_PUBLIC_APPWRITE_GRADES_COLLECTION_ID:
      !!process.env.NEXT_PUBLIC_APPWRITE_GRADES_COLLECTION_ID,
    NEXT_PUBLIC_APPWRITE_POMODORO_COLLECTION_ID:
      !!process.env.NEXT_PUBLIC_APPWRITE_POMODORO_COLLECTION_ID,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_URL: !!process.env.VERCEL_URL,
    RAILWAY_STATIC_URL: !!process.env.RAILWAY_STATIC_URL,
    RAILWAY_PUBLIC_DOMAIN: process.env.RAILWAY_PUBLIC_DOMAIN || null,
  };

  return NextResponse.json({
    status: "ok",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    envStatus,
  });
}
