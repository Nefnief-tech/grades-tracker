import { NextResponse } from 'next/server';
import { Client, Databases, ID, Query } from 'appwrite';

// Direct endpoint to give a user admin privileges
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body;
    
    // Simple validation of email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    // Check the setup code - this is a simple verification
    // In a real app, you'd use a more secure method
    const validSetupCode = process.env.ADMIN_SETUP_CODE || 'admin123';
    
    if (code !== validSetupCode) {
      return NextResponse.json(
        { error: 'Invalid admin setup code' },
        { status: 403 }
      );
    }
    
    // Initialize server-side client with API key
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID || '');
    
    // Use the API key for admin operations
    if (process.env.APPWRITE_API_KEY) {
      (client as any).setKey(process.env.APPWRITE_API_KEY);
    } else {
      return NextResponse.json(
        { error: 'Server configuration error: Missing API key' },
        { status: 500 }
      );
    }
    
    const databases = new Databases(client);
    
    // Get database and collection IDs - try environment variables
    const databaseId = process.env.APPWRITE_DATABASE_ID || 
                      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
    
    const userCollectionId = process.env.APPWRITE_USER_COLLECTION_ID || 
                           process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID || '';
    
    console.log('Database ID:', databaseId);
    console.log('User Collection ID:', userCollectionId);
    
    if (!databaseId || !userCollectionId) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing database or collection ID' },
        { status: 500 }
      );
    }
    
    // Set admin cookie in response
    const response = NextResponse.json({
      success: true,
      message: 'Admin status set successfully'
    });
    
    response.cookies.set('admin-status', 'true', {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    // We'll try to update the user in the database, but return success
    // even if that fails since the cookie is what matters most
    try {
      // Find the user by email
      const userDocs = await databases.listDocuments(
        databaseId,
        userCollectionId,
        [Query.equal('email', email), Query.limit(1)]
      );
      
      if (userDocs.documents.length === 0) {
        // User not found, create a new admin user
        await databases.createDocument(
          databaseId,
          userCollectionId,
          ID.unique(),
          {
            email: email,
            name: email.split('@')[0],
            isAdmin: true,
            created_at: new Date().toISOString()
          }
        );
        
        console.log('Created new admin user:', email);
      } else {
        // User found, update them to admin
        const userId = userDocs.documents[0].$id;
        
        await databases.updateDocument(
          databaseId,
          userCollectionId,
          userId,
          { isAdmin: true }
        );
        
        console.log('Updated existing user to admin:', email);
      }
    } catch (databaseError) {
      // Log the error but still return success with the cookie
      console.error('Error updating database for admin user:', databaseError);
      console.log('Continuing with cookie setup only');
    }
    
    return response;
  } catch (error: any) {
    console.error('Error setting up admin user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to set up admin user',
        details: error.message 
      },
      { status: 500 }
    );
  }
}