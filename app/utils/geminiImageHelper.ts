/**
 * Helper functions for handling images with Gemini API
 */
import { GoogleGenerativeAI, Part } from "@google/generative-ai";

/**
 * Configure the Gemini model with image handling capabilities
 */
export function getGeminiModelForImages(apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Gemini models that support image input
  return genAI.getGenerativeModel({
    model: "gemini-1.5-pro-vision", // This model supports images
    generationConfig: {
      temperature: 0.4,
      topP: 0.8,
      topK: 32,
    },
  });
}

/**
 * Convert file to image part for Gemini API
 */
export async function fileToImagePart(file: File): Promise<Part> {
  // Read the file as a data URL
  const fileData = await readFileAsDataURL(file);
  
  // Get MIME type from the data URL
  const mimeType = getMimeTypeFromDataURL(fileData);
  
  // Extract base64 data from data URL
  const base64Data = fileData.split(',')[1];
  
  return {
    inlineData: {
      data: base64Data,
      mimeType
    }
  };
}

/**
 * Extract vocabulary from an image using Gemini Vision API
 */
export async function extractVocabularyFromImage(
  apiKey: string, 
  imageFile: File,
  requestId: string
): Promise<any[]> {
  try {
    // Get model with image capabilities
    const model = getGeminiModelForImages(apiKey);
    
    // Convert file to image part
    const imagePart = await fileToImagePart(imageFile);
    
    // Create text prompt part
    const textPart = {
      text: `Extract vocabulary words visible in this image.
      If the image contains text in a foreign language, identify the language and provide English definitions.
      For nouns in gendered languages like German, include the article (der/die/das).
      
      Format your response strictly as a JSON array of objects with 'term' and 'definition' properties.
      For example: [{"term": "der Hund", "definition": "dog"}, {"term": "die Katze", "definition": "cat"}]
      
      Respond ONLY with the JSON array and nothing else.`
    };
    
    console.log(`[${requestId}] Making multimodal request to Gemini API with image`);
    
    // Call Gemini API with image and text parts
    const result = await model.generateContent({
      contents: [{ parts: [textPart, imagePart] }],
    });
    
    const response = await result.response;
    const responseText = response.text();
    
    console.log(`[${requestId}] Got response from Gemini Vision API`);
    
    // Extract JSON array from response
    try {
      // Find JSON array in response text
      const jsonStartIdx = responseText.indexOf('[');
      const jsonEndIdx = responseText.lastIndexOf(']') + 1;
      
      if (jsonStartIdx >= 0 && jsonEndIdx > jsonStartIdx) {
        const jsonStr = responseText.substring(jsonStartIdx, jsonEndIdx);
        const vocabulary = JSON.parse(jsonStr);
        
        return vocabulary.map((item: any) => ({
          term: item.term || "",
          definition: item.definition || "",
          source: "image-extraction"
        })).filter((item: any) => item.term && item.definition);
      } else {
        console.error(`[${requestId}] No JSON array found in response`);
        return [{ 
          term: "Error", 
          definition: "No vocabulary data found in the image",
          responseText: responseText.substring(0, 100)
        }];
      }
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse Gemini vision response:`, parseError);
      return [{ 
        term: "Error", 
        definition: "Failed to process API response",
        responseText: responseText.substring(0, 100)
      }];
    }
  } catch (error) {
    console.error(`Error extracting vocabulary from image:`, error);
    return [{ 
      term: "Error", 
      definition: error instanceof Error ? error.message : String(error)
    }];
  }
}

// Helper function to read a file as a data URL
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

// Helper function to get MIME type from a data URL
function getMimeTypeFromDataURL(dataURL: string): string {
  const match = dataURL.match(/^data:([^;]+);base64,/);
  return match ? match[1] : 'application/octet-stream';
}