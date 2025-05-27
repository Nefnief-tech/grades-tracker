import { NextRequest, NextResponse } from 'next/server';
import { FALLBACK_DATA } from '@/lib/substitute-plan-fallback';

/**
 * API route to proxy requests to the substitute plan API
 * This helps avoid CORS issues when making requests from the browser
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch data from the external API with a timeout to prevent long waiting
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch('https://test-api-pwwbj5-10d814-150-230-144-172.traefik.me/api/vertretungsplan', {
        // Using server-side fetch avoids CORS restrictions
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
        // Cache for 5 minutes to reduce load on the external API
        next: { revalidate: 300 }
      });
      
      clearTimeout(timeoutId); // Clear the timeout if fetch completes
      
      if (!response.ok) {
        console.warn(`External API responded with status: ${response.status}, using fallback data`);
        return NextResponse.json(FALLBACK_DATA);
      }
      
      // Get the data from the response
      const data = await response.json();
      
      // Return the data with appropriate headers
      return NextResponse.json(data);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.warn('Error proxying substitute plan request, using fallback data:', error);
    
    // Return fallback data instead of an error
    return NextResponse.json(FALLBACK_DATA);
  }
}