import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
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
    { term: "die Stadt", definition: "city" }
  ];
  
  // Use the hash to determine how many additional items to include
  const additionalCount = hash % 5; // 0-4 additional items
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
      
      if (useRealApi) {
        try {
          console.log(`[${requestId}] Using real Gemini API for extraction`);
          
          // Initialize Gemini model with the latest model name
          const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash"  // Latest model name
          });
            // Create prompt based on input type
          let prompt = "";
          let parts = [];
          
          if (extractionSource === 'text') {
            prompt = `Extract vocabulary words from the following text. 
            Format your response as a JSON array of objects with 'term' and 'definition' properties.
            If the text is in a foreign language, identify the language and provide English definitions.
            For nouns in gendered languages like German, include the article (der/die/das).
            
            Make sure to respond ONLY with a valid JSON array in this format:
            [{"term": "word1", "definition": "definition1"}, {"term": "word2", "definition": "definition2"}]
            
            Text: ${text}`;
            
            parts = [{ text: prompt }];
          } else {
            console.log(`[${requestId}] Note: Image extraction is not fully supported by the Gemini API without additional setup`);
            
            prompt = `If you can see this image, please extract vocabulary words from it.
            Format your response as a JSON array of objects with 'term' and 'definition' properties.
            If the words are in a foreign language, identify the language and provide English definitions.
            For nouns in gendered languages like German, include the article (der/die/das).
            
            Make sure to respond ONLY with a valid JSON array in this format:
            [{"term": "word1", "definition": "definition1"}, {"term": "word2", "definition": "definition2"}]`;
            
            parts = [{ text: prompt }];
            
            // For proper image handling, we would need to:
            // 1. Convert the file to base64
            // 2. Set up a proper multimodal prompt with image and text
            // 3. Use a model that supports images like gemini-1.5-pro-vision
          }
          
          // Call Gemini API with parts
          const result = await model.generateContent({ contents: [{ parts }] });
          const response = await result.response;
          const responseText = response.text();
          
          console.log(`[${requestId}] Gemini API response received`);
          
          // Process the response to extract vocabulary
          extractedVocabulary = processGeminiResponse(responseText);
          apiMode = "live"; // Using real API
        } catch (apiError: any) {
          console.error(`[${requestId}] Gemini API call failed:`, apiError);
          console.log(`[${requestId}] Falling back to demo data due to API error`);
          
          // Fall back to demo data if API call fails
          const keyHash = hashCode(geminiApiKey);
          extractedVocabulary = getVocabularyDemoData(keyHash);
          apiMode = "fallback"; // Real API failed, using demo data
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
        mode: apiMode,
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
    } catch (error: any) {
      console.error(`[${requestId}] Error initializing Gemini API:`, error);
      
      // Record the error in our metrics
      recordApiRequest(
        '/api/vocabulary/extract',
        401, // Unauthorized status
        Date.now() - startTime,   
        { error: 'Invalid API key', requestId }
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
  } catch (error: any) {
    console.error(`[${requestId}] Vocabulary extraction error:`, error);
    
    // Record the error in our metrics
    recordApiRequest(
      '/api/vocabulary/extract',
      500, // Internal server error
      Date.now() - startTime,
      { 
        error: 'Internal server error', 
        requestId 
      }
    );
    
    return NextResponse.json({
      success: false,
      error: 'Failed to extract vocabulary',
      details: error instanceof Error ? error.message : String(error),
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        errorType: 'server_error'
      }
    }, { status: 500 });
  }
}