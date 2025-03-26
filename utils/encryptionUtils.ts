/**
 * Utilities for encrypting and decrypting sensitive data
 */

// Use the Web Crypto API for secure encryption
const ENCRYPTION_ALGORITHM = "AES-GCM";
const IV_LENGTH = 12; // 12 bytes for GCM mode
const SALT_LENGTH = 16;
const KEY_LENGTH = 256; // bits
const ITERATIONS = 100000;

/**
 * Generate a secure encryption key from a password
 */
async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import the password as a key
  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  // Derive a key from the password
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt data with a password
 */
export async function encrypt(data: any, password: string): Promise<string> {
  try {
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Generate encryption key
    const key = await deriveKey(password, salt);

    // Encrypt the data
    const dataStr = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataStr);

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: ENCRYPTION_ALGORITHM, iv },
      key,
      dataBuffer
    );

    // Combine salt, IV, and encrypted data
    const result = new Uint8Array(
      SALT_LENGTH + IV_LENGTH + encryptedBuffer.byteLength
    );
    result.set(salt, 0);
    result.set(iv, SALT_LENGTH);
    result.set(new Uint8Array(encryptedBuffer), SALT_LENGTH + IV_LENGTH);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...result));
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypt data with a password
 */
export async function decrypt<T = any>(
  encryptedData: string,
  password: string
): Promise<T> {
  try {
    // Convert from base64
    const encryptedBytes = Uint8Array.from(atob(encryptedData), (c) =>
      c.charCodeAt(0)
    );

    // Extract salt, IV, and encrypted data
    const salt = encryptedBytes.slice(0, SALT_LENGTH);
    const iv = encryptedBytes.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const data = encryptedBytes.slice(SALT_LENGTH + IV_LENGTH);

    // Generate decryption key
    const key = await deriveKey(password, salt);

    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: ENCRYPTION_ALGORITHM, iv },
      key,
      data
    );

    // Convert to string and parse JSON
    const decoder = new TextDecoder();
    const decryptedStr = decoder.decode(decryptedBuffer);
    return JSON.parse(decryptedStr);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Generate a deterministic key from a user ID
 * This creates a consistent encryption key for a user
 */
export async function generateUserEncryptionKey(
  userId: string
): Promise<string> {
  // Create a deterministic but secure key from the user ID
  // In a real app, you might want to combine this with a server-side secret
  const APP_SECRET =
    process.env.NEXT_PUBLIC_ENCRYPTION_SECRET || "default-encryption-secret";
  const encoder = new TextEncoder();
  const data = encoder.encode(userId + APP_SECRET);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
