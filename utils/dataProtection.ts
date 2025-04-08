/**
 * Data protection utilities for enhanced security
 */

// Check if browser supports the necessary encryption APIs
const hasWebCryptoSupport = () => {
  return (
    typeof window !== "undefined" &&
    typeof crypto !== "undefined" &&
    typeof crypto.subtle !== "undefined" &&
    typeof crypto.subtle.encrypt === "function"
  );
};

/**
 * Generate a secure encryption key from a user ID
 * @param userId The user's ID to derive the key from
 * @returns A promise that resolves to a CryptoKey
 */
export const generateEncryptionKey = async (
  userId: string
): Promise<CryptoKey | null> => {
  if (!hasWebCryptoSupport()) {
    console.warn("Web Crypto API not supported");
    return null;
  }

  try {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(userId),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    // Use a consistent salt
    const salt = encoder.encode("GradeTrackerSecureSalt");

    return await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000, // High number of iterations for security
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false, // Non-extractable
      ["encrypt", "decrypt"]
    );
  } catch (error) {
    console.error("Error generating encryption key:", error);
    return null;
  }
};

/**
 * Encrypt sensitive data
 * @param userId The user's ID
 * @param data The data to encrypt
 * @returns Encrypted data as a string
 */
export const encryptData = async (
  userId: string,
  data: any
): Promise<string> => {
  if (!hasWebCryptoSupport()) {
    console.warn("Encryption not supported, returning data as-is");
    return JSON.stringify(data);
  }

  try {
    const key = await generateEncryptionKey(userId);
    if (!key) {
      return JSON.stringify(data);
    }

    const encoder = new TextEncoder();
    const dataToEncrypt = encoder.encode(JSON.stringify(data));

    // Generate a random initialization vector
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the data
    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      dataToEncrypt
    );

    // Combine the IV and encrypted data
    const result = new Uint8Array(iv.length + encryptedData.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encryptedData), iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode.apply(null, Array.from(result)));
  } catch (error) {
    console.error("Encryption error:", error);
    return JSON.stringify(data); // Fallback to unencrypted
  }
};

/**
 * Decrypt encrypted data
 * @param userId The user's ID
 * @param encryptedData The encrypted data string
 * @returns Decrypted data
 */
export const decryptData = async (
  userId: string,
  encryptedData: string
): Promise<any> => {
  if (!hasWebCryptoSupport()) {
    console.warn("Decryption not supported, attempting to parse as JSON");
    try {
      return JSON.parse(encryptedData);
    } catch (e) {
      return null;
    }
  }

  try {
    // First try to parse as JSON (unencrypted data)
    try {
      return JSON.parse(encryptedData);
    } catch {
      // Continue with decryption
    }

    const key = await generateEncryptionKey(userId);
    if (!key) {
      throw new Error("Failed to generate decryption key");
    }

    // Convert from base64
    const encryptedBytes = Uint8Array.from(atob(encryptedData), (c) =>
      c.charCodeAt(0)
    );

    // Extract IV (first 12 bytes)
    const iv = encryptedBytes.slice(0, 12);
    const data = encryptedBytes.slice(12);

    // Decrypt
    const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    // Convert to string and parse as JSON
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decryptedData));
  } catch (error) {
    console.error("Decryption error:", error);
    try {
      // Try one more time to parse as unencrypted JSON as a fallback
      return JSON.parse(encryptedData);
    } catch {
      return null;
    }
  }
};

/**
 * Anonymize data for analytics purposes
 * @param data The data to anonymize
 * @returns Anonymized data with sensitive information removed
 */
export const anonymizeData = (data: any): any => {
  if (!data) return null;

  // Create a deep copy of the data
  const anonymized = JSON.parse(JSON.stringify(data));

  // Replace sensitive fields with placeholders
  if (Array.isArray(anonymized)) {
    return anonymized.map((item) => anonymizeData(item));
  } else if (typeof anonymized === "object") {
    // Replace specific sensitive fields
    if ("email" in anonymized) anonymized.email = "[REDACTED]";
    if ("name" in anonymized) anonymized.name = "[REDACTED]";
    if ("fullName" in anonymized) anonymized.fullName = "[REDACTED]";
    if ("password" in anonymized) anonymized.password = "[REDACTED]";
    if ("personalNotes" in anonymized) anonymized.personalNotes = "[REDACTED]";

    // Recursively anonymize nested objects
    for (const key in anonymized) {
      if (typeof anonymized[key] === "object" && anonymized[key] !== null) {
        anonymized[key] = anonymizeData(anonymized[key]);
      }
    }
  }

  return anonymized;
};

/**
 * Safely delete data from local storage with proper cleanup
 * @param key The localStorage key to delete
 */
export const securelyDeleteData = (key: string): void => {
  try {
    // Overwrite the data with random data before deleting
    const randomData = btoa(
      String.fromCharCode.apply(
        null,
        Array.from(crypto.getRandomValues(new Uint8Array(64)))
      )
    );
    localStorage.setItem(key, randomData);

    // Now delete the item
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error securely deleting ${key}:`, error);
    // Fallback to simple removal
    localStorage.removeItem(key);
  }
};

/**
 * Securely clear all application data from local storage
 */
export const securelyDeleteAllData = (): void => {
  const keysToDelete = [];

  // Find all keys related to our application
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key &&
      (key.startsWith("grade") ||
        key.startsWith("subject") ||
        key.includes("tracker") ||
        key.includes("consent"))
    ) {
      keysToDelete.push(key);
    }
  }

  // Securely delete each key
  keysToDelete.forEach((key) => securelyDeleteData(key));
};
