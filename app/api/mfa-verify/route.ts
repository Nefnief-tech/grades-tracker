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
    
    // Use our MFA handler function
    const result = await verifyMfaChallenge(challengeId, code);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        user: result.user || {}
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: result.error || 'Verification failed'
        },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Error in MFA verification API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred during verification'
      },
      { status: 500 }
    );
  }
}