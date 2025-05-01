import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get challenge ID and email from query parameters
    const searchParams = request.nextUrl.searchParams;
    const challengeId = searchParams.get('challengeId');
    const email = searchParams.get('email');

    if (!challengeId || !email) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Construct the verification page URL
    const redirectUrl = `/verify-mfa?email=${encodeURIComponent(email)}&challengeId=${challengeId}`;
    
    // Return a redirect response with the verification URL
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error('Error in MFA redirect API route:', error);
    return NextResponse.json(
      { error: 'Failed to process redirect request' },
      { status: 500 }
    );
  }
}