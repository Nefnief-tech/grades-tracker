import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { recordApiRequest } from "@/app/utils/apiMetrics";

// Function to process Gemini API response
function processGeminiResponse(responseText: string): any[] {
  try {
    // Check if the response is plain text (not JSON)
    if (responseText.trim().startsWith('Please provide') || 
        responseText.trim().startsWith('I need') ||
        responseText.trim().startsWith('I cannot') ||
        !responseText.includes('{') && !responseText.includes('[')) {
      
      console.log("Gemini returned non-JSON response:", responseText.substring(0, 100));
      
      // Create a fallback vocabulary item from the response
      return [
        { 
          term: "API Response", 
          definition: responseText.substring(0, 100) + "...",
          note: "The API returned plain text instead of vocabulary data"
        }
      ];
    }
    
    // Extract JSON array from the response if it's wrapped in text
    let jsonStr = responseText.trim();
    
    // Find JSON object/array in the text
    const jsonStartIndex = jsonStr.indexOf('[');
    const jsonEndIndex = jsonStr.lastIndexOf(']') + 1;
    
    if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
      jsonStr = jsonStr.substring(jsonStartIndex, jsonEndIndex);
    } else {
      // Try to find JSON objects if no array is found
      const objStartIndex = jsonStr.indexOf('{');
      const objEndIndex = jsonStr.lastIndexOf('}') + 1;
      
      if (objStartIndex >= 0 && objEndIndex > objStartIndex) {
        // Wrap the object in an array for consistent processing
        jsonStr = '[' + jsonStr.substring(objStartIndex, objEndIndex) + ']';
      } else {
        // If no JSON structure is found, return a placeholder
        return [{ term: "Error", definition: "Could not extract vocabulary from API response" }];
      }
    }
    
    // Parse the JSON array
    const vocabularyItems = JSON.parse(jsonStr);
    
    // Check for empty array
    if (Array.isArray(vocabularyItems) && vocabularyItems.length === 0) {
      console.log("Gemini API returned an empty array, providing fallback vocabulary");
      return [{ 
        term: "No Results", 
        definition: "The API couldn't extract any vocabulary from the provided content.",
        note: "Empty result set from AI"
      }];
    }
    
    // Validate and normalize the data structure
    return vocabularyItems.map((item: any) => {
      // Ensure we have term and definition fields
      const term = item.term || item.word || item.vocabulary || '';
      const definition = item.definition || item.translation || item.meaning || '';
      
      return {
        term,
        definition,
        ...item // Keep any additional fields Gemini might have added
      };
    }).filter((item: any) => item.term && item.definition);
  } catch (error) {
    console.error("Failed to process Gemini response:", error);
    return []; // Return empty array if processing fails
  }
}

// Convert file to base64 for API
async function fileToGenerativePart(file: File): Promise<Part> {
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');
  
  return {
    inlineData: {
      data: base64,
      mimeType: file.type
    },
  };
}

