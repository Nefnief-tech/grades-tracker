/**
 * This file contains fixes and workarounds for API issues 
 * that may occur with external services.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Get the correct Gemini model based on what's available in the current API version
 * 
 * The Gemini API has gone through several iterations with different model names:
 * - gemini-pro (original)
 * - gemini-1.0-pro
 * - gemini-1.5-pro
 * - gemini-1.5-flash
 * 
 * This function tries each one until one works, or returns the most current model name.
 */
export async function getWorkingGeminiModel(apiKey: string): Promise<{
  model: any;
  modelName: string;
}> {
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Models to try, in order of preference
  const modelNames = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.0-pro",
    "gemini-pro",
  ];
  
  // For logging
  const requestId = crypto.randomUUID().substring(0, 8);
  
  // Try each model
  for (const modelName of modelNames) {
    try {
      console.log(`[${requestId}] Trying Gemini model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Test if this model actually works with a minimal query
      const testResult = await model.generateContent("test");
      console.log(`[${requestId}] Successfully connected to model: ${modelName}`);
      
      // Found a working model
      return { model, modelName };
    } catch (error: any) {
      console.log(`[${requestId}] Model ${modelName} failed: ${error?.message || "Unknown error"}`);
      // Continue to next model
    }
  }
  
  // If all models failed, return the most likely to work in the future
  // and let the caller handle the error
  console.log(`[${requestId}] All models failed, defaulting to gemini-1.5-flash`);
  return { 
    model: genAI.getGenerativeModel({ model: "gemini-1.5-flash" }),
    modelName: "gemini-1.5-flash"
  };
}