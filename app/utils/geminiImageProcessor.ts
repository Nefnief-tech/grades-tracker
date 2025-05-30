import { GoogleGenerativeAI } from "@google/generative-ai";

interface ImagePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

async function fileToGenerativePart(file: File): Promise<ImagePart> {
  const data = await file.arrayBuffer();
  return {
    inlineData: {
      data: Buffer.from(data).toString('base64'),
      mimeType: file.type
    }
  };
}

async function checkModelCompatibility(genAI: any): Promise<string> {
  // List of models to try in order of preference
  const modelOptions = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro",
    "gemini-pro-vision"
  ];

  for (const modelName of modelOptions) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      // Test the model with a simple query
      await model.generateContent("test");
      return modelName;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (!errorMsg.includes("not found")) {
        // If error is not about model not found, this might be our best option
        return modelName;
      }
      // Otherwise continue trying other models
      continue;
    }
  }
  
  // If no models worked, return the latest known model
  return "gemini-1.5-flash";
}

export async function processImageWithGemini(apiKey: string, imageFile: File, requestId: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // Check which model is available
    const modelName = await checkModelCompatibility(genAI);
    console.log(`[${requestId}] Using Gemini model: ${modelName}`);
    
    // Initialize model with confirmed model name
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
      }
    });

    try {
      // Convert image to base64
      const imagePart = await fileToGenerativePart(imageFile);

      const prompt = `Analyze this image and extract any visible text or words that could be used as vocabulary.
      If you see text in a foreign language, identify the language and provide English translations.
      For German nouns, include the article (der/die/das).
      
      Respond ONLY with a JSON array in this format:
      [{"term": "word1", "definition": "translation1", "context": "where/how this appeared in the image"}]
      
      If no text is visible, respond with an empty array: []`;

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      try {
        // Try to parse the response as JSON
        const cleanJson = text.substring(
          text.indexOf("["),
          text.lastIndexOf("]") + 1
        );
        
        return JSON.parse(cleanJson);
      } catch (e) {
        console.error(`[${requestId}] Failed to parse Gemini vision response:`, e);
        return [];
      }
    } catch (error) {
      console.error(`[${requestId}] Gemini vision API error:`, error);
      throw error;
    }
  } catch (error) {
    console.error(`[${requestId}] Gemini model compatibility check failed:`, error);
    throw error;
  }
}