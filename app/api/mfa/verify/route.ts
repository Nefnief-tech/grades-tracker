import { NextRequest, NextResponse } from 'next/server';
import { verifyMfaChallenge } from '@/lib/mfa-handler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { challengeId, code } = body;
    
    if (!challengeId || !code) {
      return NextResponse.json(
        { success: false, error: 'Challenge ID and verification code are required' },
        { status: 400 }
      );
    }
    
    // Use the MFA handler to verify the challenge
    const result = await verifyMfaChallenge(challengeId, code);
    
    if (result.success) {
      // User is now authenticated, set any necessary cookies or session data
      const response = NextResponse.json({ success: true, user: result.user });
      
      // Set a cookie to indicate the user is authenticated
      // This is just an example - you should use your actual auth system
      response.cookies.set('authenticated', 'true', {
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      return response;
    }
    
    return NextResponse.json(
      { success: false, error: result.error || 'Verification failed' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error in MFA verification API route:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during verification' },
      { status: 500 }
    );
  }
}