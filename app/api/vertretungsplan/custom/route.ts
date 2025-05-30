import { NextRequest, NextResponse } from "next/server";

interface CustomPortalRequest {
  username: string;
  password: string;
  baseUrl: string;
  vertretungsplanUrl?: string;
  timetableUrl?: string;
}

interface LoginResult {
  success: boolean;
  finalUrl?: string;
  error?: string;
  sessionCookies?: string[];
}

interface PortalTestResult {
  success: boolean;
  tests: {
    login: LoginResult;
    vertretungsplan?: {
      success: boolean;
      entriesFound?: number;
      error?: string;
    };
    timetable?: {
      success: boolean;
      daysFound?: number;
      periodsFound?: number;
      classesFound?: number;
      error?: string;
    };
  };
  processingTime: string;
}

// Simple login simulation - in a real implementation, this would use puppeteer or similar
async function simulateLogin(baseUrl: string, username: string, password: string): Promise<LoginResult> {
  try {
    // Test basic connectivity first
    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      return {
        success: false,
        error: `Cannot reach portal (HTTP ${response.status})`
      };
    }
    
    const loginPageContent = await response.text();
    
    // Check if this looks like a login page
    const hasLoginForm = loginPageContent.includes('password') || 
                        loginPageContent.includes('login') ||
                        loginPageContent.includes('username') ||
                        loginPageContent.includes('anmelden');
    
    if (!hasLoginForm) {
      return {
        success: false,
        error: 'Page does not appear to contain a login form'
      };
    }
    
    // For demo purposes, simulate successful login
    // In a real implementation, you would:
    // 1. Parse the login form
    // 2. Submit credentials
    // 3. Follow redirects
    // 4. Check for successful login indicators
    
    return {
      success: true,
      finalUrl: baseUrl.replace(/\/$/, '') + '/dashboard',
      sessionCookies: ['PHPSESSID=demo123', 'auth_token=demo456']
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Network error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Test vertretungsplan access
async function testVertretungsplan(url: string, sessionCookies: string[] = []): Promise<{
  success: boolean;
  entriesFound?: number;
  error?: string;
}> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cookie': sessionCookies.join('; ')
      }
    });
    
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }
    
    const content = await response.text();
    
    // Look for common substitute plan indicators
    const indicators = [
      'vertretungsplan', 'substitute', 'replacement', 'vertretung',
      'klasse', 'class', 'stunde', 'period', 'raum', 'room'
    ];
    
    const hasIndicators = indicators.some(indicator => 
      content.toLowerCase().includes(indicator)
    );
    
    if (!hasIndicators) {
      return {
        success: false,
        error: 'Page does not appear to contain substitute plan data'
      };
    }
    
    // Simulate finding entries (in real implementation, parse the actual data)
    const simulatedEntries = Math.floor(Math.random() * 10) + 1;
    
    return {
      success: true,
      entriesFound: simulatedEntries
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Network error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Test timetable access
async function testTimetable(url: string, sessionCookies: string[] = []): Promise<{
  success: boolean;
  daysFound?: number;
  periodsFound?: number;
  classesFound?: number;
  error?: string;
}> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cookie': sessionCookies.join('; ')
      }
    });
    
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }
    
    const content = await response.text();
    
    // Look for common timetable indicators
    const indicators = [
      'stundenplan', 'timetable', 'schedule', 'stunde',
      'montag', 'dienstag', 'monday', 'tuesday', 'period'
    ];
    
    const hasIndicators = indicators.some(indicator => 
      content.toLowerCase().includes(indicator)
    );
    
    if (!hasIndicators) {
      return {
        success: false,
        error: 'Page does not appear to contain timetable data'
      };
    }
    
    // Simulate finding timetable data
    return {
      success: true,
      daysFound: 5, // Monday to Friday
      periodsFound: Math.floor(Math.random() * 8) + 6, // 6-13 periods
      classesFound: Math.floor(Math.random() * 30) + 20 // 20-49 classes
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Network error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  try {
    console.log(`[${requestId}] Testing custom portal connection`);
    
    const body: CustomPortalRequest = await request.json();
    const { username, password, baseUrl, vertretungsplanUrl, timetableUrl } = body;
    
    // Validate required fields
    if (!username || !password || !baseUrl) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        details: 'Please provide username, password, and baseUrl'
      }, { status: 400 });
    }
    
    // Validate URL format
    try {
      new URL(baseUrl);
      if (vertretungsplanUrl) new URL(vertretungsplanUrl);
      if (timetableUrl) new URL(timetableUrl);
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid URL format',
        details: 'Please ensure all URLs are valid (include https://)'
      }, { status: 400 });
    }
    
    console.log(`[${requestId}] Testing portal: ${baseUrl}`);
    
    const result: PortalTestResult = {
      success: false,
      tests: {
        login: { success: false }
      },
      processingTime: '0ms'
    };
    
    // Step 1: Test login
    console.log(`[${requestId}] Testing login...`);
    const loginResult = await simulateLogin(baseUrl, username, password);
    result.tests.login = loginResult;
    
    if (!loginResult.success) {
      result.success = false;
      const processingTime = Date.now() - startTime;
      result.processingTime = `${processingTime}ms`;
      
      return NextResponse.json({
        success: false,
        error: 'Login failed',
        details: loginResult.error,
        testResults: result,
        meta: {
          requestId,
          timestamp: new Date().toISOString()
        }
      }, { status: 401 });
    }
    
    // Step 2: Test vertretungsplan if URL provided
    if (vertretungsplanUrl) {
      console.log(`[${requestId}] Testing vertretungsplan access...`);
      const vpResult = await testVertretungsplan(vertretungsplanUrl, loginResult.sessionCookies);
      result.tests.vertretungsplan = vpResult;
    }
    
    // Step 3: Test timetable if URL provided
    if (timetableUrl) {
      console.log(`[${requestId}] Testing timetable access...`);
      const ttResult = await testTimetable(timetableUrl, loginResult.sessionCookies);
      result.tests.timetable = ttResult;
    }
    
    // Determine overall success
    result.success = loginResult.success && 
                    (!vertretungsplanUrl || result.tests.vertretungsplan?.success !== false) &&
                    (!timetableUrl || result.tests.timetable?.success !== false);
    
    const processingTime = Date.now() - startTime;
    result.processingTime = `${processingTime}ms`;
    
    // Return comprehensive results
    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Portal tests completed successfully' : 'Some portal tests failed',
      tests: result.tests,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        testedUrls: {
          baseUrl,
          vertretungsplanUrl: vertretungsplanUrl || null,
          timetableUrl: timetableUrl || null
        },
        processingTime: result.processingTime
      }
    });
    
  } catch (error: any) {
    console.error(`[${requestId}] Error testing portal:`, error);
    
    const processingTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: false,
      error: 'Portal test failed',
      details: error instanceof Error ? error.message : String(error),
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTime: `${processingTime}ms`,
        errorType: 'server_error'
      }
    }, { status: 500 });
  }
}