/**
 * API Metrics Collection Utility
 * 
 * This module provides functions to collect and track API usage metrics.
 * In a production environment, these would be stored in a database or sent to a monitoring service.
 */

// For development, we'll store metrics in memory
// In production, use a persistent storage solution
let apiMetrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0,
  endpointStats: {} as Record<string, {
    hits: number,
    errors: number,
    averageResponseTime: number
  }>,
  lastRequestTimestamp: new Date().toISOString(),
};

/**
 * Record an API request with its metadata
 */
export function recordApiRequest(
  endpoint: string,
  statusCode: number,
  responseTime: number,
  metadata: Record<string, any> = {}
): void {
  // Update global stats
  apiMetrics.totalRequests++;
  apiMetrics.lastRequestTimestamp = new Date().toISOString();
  
  if (statusCode >= 200 && statusCode < 400) {
    apiMetrics.successfulRequests++;
  } else {
    apiMetrics.failedRequests++;
  }
  
  // Update average response time
  const totalTime = apiMetrics.averageResponseTime * (apiMetrics.totalRequests - 1) + responseTime;
  apiMetrics.averageResponseTime = totalTime / apiMetrics.totalRequests;
  
  // Update endpoint-specific stats
  if (!apiMetrics.endpointStats[endpoint]) {
    apiMetrics.endpointStats[endpoint] = {
      hits: 0,
      errors: 0,
      averageResponseTime: 0
    };
  }
  
  const endpointStats = apiMetrics.endpointStats[endpoint];
  endpointStats.hits++;
  
  if (statusCode >= 400) {
    endpointStats.errors++;
  }
  
  // Update average response time for this endpoint
  const endpointTotalTime = endpointStats.averageResponseTime * (endpointStats.hits - 1) + responseTime;
  endpointStats.averageResponseTime = endpointTotalTime / endpointStats.hits;
  
  // In production, you would store these metrics in a database
  // or send them to a monitoring service
  if (process.env.NODE_ENV === 'development') {
    console.debug(`API Metrics updated for ${endpoint}: ${statusCode} in ${responseTime}ms`);
  }
}

/**
 * Get current API metrics
 */
export function getApiMetrics(): typeof apiMetrics {
  return { ...apiMetrics };
}

/**
 * Reset API metrics (for testing or maintenance)
 */
export function resetApiMetrics(): void {
  apiMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    endpointStats: {},
    lastRequestTimestamp: new Date().toISOString(),
  };
}