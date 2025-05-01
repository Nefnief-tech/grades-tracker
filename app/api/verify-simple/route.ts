import { NextRequest, NextResponse } from 'next/server';
import appwriteMFA from '@/lib/appwrite-mfa';
import { getCurrentUser } from '@/lib/appwrite';

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
    
    // Directly use the appwriteMFA client
    try {
      // Verify the challenge
      await appwriteMFA.verifyChallenge(challengeId, code);
      
      // Get the user after verification
      const user = await getCurrentUser();
      
      // Return success response
      return NextResponse.json({ 
        success: true, 
        user: user || {} 
      });
    } catch (error: any) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message || 'Verification failed' 
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error in simple verification API route:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during verification' },
      { status: 500 }
    );
  }
}