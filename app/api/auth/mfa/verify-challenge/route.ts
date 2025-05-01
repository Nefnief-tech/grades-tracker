import { NextRequest, NextResponse } from 'next/server';
import appwriteMFA from '@/lib/appwrite-mfa';
import { getCurrentUser } from '@/lib/appwrite';

/**
 * API endpoint to verify an MFA challenge directly from the backend
 * This bypasses client-side verification issues
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { challengeId, code } = data;
    
    // Validate inputs
    if (!challengeId) {
      return NextResponse.json(
        { success: false, error: 'Challenge ID is required' },
        { status: 400 }
      );
    }
    
    if (!code || code.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Valid verification code is required' },
        { status: 400 }
      );
    }
    
    console.log('[API] Verifying challenge:', challengeId);
    console.log('[API] Verification code:', code);
    
    // Clean up code input
    const cleanCode = code.replace(/\D/g, '');
    
    // Verify the challenge
    await appwriteMFA.verifyChallenge(challengeId, cleanCode);
    console.log('[API] Challenge verified successfully');
    
    // Try to get the user after verification
    try {
      const user = await getCurrentUser();
      // Make sure user exists before accessing properties
      if (user) {
        return NextResponse.json({
          success: true,
          verified: true,
          userId: user.id,
          user
        });
      } else {
        return NextResponse.json({
          success: true,
          verified: true,
          message: 'Verified but user data not available'
        });
      }
    } catch (error) {
      console.warn('[API] Challenge verified but error getting user:', error);
      // Even if we can't get the user, verification was successful
      return NextResponse.json({
        success: true,
        verified: true
      });
    }
  } catch (error: any) {
    console.error('[API] Error verifying challenge:', error);
    
    // Format error message
    let errorMessage = 'Verification failed';
    let statusCode = 500;
    
    if (error.code === 401) {
      errorMessage = 'Incorrect verification code';
      statusCode = 401;
    } else if (error.message && error.message.includes('Invalid token')) {
      errorMessage = 'Invalid verification code or challenge ID';
      statusCode = 400;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: statusCode }
    );
  }
}