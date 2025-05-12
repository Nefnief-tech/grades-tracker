import { NextResponse } from 'next/server';
import { Client, Databases, Query } from 'appwrite';
import { ID } from 'appwrite';

// This is a server-side route for direct admin operations
export async function GET() {
  console.log("API: Starting direct-users API call");
  
  try {
    // Initialize server-side client with API key
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

    // Using API key for direct admin access
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
      console.error('API: Missing APPWRITE_API_KEY environment variable');
      return NextResponse.json(
        { error: 'Server configuration error - Missing API key' },
        { status: 500 }
      );
    }

    // Initialize Databases
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
    
    if (!databaseId) {
      console.error("API: Missing database ID");
      return NextResponse.json(
        { error: 'Server configuration error - Missing database ID' },
        { status: 500 }
      );
    }
    
    if (!userCollectionId) {
      console.error("API: Missing user collection ID");
      return NextResponse.json(
        { error: 'Server configuration error - Missing collection ID' },
        { status: 500 }
      );
    }
    
    console.log(`API: Using database ID: ${databaseId}, collection ID: ${userCollectionId}`);

    // Fetch users
    let usersResponse;
    try {
      console.log("API: Attempting to fetch users from Appwrite");
      usersResponse = await databases.listDocuments(
        databaseId,
        userCollectionId,
        [Query.limit(100)]
      );
      console.log(`API: Successfully fetched ${usersResponse.documents.length} users`);
    } catch (err) {
      console.error("API: Error fetching users from Appwrite:", err);
      return NextResponse.json(
        { 
          error: 'Failed to fetch users from database',
          details: err instanceof Error ? err.message : String(err)
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users: usersResponse.documents
    });
  } catch (error: any) {
    console.error('API: Unhandled error in admin user API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}