import { NextRequest, NextResponse } from "next/server";
import { getApiMetrics, resetApiMetrics } from "@/app/utils/apiMetrics";

export async function GET(request: NextRequest) {
  try {
    // Check if there's an admin authorization header
    const isAuthorized = request.headers.get('X-Admin-Key') === process.env.ADMIN_SECRET_KEY;
    
    // For security, limit access to this endpoint
    if (!isAuthorized && process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
        message: 'You do not have permission to access API metrics'
      }, { status: 401 });
    }
    
    // Get current API metrics
    const metrics = getApiMetrics();
    
    // Add system information
    const enhancedMetrics = {
      ...metrics,
      systemInfo: {
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        uptime: process.uptime ? Math.floor(process.uptime()) : 'unknown',
        timestamp: new Date().toISOString()
      }
    };
    
    return NextResponse.json({
      success: true,
      data: enhancedMetrics
    });
  } catch (error) {
    console.error('Error retrieving API metrics:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve API metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if there's an admin authorization header
    const isAuthorized = request.headers.get('X-Admin-Key') === process.env.ADMIN_SECRET_KEY;
    
    // For security, limit access to this endpoint
    if (!isAuthorized) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
        message: 'You do not have permission to modify API metrics'
      }, { status: 401 });
    }
    
    // Get the action from the request body
    const body = await request.json();
    const { action } = body;
    
    if (action === 'reset') {
      resetApiMetrics();
      return NextResponse.json({
        success: true,
        message: 'API metrics reset successfully'
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid Action',
      message: `Unknown action: ${action}`
    }, { status: 400 });
  } catch (error) {
    console.error('Error processing API metrics action:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process action',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}