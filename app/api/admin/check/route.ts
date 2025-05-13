import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Simple endpoint to check if a user has admin status
export async function GET() {
  const cookieStore = cookies();
  const adminStatus = cookieStore.get('admin-status');
  const isAdmin = adminStatus?.value === 'true';
  
  return NextResponse.json({
    isAdmin: isAdmin
  });
}