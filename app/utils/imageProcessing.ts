/**
 * Utility functions to help with image processing for Gemini API
 */

/**
 * Converts a File object to a base64 data URL string
 * @param file - The file to convert
 * @returns A promise that resolves to a base64 data URL string
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to data URL'));
      }
    };
    reader.onerror = () => {
      reject(reader.error || new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Prepares an image file for the Gemini API by converting it to the required format
 * @param file - The image file to prepare
 * @returns A promise that resolves to the image data in the format required by the Gemini API
 */
export async function prepareImageForGeminiApi(file: File): Promise<{
  inlineData: {
    data: string;
    mimeType: string;
  };
}> {
  try {
    // Convert the file to a data URL
    const dataUrl = await fileToDataUrl(file);
    
    // Extract base64 data and MIME type
    const regex = /^data:(.+);base64,(.*)$/;
    const matches = dataUrl.match(regex);
    
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid data URL format');
    }
    
    const [, mimeType, base64Data] = matches;
    
    return {
      inlineData: {
        data: base64Data,
        mimeType,
      }
    };
  } catch (error) {
    console.error('Failed to prepare image for Gemini API:', error);
    throw error;
  }
}

/**
 * Validates an image file for use with the Gemini API
 * @param file - The file to validate
 * @returns True if the file is valid, false otherwise
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check if the file is present
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  // Check if the file is an image
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File is not an image' };
  }
  
  // Check if the file size is within limits (10MB is Gemini API limit)
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > MAX_SIZE) {
    return { 
      valid: false, 
      error: `Image file is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 10MB.` 
    };
  }
  
  // Check for supported formats
  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!supportedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Unsupported image format: ${file.type}. Please use JPEG, PNG, WebP, or GIF.` 
    };
  }
  
  return { valid: true };
}