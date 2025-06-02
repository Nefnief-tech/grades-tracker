// React Native compatible encryption/decryption utilities
// Based on working web app implementation

// Feature flags
const ENABLE_ENCRYPTION = true;

// Function to check if Web Crypto API is available (React Native compatible)
const isCryptoAvailable = () => {
  return (
    typeof crypto !== "undefined" &&
    typeof crypto.subtle !== "undefined" &&
    typeof crypto.subtle.importKey === "function" &&
    typeof crypto.subtle.deriveKey === "function" &&
    typeof crypto.subtle.encrypt === "function"
  );
};

// Debugging wrapper to log crypto operations
const logOperation = (operation, result, error = null) => {
  console.log(`[CloudCrypto] ${operation} - Success: ${!error}`);
  if (error) {
    console.error(`[CloudCrypto] Error: ${error.message || error}`);
  }
  return result;
};

// Encryption utilities
const getEncryptionKey = async (userId) => {
  console.log(`[CloudCrypto] Generating key for user ${userId}`);
  
  if (!isCryptoAvailable()) {
    console.warn("[CloudCrypto] Web Crypto API not available");
    return null;
  }

  try {
    // Derive a key from the userId using PBKDF2
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(userId),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    // Use a fixed salt (you could also store a unique salt per user)
    const salt = encoder.encode("GradesAppSalt");

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
    
    console.log(`[CloudCrypto] Key generated successfully`);
    return key;
  } catch (error) {
    return logOperation("getEncryptionKey", null, error);
  }
};

const encrypt = async (userId, data) => {
  console.log(`[CloudCrypto] Encrypting data for user ${userId}`);
  
  if (!ENABLE_ENCRYPTION) {
    console.log(`[CloudCrypto] Encryption disabled, storing as plain JSON`);
    return JSON.stringify(data);
  }
  
  if (!isCryptoAvailable()) {
    console.log(`[CloudCrypto] Crypto not available, storing as plain JSON`);
    return JSON.stringify(data);
  }

  try {
    const key = await getEncryptionKey(userId);
    if (!key) {
      console.log(`[CloudCrypto] No key available, storing as plain JSON`);
      return JSON.stringify(data);
    }

    const encoder = new TextEncoder();
    const dataToEncrypt = encoder.encode(JSON.stringify(data));

    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      dataToEncrypt
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedData), iv.length);

    // Convert to base64 for storage
    const base64 = btoa(String.fromCharCode.apply(null, Array.from(combined)));
    console.log(`[CloudCrypto] Encryption successful: ${data} -> ${base64.substring(0, 20)}...`);
    return base64;
  } catch (error) {
    console.error("[CloudCrypto] Encryption error:", error);
    // Fall back to unencrypted if encryption fails
    return JSON.stringify(data);
  }
};

const decrypt = async (userId, encryptedString) => {
  console.log(`[CloudCrypto] Decrypting data for user ${userId}`);
  
  if (!encryptedString) {
    console.warn(`[CloudCrypto] Empty encrypted string`);
    return null;
  }
  
  if (!ENABLE_ENCRYPTION) {
    console.log(`[CloudCrypto] Encryption disabled, parsing as JSON`);
    try {
      return JSON.parse(encryptedString);
    } catch (e) {
      console.error(`[CloudCrypto] JSON parse failed:`, e);
      return encryptedString;
    }
  }
  
  if (!isCryptoAvailable()) {
    console.log(`[CloudCrypto] Crypto not available, parsing as JSON`);
    try {
      return JSON.parse(encryptedString);
    } catch (e) {
      console.error(`[CloudCrypto] JSON parse failed:`, e);
      return encryptedString;
    }
  }

  try {
    // Convert from base64
    const binary = atob(encryptedString);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const key = await getEncryptionKey(userId);
    if (!key) {
      console.log(`[CloudCrypto] No key available, parsing as JSON`);
      return JSON.parse(encryptedString);
    }

    // Extract IV (first 12 bytes)
    const iv = bytes.slice(0, 12);
    const encryptedData = bytes.slice(12);

    const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encryptedData
    );

    const decoder = new TextDecoder();
    const decryptedText = decoder.decode(decryptedData);
    const result = JSON.parse(decryptedText);
    
    console.log(`[CloudCrypto] Decryption successful: ${result}`);
    return result;
  } catch (error) {
    console.error("[CloudCrypto] Decryption error:", error);
    
    // Try to parse as unencrypted if decryption fails
    try {
      console.log(`[CloudCrypto] Attempting fallback JSON parse`);
      return JSON.parse(encryptedString);
    } catch (jsonError) {
      console.error(`[CloudCrypto] Fallback JSON parse failed:`, jsonError);
      return null;
    }
  }
};

// Helper for array buffers
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Additional helper for debugging
const testEncryption = async (userId, testValue) => {
  try {
    console.log(`[CloudCrypto] Testing encryption for user ${userId} with value ${testValue}`);
    const encrypted = await encrypt(userId, testValue);
    console.log(`[CloudCrypto] Encrypted: ${encrypted}`);
    const decrypted = await decrypt(userId, encrypted);
    console.log(`[CloudCrypto] Decrypted: ${decrypted}`);
    return decrypted === testValue;
  } catch (error) {
    console.error(`[CloudCrypto] Test failed: ${error.message}`);
    return false;
  }
};

// Export functions for use in other parts of the app
export { encrypt, decrypt, isCryptoAvailable, testEncryption };