// Simple string hash function for demo purposes
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Sample image vocabulary for demo mode
function getImageDemoVocabulary() {
  return [
    { term: "das Foto", definition: "photo", source: "demo-image-extraction" },
    { term: "das Bild", definition: "picture", source: "demo-image-extraction" },
    { term: "die Kamera", definition: "camera", source: "demo-image-extraction" },
    { term: "die Landschaft", definition: "landscape", source: "demo-image-extraction" },
    { term: "der Berg", definition: "mountain", source: "demo-image-extraction" },
    { term: "der Himmel", definition: "sky", source: "demo-image-extraction" },
    { term: "die Wolke", definition: "cloud", source: "demo-image-extraction" },
    { term: "der Baum", definition: "tree", source: "demo-image-extraction" },
    { term: "das Wasser", definition: "water", source: "demo-image-extraction" },
    { term: "die Sonne", definition: "sun", source: "demo-image-extraction" }
  ];
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  // Generate a request ID for tracking if not provided
  const requestId = request.headers.get('X-Request-Id') || crypto.randomUUID();
  
  try {
    // Check if demo mode is explicitly requested
    const demoMode = request.headers.get('X-Demo-Mode') === 'true';
    
    // If demo mode is explicitly enabled, skip API key validation
    if (demoMode) {
      console.log(`[${requestId}] Image extraction demo mode requested`);
      
      // Get demo vocabulary
      const demoVocabulary = getImageDemoVocabulary();
      
      // Calculate processing time
      const processingTime = Date.now() - startTime;
      
      // Record metrics
      recordApiRequest(
        '/api/vocabulary/extract-image', 
        200, // status code
        processingTime,
        { demoMode: true, requestId, itemCount: demoVocabulary.length }
      );
      
      // Create response with metadata
      const responseData = {
        success: true,
        vocabulary: demoVocabulary,
        apiStatus: 'connected',
        mode: "demo",
        meta: {
          requestId,
          source: 'image',
          timestamp: new Date().toISOString(),
          itemCount: demoVocabulary.length,
          isDemoMode: true,
          processingTime: `${processingTime}ms`
        }
      };
      
      return NextResponse.json(responseData);
    }
    
    // Get the Gemini API key from headers
    const geminiApiKey = request.headers.get('X-Gemini-API-Key');
    
    if (!geminiApiKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Gemini API key',
        details: 'Please provide a valid Gemini API key'
      }, { status: 400 });
    }
    
    // Validate that we have a valid API key format (basic validation)
    if (!geminiApiKey.startsWith('AI') || geminiApiKey.length < 10) {
      return NextResponse.json({
        success: false,
        error: 'Invalid Gemini API key format',
        details: 'The provided API key does not appear to be valid'
      }, { status: 400 });
    }
    
    // Parse the multipart form data
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const targetLanguage = formData.get('targetLanguage') as string || 'English';
    
    if (!imageFile) {
      return NextResponse.json({
        success: false,
        error: 'No image provided',
        details: 'Please upload an image file'
      }, { status: 400 });
    }
    
    // Log file information
    const fileInfo = {
      name: imageFile.name,
      type: imageFile.type,
      size: imageFile.size
    };
    
    console.log(`[${requestId}] Processing image extraction: ${fileInfo.name} (${fileInfo.size} bytes, ${fileInfo.type})`);
    
    // Create extraction stats
    const extractionStats = {
      fileInfo,
      targetLanguage
    };
    
    // Get environment flag to force real API usage even without env variable
    const forceRealApi = request.headers.get('X-Force-Real-Api') === 'true';
    // Check environment variable or forced header
    const useRealApi = process.env.USE_REAL_GEMINI_API === 'true' || forceRealApi;
    
    // Create a variable to store our extracted vocabulary
    let extractedVocabulary: any[] = [];
    let apiMode = "live-demo";
    
    // Check if we should use the real Gemini API
    if (useRealApi) {
      try {
        console.log(`[${requestId}] Using real Gemini API for image extraction`);
        
        // Initialize Gemini model with vision capabilities
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-pro-vision", // Vision-capable model
        });
        
        // Convert image to proper format for API
        const imagePart = await fileToGenerativePart(imageFile);
        
        // Create the text instruction part
        const textPart = {
          text: `Extract vocabulary words visible in this image.
          If the image contains text in a foreign language, identify the language and provide ${targetLanguage} translations.
          For nouns in gendered languages like German, include the article (der/die/das).
          
          Format your response STRICTLY as a JSON array of objects with 'term' and 'definition' properties.
          For example: [{"term": "der Hund", "definition": "dog"}, {"term": "die Katze", "definition": "cat"}]
          
          Respond ONLY with the JSON array and nothing else.`
        };
        
        // Build the request with both text and image parts
        const result = await model.generateContent({
          contents: [{ 
            role: "user", 
            parts: [textPart, imagePart]
          }],
          generationConfig: {
            temperature: 0.2, // Lower temperature for more deterministic output
            topK: 32,
            topP: 0.95,
            maxOutputTokens: 800,
          }
        });
        
        const response = await result.response;
        const responseText = response.text();
        
        console.log(`[${requestId}] Gemini Vision API response received: ${responseText.substring(0, 100)}...`);
        
        // Process the response to extract vocabulary
        extractedVocabulary = processGeminiResponse(responseText);
        apiMode = "live"; // Using real API
        
      } catch (apiError: any) {
        // Extract useful information from the error
        const errorDetails = {
          message: apiError instanceof Error ? apiError.message : String(apiError),
          name: apiError instanceof Error ? apiError.name : 'Unknown',
          status: apiError?.status || 'unknown',
          statusText: apiError?.statusText || 'unknown',
        };

        console.error(`[${requestId}] Gemini Vision API call failed:`, apiError);
        console.error(`[${requestId}] Error details:`, JSON.stringify(errorDetails, null, 2));
        console.log(`[${requestId}] Falling back to demo data due to API error`);
        
        // Fall back to demo data if API call fails
        extractedVocabulary = getImageDemoVocabulary();
        apiMode = "fallback"; // Real API failed, using demo data
      }
    } else {
      // Use demo data
      extractedVocabulary = getImageDemoVocabulary();
      console.log(`[${requestId}] Using Gemini API key (validated but using sample image data)`);
    }
    
    // Calculate total processing time
    const totalProcessingTime = Date.now() - startTime;
    
    // Record API metrics
    recordApiRequest(
      '/api/vocabulary/extract-image', 
      200, // status code
      totalProcessingTime,
      { 
        mode: apiMode, 
        requestId, 
        source: 'image',
        itemCount: extractedVocabulary.length 
      }
    );
    
    const responseData = {
      success: true,
      vocabulary: extractedVocabulary,
      apiStatus: 'connected',
      mode: apiMode, // "live", "live-demo", or "fallback"
      meta: {
        requestId,
        source: 'image',
        extractionStats,
        timestamp: new Date().toISOString(),
        itemCount: extractedVocabulary.length,
        processingTime: `${totalProcessingTime}ms`,
      }
    };
    
    return NextResponse.json(responseData);
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[${requestId}] Image vocabulary extraction error:`, error);
    
    // Record the error in our metrics
    recordApiRequest(
      '/api/vocabulary/extract-image',
      500, // Internal server error
      Date.now() - startTime,
      { 
        error: 'Internal server error', 
        errorMessage,
        requestId 
      }
    );
    
    return NextResponse.json({
      success: false,
      error: 'Failed to extract vocabulary from image',
      details: errorMessage,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        errorType: 'server_error'
      }
    }, { status: 500 });
  }
}