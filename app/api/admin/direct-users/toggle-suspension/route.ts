import { NextResponse } from 'next/server';
import { Client, Databases } from 'appwrite';

export async function POST(request: Request) {
  console.log("API: Starting toggle-suspension API call");
  
  try {
    // Get request body
    const body = await request.json();
    const { userId, suspend } = body;

    if (!userId) {
      console.log("API: Missing user ID in request");
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      );
    }

    console.log(`API: Attempting to ${suspend ? 'suspend' : 'activate'} user ${userId}`);

    // Initialize server-side client
    const client = new Client();
    
    try {
      client.setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1');
      console.log("API: Endpoint set to:", process.env.APPWRITE_ENDPOINT);
    } catch (err) {
      console.error("API: Error setting endpoint:", err);
      return NextResponse.json(
        { error: 'Failed to set Appwrite endpoint', details: err instanceof Error ? err.message : String(err) },
        { status: 500 }
      );
    }
    
    try {
      client.setProject(process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');
      console.log("API: Project ID set to:", process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    } catch (err) {
      console.error("API: Error setting project ID:", err);
      return NextResponse.json(
        { error: 'Failed to set Appwrite project ID', details: err instanceof Error ? err.message : String(err) },
        { status: 500 }
      );
    }

    if (process.env.APPWRITE_API_KEY) {
      try {
        // IMPORTANT: For Node.js SDK, it's setKey not setAPIKey
        // For Browser SDK, setKey doesn't exist
        // Using conditional check to handle different SDK versions
        if (typeof (client as any).setKey === 'function') {
          (client as any).setKey(process.env.APPWRITE_API_KEY);
        } else {
          // Fallback for older versions
          console.log("API: Using API key auth fallback");
          client.setJWT(process.env.APPWRITE_API_KEY);
        }
        console.log("API: API key authentication applied");
      } catch (err) {
        console.error("API: Error setting API authentication:", err);
        return NextResponse.json(
          { error: 'Failed to set Appwrite API authentication', details: err instanceof Error ? err.message : String(err) },
          { status: 500 }
        );
      }
    } else {
      console.error("API: Missing APPWRITE_API_KEY environment variable");
      return NextResponse.json(
        { error: 'Server configuration error: Missing API key' },
        { status: 500 }
      );
    }

    let databases;
    try {
      databases = new Databases(client);
      console.log("API: Databases client initialized");
    } catch (err) {
      console.error("API: Error initializing Databases client:", err);
      return NextResponse.json(
        { error: 'Failed to initialize Appwrite Databases client', details: err instanceof Error ? err.message : String(err) },
        { status: 500 }
      );
    }
    
    // Get collection IDs from environment variables
    const databaseId = process.env.APPWRITE_DATABASE_ID || 
                      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
                      
    const userCollectionId = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '';
    
    if (!databaseId || !userCollectionId) {
      console.error(`API: Missing database ID (${databaseId}) or user collection ID (${userCollectionId})`);
      return NextResponse.json(
        { error: 'Server configuration error: Missing database or collection ID' },
        { status: 500 }
      );
    }
    
    console.log(`API: Using database ID: ${databaseId}, collection ID: ${userCollectionId}`);

    // Update the user's suspension status
    try {
      await databases.updateDocument(
        databaseId,
        userCollectionId,
        userId,
        { is_suspended: suspend }
      );
      console.log(`API: Successfully ${suspend ? 'suspended' : 'activated'} user ${userId}`);
    } catch (err) {
      console.error("API: Error updating user document:", err);
      return NextResponse.json(
        { 
          error: 'Failed to update user status',
          details: err instanceof Error ? err.message : String(err)
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: suspend ? 'User suspended successfully' : 'User activated successfully'
    });
  } catch (error: any) {
    console.error('API: Unhandled error in toggle suspension API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update user status',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}