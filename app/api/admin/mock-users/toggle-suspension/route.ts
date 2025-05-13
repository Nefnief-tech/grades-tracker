import { NextResponse } from 'next/server';

// Mock toggle suspension API - doesn't require Appwrite
export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    const { userId, suspend } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      );
    }
    
    console.log(`Mock toggle suspension for user ${userId}: ${suspend ? 'Suspended' : 'Activated'}`);
    
    // In a real app, this would update the database
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: suspend 
        ? 'User has been suspended' 
        : 'User has been activated',
      userId: userId,
      status: suspend ? 'suspended' : 'active'
    });
  } catch (error) {
    console.error('Error in mock toggle suspension:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}