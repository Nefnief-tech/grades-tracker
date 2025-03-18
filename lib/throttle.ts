/**
 * A global throttling mechanism to prevent excessive API calls
 */

// A map to track the last execution time for different operations
const lastExecutionMap = new Map<string, number>();

/**
 * Throttle a function to execute at most once in a given time period
 *
 * @param key A unique identifier for the operation
 * @param intervalMs Time in milliseconds to wait between executions
 * @param immediate Whether to execute immediately if not throttled
 * @returns Boolean indicating whether the operation should be executed
 */
export function throttle(
  key: string,
  intervalMs: number,
  immediate = true
): boolean {
  const now = Date.now();
  const lastExecution = lastExecutionMap.get(key) || 0;

  // Check if enough time has passed since last execution
  if (now - lastExecution >= intervalMs) {
    // Update last execution time if immediate execution is allowed
    if (immediate) {
      lastExecutionMap.set(key, now);
    }
    return true;
  }

  return false;
}

/**
 * Mark an operation as executed
 *
 * @param key A unique identifier for the operation
 */
export function markExecuted(key: string): void {
  lastExecutionMap.set(key, Date.now());
}

/**
 * Get remaining time until next allowed execution
 *
 * @param key A unique identifier for the operation
 * @param intervalMs Time in milliseconds to wait between executions
 * @returns Time in milliseconds until next allowed execution
 */
export function getTimeUntilNextExecution(
  key: string,
  intervalMs: number
): number {
  const now = Date.now();
  const lastExecution = lastExecutionMap.get(key) || 0;
  const elapsed = now - lastExecution;

  return Math.max(0, intervalMs - elapsed);
}

/**
 * Clear throttle state for a specific key
 */
export function clearThrottle(key: string): void {
  lastExecutionMap.delete(key);
}

/**
 * Reset all throttle states
 */
export function resetAllThrottles(): void {
  lastExecutionMap.clear();
}
