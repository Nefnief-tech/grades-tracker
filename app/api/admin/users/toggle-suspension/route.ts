import { NextResponse } from 'next/server';
import { Client, Databases } from 'appwrite';

export async function POST(request: Request) {
  try {
    // Check for authentication and admin authorization
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing or invalid authorization' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { userId, suspend } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      );
    }

    // Initialize server-side client with admin privileges
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID || '');

    if (process.env.APPWRITE_API_KEY) {
      // @ts-ignore - The type definition is missing setKey
      client.setKey(process.env.APPWRITE_API_KEY);
    } else {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const databases = new Databases(client);
    
    // Update the user's suspension status
    const databaseId = process.env.APPWRITE_DATABASE_ID || '';
    const userCollectionId = process.env.APPWRITE_USER_COLLECTION_ID || '';

    await databases.updateDocument(
      databaseId,
      userCollectionId,
      userId,
      { is_suspended: suspend }
    );

    return NextResponse.json({
      success: true,
      message: suspend ? 'User suspended successfully' : 'User activated successfully',
    });
  } catch (error: any) {
    console.error('Error toggling user suspension:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update user status',
        details: error.message 
      },
      { status: 500 }
    );
  }
}