// Simple utility for ID generation using native methods (no external dependencies)

/**
 * Generates a unique ID string without external dependencies
 * @returns A random string ID
 */
export function generateId(): string {
  // Create timestamp component (milliseconds since epoch)
  const timestamp = new Date().getTime().toString(36);

  // Create random component (multiple random numbers converted to base36)
  const randomPart1 = Math.random().toString(36).substring(2, 10);
  const randomPart2 = Math.random().toString(36).substring(2, 10);

  // Combine for a reasonably unique ID
  return `${timestamp}-${randomPart1}-${randomPart2}`;
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
