import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Set the admin-status cookie to true
    cookies().set({
      name: "admin-status",
      value: "true",
      httpOnly: true,
      path: "/",
      // Set secure to true in production
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.json({
      success: true,
      message: "Admin status set successfully",
    });
  } catch (error) {
    console.error("Error setting admin status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to set admin status" },
      { status: 500 }
    );
  }
}
