import { NextResponse } from 'next/server';
import { Client, Databases } from 'appwrite';
import { createServerClient } from '@/lib/server-auth-api';

// Simple endpoint to test the Appwrite connection
export async function GET() {
  console.log('API: Testing Appwrite connection');
  
  try {
    // Get environment variables
    const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const databaseId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const apiKey = process.env.APPWRITE_API_KEY || '';
    
    // Check if we have the required config
    const hasConfig = !!endpoint && !!projectId && !!databaseId;
    const hasApiKey = !!apiKey && apiKey.length > 10;
    
    // Create a server client
    const { client, error } = await createServerClient();
    
    if (error || !client) {
      console.error('API: Failed to create server client:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to initialize Appwrite client',
          error: error,
          configuration: {
            hasEndpoint: !!endpoint,
            hasProjectId: !!projectId,
            hasDatabaseId: !!databaseId,
            hasApiKey: hasApiKey
          }
        },
        { status: 500 }
      );
    }
    
    // Try to create databases client as a test
    try {
      const databases = new Databases(client);
      console.log('API: Successfully created Databases client');
      
      return NextResponse.json({
        success: true,
        message: 'Appwrite connection successful',
        configuration: {
          endpoint: endpoint,
          projectId: projectId?.substring(0, 5) + '...',
          databaseId: databaseId?.substring(0, 5) + '...',
          hasApiKey: hasApiKey
        }
      });
    } catch (err) {
      console.error('API: Failed to create Databases client:', err);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create Databases client',
          error: err instanceof Error ? err.message : String(err),
          configuration: {
            hasEndpoint: !!endpoint,
            hasProjectId: !!projectId,
            hasDatabaseId: !!databaseId,
            hasApiKey: hasApiKey
          }
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API: Unhandled error in test connection:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to test Appwrite connection',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}