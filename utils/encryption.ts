import crypto from "crypto";

// An encryption key should be stored securely, ideally in environment variables
// For development, we'll use this hardcoded key, but replace this in production
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "your-secure-encryption-key-at-least-32-chars";
const IV_LENGTH = 16; // For AES, this is always 16 bytes

/**
 * Encrypts data using AES-256-CBC
 * @param data - Data to encrypt (object will be JSON stringified)
 * @returns Encrypted string (base64 encoded)
 */
export function encrypt(data: any): string {
  const dataStr = typeof data === "string" ? data : JSON.stringify(data);

  // Create an initialization vector
  const iv = crypto.randomBytes(IV_LENGTH);

  // Create cipher
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );

  // Encrypt the data
  let encrypted = cipher.update(dataStr, "utf8", "base64");
  encrypted += cipher.final("base64");

  // Return IV + encrypted data
  return iv.toString("hex") + ":" + encrypted;
}

/**
 * Decrypts data that was encrypted with the encrypt function
 * @param encryptedData - The encrypted data string
 * @returns Decrypted data (parsed from JSON if it was an object)
 */
export function decrypt(encryptedData: string): any {
  try {
    // Split IV and encrypted data
    const parts = encryptedData.split(":");
    if (parts.length !== 2) {
      throw new Error("Invalid encrypted data format");
    }

    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];

    // Create decipher
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY),
      iv
    );

    // Decrypt the data
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");

    // Try to parse JSON, return raw string if not valid JSON
    try {
      return JSON.parse(decrypted);
    } catch (e) {
      return decrypted;
    }
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
}
