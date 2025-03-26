/**
 * Utility functions for generating unique IDs
 */

/**
 * Generates a unique ID string
 * @returns A random string ID
 */
export function generateId(): string {
  // Generate a random string with timestamp to ensure uniqueness
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

/**
 * Generates a short random ID suitable for UI elements
 * @returns A short random string ID
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Checks if a string is a valid ID format
 * @param id The ID to validate
 * @returns Boolean indicating if the ID is valid
 */
export function isValidId(id: string): boolean {
  return typeof id === "string" && id.length >= 6;
}
