import { NextRequest, NextResponse } from 'next/server';
import appwriteMFA from '@/lib/appwrite-mfa';
import { getCurrentUser } from '@/lib/appwrite';

/**
 * API endpoint to create an MFA challenge directly from the backend
 * This bypasses client-side redirect issues
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current session - this will trigger MFA if needed
    try {
      await getCurrentUser();
    } catch (error) {
      console.log('[API] User session requires MFA');
    }
    
    // Create a new challenge regardless
    const challenge = await appwriteMFA.createEmailChallenge();
    console.log('[API] Created MFA challenge:', challenge.$id);
    
    return NextResponse.json({
      success: true,
      challengeId: challenge.$id,
      created: challenge.$createdAt,
      expires: challenge.expire,
      verificationUrl: `/verify-mfa?challengeId=${challenge.$id}`
    });
  } catch (error: any) {
    console.error('[API] Error creating MFA challenge:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create MFA challenge'
      },
      { status: 500 }
    );
  }
}

/**
 * API endpoint to create an MFA challenge with email parameter
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const email = data.email;
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Create a new challenge
    const challenge = await appwriteMFA.createEmailChallenge();
    console.log('[API] Created MFA challenge for email:', email);
    
    return NextResponse.json({
      success: true,
      challengeId: challenge.$id,
      email,
      created: challenge.$createdAt,
      expires: challenge.expire,
      verificationUrl: `/verify-mfa?challengeId=${challenge.$id}&email=${encodeURIComponent(email)}`
    });
  } catch (error: any) {
    console.error('[API] Error creating MFA challenge:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create MFA challenge'
      },
      { status: 500 }
    );
  }
}