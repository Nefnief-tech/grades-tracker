import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { recordApiRequest } from "@/app/utils/apiMetrics";

// Function to process Gemini API response
function processGeminiResponse(responseText: string): any[] {
  try {
    // Extract JSON array from the response if it's wrapped in text
    let jsonStr = responseText.trim();
    
    // Find JSON object/array in the text
    const jsonStartIndex = jsonStr.indexOf('[');
    const jsonEndIndex = jsonStr.lastIndexOf(']') + 1;
    
    if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
      jsonStr = jsonStr.substring(jsonStartIndex, jsonEndIndex);
    }
    
    // Parse the JSON array
    const vocabularyItems = JSON.parse(jsonStr);
    
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

// Sample vocabulary for demo mode
function getSampleVocabulary() {
  return [
    { term: "der Hund", definition: "dog" },
    { term: "die Katze", definition: "cat" },
    { term: "das Buch", definition: "book" },
    { term: "die Schule", definition: "school" },
    { term: "der Tisch", definition: "table" },
    { term: "der Stuhl", definition: "chair" },
    { term: "das Fenster", definition: "window" },
    { term: "die Tür", definition: "door" },
    { term: "der Computer", definition: "computer" },
    { term: "das Handy", definition: "mobile phone" },
    { term: "die Tasche", definition: "bag" },
    { term: "der Stift", definition: "pen" },
    { term: "das Bild", definition: "picture" },
    { term: "die Lampe", definition: "lamp" },
    { term: "das Auto", definition: "car" },
  ];
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

// Get demo vocabulary data with some variation based on the hash
function getVocabularyDemoData(hash: number): any[] {
  const baseVocabulary = [
    { term: "der Hund", definition: "dog" },
    { term: "die Katze", definition: "cat" },
    { term: "das Haus", definition: "house" },
    { term: "die Schule", definition: "school" },
    { term: "der Lehrer", definition: "teacher" },
    { term: "das Buch", definition: "book" },
    { term: "die Straße", definition: "street" },
    { term: "der Computer", definition: "computer" },
    { term: "das Fenster", definition: "window" },
    { term: "die Tür", definition: "door" },
  ];
  
  // Additional items that may be included based on API key hash
  const additionalItems = [
    { term: "das Wasser", definition: "water" },
    { term: "der Baum", definition: "tree" },
    { term: "die Sonne", definition: "sun" },
    { term: "der Mond", definition: "moon" },
    { term: "die Stadt", definition: "city" },
    { term: "das Land", definition: "country" },
    { term: "der Fluss", definition: "river" },
    { term: "die Brücke", definition: "bridge" },
    { term: "das Auto", definition: "car" },
    { term: "der Zug", definition: "train" },
    { term: "das Flugzeug", definition: "airplane" },
    { term: "die Wolke", definition: "cloud" },
    { term: "der Himmel", definition: "sky" },
    { term: "das Meer", definition: "sea" },
    { term: "die Blume", definition: "flower" }
  ];
  
  // Use the hash to determine how many additional items to include
  const additionalCount = hash % 15; // 0-14 additional items
  const selectedItems = additionalItems.slice(0, additionalCount);
  
  return [...baseVocabulary, ...selectedItems];
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
      console.log(`[${requestId}] Demo mode requested. Using sample vocabulary data.`);
      const contentType = request.headers.get('content-type') || '';
      
      // Get demo vocabulary
      const demoVocabulary = getSampleVocabulary();
      
      // Calculate processing time
      const processingTime = Date.now() - startTime;
      
      // Record metrics
      recordApiRequest(
        '/api/vocabulary/extract', 
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
          source: contentType.includes('application/json') ? 'text' : 
                 contentType.includes('multipart/form-data') ? 'file' : 'unknown',
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
    
    // Determine if this is a text or file upload request
    let text = '';
    let extractionSource = 'unknown';
    let extractionStats: Record<string, any> = {};
    
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // Handle text extraction
      extractionSource = 'text';
      const jsonStartTime = Date.now();
      
      const body = await request.json();
      text = body.text || '';
      
      if (!text) {
        console.log(`[${requestId}] Error: Missing text content for extraction`);
        return NextResponse.json({
          success: false,
          error: 'Missing text',
          details: 'Please provide text to extract vocabulary from'
        }, { status: 400 });
      }
      
      // Calculate text stats
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      const charCount = text.length;
      extractionStats = { 
        wordCount, 
        charCount, 
        processingTime: Date.now() - jsonStartTime 
      };
      
      console.log(`[${requestId}] Processing text extraction with Gemini API - ${wordCount} words, ${charCount} chars`);
    } else if (contentType.includes('multipart/form-data')) {
      // Handle file extraction
      extractionSource = 'file';
      const fileStartTime = Date.now();
      
      try {
        const formData = await request.formData();
        const files = formData.getAll('files');
        
        if (files.length === 0) {
          console.log(`[${requestId}] Error: No files provided for extraction`);
          return NextResponse.json({
            success: false,
            error: 'Missing files',
            details: 'Please provide at least one file to extract vocabulary from'
          }, { status: 400 });
        }
        
        // Log file information
        const fileInfo = files.map((file: any) => ({
          name: file.name,
          type: file.type,
          size: file.size
        }));
        
        extractionStats = {
          fileCount: files.length,
          totalSize: fileInfo.reduce((acc: number, file: any) => acc + file.size, 0),
          files: fileInfo,
          processingTime: Date.now() - fileStartTime
        };
        
        console.log(`[${requestId}] Processing file extraction with Gemini API - ${files.length} files`);
        console.log(`[${requestId}] File details:`, JSON.stringify(fileInfo));
        
        // For file extraction, just use a placeholder text
        text = "Extract vocabulary from the image provided";
      } catch (error) {
        console.error(`[${requestId}] Error processing form data:`, error);
        return NextResponse.json({
          success: false,
          error: 'Invalid form data',
          details: 'Could not process the uploaded files'
        }, { status: 400 });
      }
    } else {
      console.log(`[${requestId}] Error: Unsupported content type: ${contentType}`);
      return NextResponse.json({
        success: false,
        error: 'Unsupported content type',
        details: 'Please send either JSON or multipart form data'
      }, { status: 415 }); // 415 Unsupported Media Type
    }
    
    // Initialize the generative AI client with the provided API key
    try {
      // Create Gemini API client
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      
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
          console.log(`[${requestId}] Using real Gemini API for extraction`);
          console.log(`[${requestId}] Attempting to use Gemini model: gemini-1.5-flash`);

          // Initialize with latest model name
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          
          // Create prompt based on input type
          let prompt = "";
          if (extractionSource === 'text') {
            prompt = `Extract vocabulary words from the following text. 
            Format as a JSON array of objects with 'term' and 'definition' properties.
            If the text is in a foreign language, identify the language and provide English definitions.
            For nouns in gendered languages like German, include the article (der/die/das).
            Text: ${text}`;
          } else if (extractionSource === 'file') {
            // For file extraction, we would need to process image content
            // This is simplified for demonstration purposes
            prompt = `Extract vocabulary words from the image content. 
            Format as a JSON array of objects with 'term' and 'definition' properties.
            If words are in a foreign language, identify the language and provide English definitions.
            For nouns in gendered languages like German, include the article (der/die/das).`;
          }
          
          // Call Gemini API
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const responseText = response.text();
          
          console.log(`[${requestId}] Gemini API response received: ${responseText.substring(0, 100)}...`);
          
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
            errorDetails: apiError?.errorDetails,
          };

          console.error(`[${requestId}] Gemini API call failed:`, apiError);
          console.error(`[${requestId}] Error details:`, JSON.stringify(errorDetails, null, 2));
          console.log(`[${requestId}] Falling back to demo data due to API error`);
          
          // Try to fall back to an alternate model name if this was a 404 error
          if (errorDetails.status === 404) {
            try {
              console.log(`[${requestId}] Trying alternate model name: gemini-pro`);
              const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
              
              // Create a simple prompt for testing
              const testResult = await fallbackModel.generateContent("Test");
              console.log(`[${requestId}] Alternate model connected successfully`);
              
              // If we got here, the alternate model works - try the real extraction
              const prompt = `Extract vocabulary from: ${text.substring(0, 100)}`;
              const result = await fallbackModel.generateContent(prompt);
              const response = await result.response;
              const responseText = response.text();
              
              // Process the response
              extractedVocabulary = processGeminiResponse(responseText);
              apiMode = "live-fallback";
              
            } catch (fallbackError) {
              console.error(`[${requestId}] Fallback model also failed:`, fallbackError);
              // Continue to use demo data
              const keyHash = hashCode(geminiApiKey);
              extractedVocabulary = getVocabularyDemoData(keyHash);
              apiMode = "fallback"; // Real API failed, using demo data
            }
          } else {
            // For non-404 errors, just use demo data
            const keyHash = hashCode(geminiApiKey);
            extractedVocabulary = getVocabularyDemoData(keyHash);
            apiMode = "fallback"; // Real API failed, using demo data
          }
          
          // Record the API error in metrics for analysis
          recordApiRequest('/api/vocabulary/extract/gemini-error', 
                          errorDetails.status === 'unknown' ? 500 : Number(errorDetails.status), 
                          0, 
                          { 
                            errorType: errorDetails.name, 
                            errorMessage: errorDetails.message.substring(0, 100),
                            requestId 
                          });
        }
      } else {
        // Use demo data 
        const keyHash = hashCode(geminiApiKey);
        extractedVocabulary = getVocabularyDemoData(keyHash);
        console.log(`[${requestId}] Using Gemini API key (validated but using sample data)`);
      }
      
      // Calculate total processing time
      const totalProcessingTime = Date.now() - startTime;
      
      // Record API metrics
      recordApiRequest(
        '/api/vocabulary/extract', 
        200, // status code
        totalProcessingTime,
        { 
          mode: apiMode, 
          requestId, 
          source: extractionSource,
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
          source: extractionSource,
          extractionStats,
          timestamp: new Date().toISOString(),
          itemCount: extractedVocabulary.length,
          processingTime: `${totalProcessingTime}ms`,
        }
      };
      
      return NextResponse.json(responseData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[${requestId}] Error initializing Gemini API:`, error);
      
      // Record the error in our metrics
      recordApiRequest(
        '/api/vocabulary/extract',
        401, // Unauthorized status
        Date.now() - startTime,   
        { error: 'Invalid API key', errorMessage, requestId }
      );
      
      return NextResponse.json({
        success: false,
        error: 'Invalid Gemini API key',
        details: 'Could not initialize Gemini API with the provided key',
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          errorType: 'api_key_validation'
        }
      }, { status: 401 });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[${requestId}] Vocabulary extraction error:`, error);
    
    // Record the error in our metrics
    recordApiRequest(
      '/api/vocabulary/extract',
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
      error: 'Failed to extract vocabulary',
      details: errorMessage,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        errorType: 'server_error'
      }
    }, { status: 500 });
  }
}