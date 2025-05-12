import { NextResponse } from 'next/server';
import { Client, Account } from 'appwrite';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { endpoint, projectId } = body;
    
    // Log input values
    console.log("Debug API: Testing Appwrite with:", { endpoint, projectId });
    
    if (!endpoint || !projectId) {
      return NextResponse.json({
        success: false,
        message: "Missing required parameters",
        error: { endpoint: !endpoint, projectId: !projectId }
      }, { status: 400 });
    }

    // Initialize test client
    const client = new Client();
    
    try {
      client.setEndpoint(endpoint);
      client.setProject(projectId);
      
      // Create account instance (no actual auth needed)
      const account = new Account(client);
      
      // Just check the server health - doesn't require auth
      const health = await client.get('/health');
      
      return NextResponse.json({
        success: true,
        message: "Successfully connected to Appwrite",
        projectId: projectId,
        endpoint: endpoint,
        healthCheck: health
      });
    } catch (error: any) {
      console.error("Appwrite connection test failed:", error);
      
      let errorMessage = error.message;
      let errorDetails = null;
      
      // Check for specific error types
      if (error.code === 404) {
        errorMessage = "Project not found. Check your project ID.";
      } else if (error.code === 401) {
        errorMessage = "Authentication failed. Check API keys.";
      } else if (error.message && error.message.includes("NetworkError")) {
        errorMessage = "Network error. Check endpoint URL.";
      }
      
      try {
        errorDetails = JSON.parse(error.message);
      } catch {
        errorDetails = error.message || error.toString();
      }
      
      return NextResponse.json({
        success: false,
        message: errorMessage,
        error: errorDetails,
        code: error.code || 'unknown',
        type: error.constructor ? error.constructor.name : typeof error
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Debug API error:", error);
    
    return NextResponse.json({
      success: false,
      message: "Server error processing request",
      error: error.message || error.toString()
    }, { status: 500 });
  }
}