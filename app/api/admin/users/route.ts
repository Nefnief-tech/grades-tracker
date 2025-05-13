import { NextResponse } from 'next/server';
import { Client, Databases, Query } from 'appwrite';
import { cookies } from 'next/headers';

// This is a server-side route for admin operations
export async function GET() {
  try {
    // Access cookies - properly awaited in Next.js
    const cookieStore = await cookies();
    const adminStatusCookie = cookieStore.get('admin-status');
    const isAdmin = adminStatusCookie?.value === 'true';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    
    // Initialize server-side client for admin operations
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID || '');

    // Add API key for admin access using the correct Appwrite SDK method
    if (process.env.APPWRITE_API_KEY) {
      // Use the Server SDK method which should be available
      try {
        // Different ways to set the key depending on SDK version
        if (typeof client.setKey === 'function') {
          client.setKey(process.env.APPWRITE_API_KEY);
        } else {
          // For older SDK versions, this is the method name
          (client as any).setAPIKey(process.env.APPWRITE_API_KEY);
        }
      } catch (error) {
        console.error('Error setting API key:', error);
        return NextResponse.json(
          { error: 'Failed to set API key' },
          { status: 500 }
        );
      }
    } else {
      console.error('Missing APPWRITE_API_KEY environment variable');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const databases = new Databases(client);
    
    // Get collection IDs from environment variables
    const databaseId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
    const userCollectionId = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '';
    
    if (!databaseId || !userCollectionId) {
      return NextResponse.json(
        { error: 'Server configuration error - Missing database or collection ID' },
        { status: 500 }
      );
    }

    // Fetch users using admin API key
    const usersResponse = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.limit(100)]
    );

    return NextResponse.json({
      users: usersResponse.documents
    });
  } catch (error: any) {
    console.error('Error in admin user API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch users',
        details: error.message 
      },
      { status: 500 }
    );
  }
}