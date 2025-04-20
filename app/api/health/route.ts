import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Force dynamic evaluation
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      uptime: process.uptime(),
      timestamp: Date.now(),
      environment: process.env.NODE_ENV || "development",
    },
    { status: 200 }
  );
}
