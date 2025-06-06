import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define logger types for structured logging
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  path: string;
  method: string;
  duration?: number;
  statusCode?: number;
  userId?: string;
  headers?: Record<string, string>;
  [key: string]: any;
}

// Logger function for structured logs
function log(level: LogLevel, message: string, data: Partial<StructuredLog> = {}) {
  const logEntry: StructuredLog = {
    timestamp: new Date().toISOString(),
    level,
    message,
    path: data.path || '',
    method: data.method || '',
    ...data,
  };
  
  // In development, format logs nicely for the console
  if (process.env.NODE_ENV === 'development') {
    const colorMap = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m', // Red
    };
    
    const reset = '\x1b[0m';
    const color = colorMap[level] || reset;
    
    console.log(`${color}[${level.toUpperCase()}]${reset} ${message} - ${JSON.stringify({
      path: logEntry.path,
      method: logEntry.method,
      duration: logEntry.duration,
      statusCode: logEntry.statusCode,
    })}`);
  } else {
    // In production, output structured JSON for log collection systems
    console.log(JSON.stringify(logEntry));
  }
}

// API request middleware
export async function middleware(request: NextRequest) {
  // Only process API requests
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Record start time for performance measurement
  const start = Date.now();
  
  // Generate a request ID for tracking
  const requestId = crypto.randomUUID();
  
  // Capture request details
  const { pathname, search } = request.nextUrl;
  const fullPath = `${pathname}${search}`;
  
  // Initial log entry when request starts
  log('info', `API Request started: ${request.method} ${fullPath}`, {
    path: pathname,
    method: request.method,
    query: search,
    requestId,
    userAgent: request.headers.get('user-agent') || '',
    referrer: request.headers.get('referer') || '',
    apiKey: request.headers.has('X-Gemini-API-Key') ? '[PRESENT]' : '[MISSING]',
    demoMode: request.headers.get('X-Demo-Mode'),
  });
    // Create response object for inspection after request completes
  const response = NextResponse.next();
  
  // Add request ID to response headers for client-side tracking
  response.headers.set('X-Request-Id', requestId);
  
  // Calculate duration for the initial processing
  const duration = Date.now() - start;
  
  // Log completion information
  // Note: We can only log the response creation, not actual completion in middleware
  log('info', `API Request processing: ${request.method} ${fullPath}`, {
    path: pathname,
    method: request.method,
    duration,
    requestId,
  });
  
  return response;
}

// Configure which paths this middleware applies to
export const config = {
  matcher: '/api/:path*',
};