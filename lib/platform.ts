/**
 * Platform-specific utilities to help with architecture compatibility
 */

// Detect if we're running on a 64-bit ARM architecture
export const isAarch64 = (): boolean => {
  if (typeof navigator !== "undefined" && navigator.userAgent) {
    // Check for ARM64 in user agent
    return /aarch64|arm64/i.test(navigator.userAgent);
  }
  return false;
};

// Check if the current platform supports all required crypto features
export const hasCryptoSupport = (): boolean => {
  try {
    return (
      typeof crypto !== "undefined" &&
      typeof crypto.subtle !== "undefined" &&
      typeof crypto.subtle.importKey === "function" &&
      typeof crypto.subtle.deriveKey === "function" &&
      typeof crypto.subtle.encrypt === "function"
    );
  } catch (e) {
    return false;
  }
};

// Safer implementation of Array helpers for large arrays (especially relevant for ARM64)
export const safeArrayFromMethod = <T>(arrayLike: ArrayLike<T>): T[] => {
  // Using a loop instead of Array.from or apply for large arrays
  // to avoid "Maximum call stack size exceeded" on ARM64
  const result: T[] = [];
  for (let i = 0; i < arrayLike.length; i++) {
    result.push(arrayLike[i]);
  }
  return result;
};

// Safe chunking for large data processing
export const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const results: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    results.push(array.slice(i, i + chunkSize));
  }
  return results;
};
