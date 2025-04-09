import { NextResponse } from "next/server";
import { checkCloudConnection } from "@/lib/appwrite";

/**
 * API endpoint to check cloud connection status
 * Used by the frontend to verify connectivity to Appwrite
 */
export async function GET() {
  try {
    const isConnected = await checkCloudConnection();

    return NextResponse.json({
      status: "ok",
      connected: isConnected,
      timestamp: new Date().toISOString(),
      message: isConnected
        ? "Successfully connected to Appwrite cloud services"
        : "Failed to connect to Appwrite cloud services",
      environment: process.env.NODE_ENV || "unknown",
    });
  } catch (error) {
    console.error("Error checking cloud connection:", error);

    return NextResponse.json(
      {
        status: "error",
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "unknown",
      },
      { status: 500 }
    );
  }
}
