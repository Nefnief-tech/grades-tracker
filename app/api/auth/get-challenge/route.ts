import { NextRequest, NextResponse } from 'next/server';
import appwriteMFA from '@/lib/appwrite-mfa';

/**
 * API route that creates a new MFA challenge and returns its ID
 * This can be called from anywhere when you need to get a challenge ID
 */
export async function GET(request: NextRequest) {
  try {
    // Create a new MFA challenge
    const challenge = await appwriteMFA.createEmailChallenge();
    
    // Return the challenge ID
    return NextResponse.json({
      success: true,
      challengeId: challenge.$id
    });
  } catch (error: any) {
    console.error('Error creating MFA challenge:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create MFA challenge'
      },
      { status: 500 }
    );
  }
}