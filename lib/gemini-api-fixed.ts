/**
 * Utility functions for interacting with Gemini API
 */
import { 
  convertQAFormatToJson,
  parseAIResponseToFlashcards,
  EDUCATIONAL_FLASHCARD_PROMPT,
  EDUCATIONAL_IMAGE_FLASHCARD_PROMPT
} from './ai-prompts';
import { filterProblematicFlashcards } from './flashcard-filter';
import { FlashcardSubmission } from "@/types/flashcards";

// Available Gemini models with compatibility information
export const AVAILABLE_MODELS = {
  "gemini-1.5-flash": {
    name: "Gemini 1.5 Flash",
    description: "Newest model, fast responses, recommended",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
    version: "v1beta",
    capabilities: ["text", "images", "code"],
    recommended: true
  },
  "gemini-1.0-pro-vision": {
    name: "Gemini 1.0 Pro Vision",
    description: "Fallback model for image analysis",
    endpoint: "https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent",
    version: "v1",
    capabilities: ["text", "images"],
    recommended: false
  },
  "gemini-pro": {
    name: "Gemini Pro",
    description: "Legacy model, text only",
    endpoint: "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent",
    version: "v1", 
    capabilities: ["text"],
    recommended: false
  }
};

// Default model to use
export const DEFAULT_GEMINI_MODEL = "gemini-1.5-flash";

// Get the API endpoint for a specific model
export const getGeminiEndpoint = (modelId: string = DEFAULT_GEMINI_MODEL): string => {
  return AVAILABLE_MODELS[modelId as keyof typeof AVAILABLE_MODELS]?.endpoint || 
         AVAILABLE_MODELS[DEFAULT_GEMINI_MODEL].endpoint;
};

// Default API endpoint for Gemini
const GEMINI_API_ENDPOINT = getGeminiEndpoint();
const GEMINI_VISION_API_ENDPOINT = getGeminiEndpoint();

// Get API key from localStorage, environment variable, or use default
export const getGeminiApiKey = (): string => {
  // Check for environment variable first (useful for server-side or development)
  if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  }
  
  // Then check localStorage for client-side storage
  if (typeof window !== 'undefined') {
    return localStorage.getItem('gemini_api_key') || '';
  }
  
  return '';
};

// Save API key to localStorage
export const saveGeminiApiKey = (apiKey: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('gemini_api_key', apiKey);
  }
};

// Check if API key exists
export const hasGeminiApiKey = (): boolean => {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('gemini_api_key');
  }
  return false;
};

/**
 * Helper function to extract valid flashcards from text content
 * with robust error handling
 */
export const extractFlashcardsFromText = (content: string): Array<{question: string, answer: string}> => {
  // Try multiple parsing strategies with proper error handling
  
  // Strategy 1: Direct JSON parsing
  try {
    const directParse = JSON.parse(content);
    if (Array.isArray(directParse) && directParse.length > 0) {
      // Validate each card has question and answer
      const validCards = directParse.filter(card => 
        card && typeof card === 'object' && 
        'question' in card && 'answer' in card &&
        typeof card.question === 'string' && 
        typeof card.answer === 'string'
      );
      
      if (validCards.length > 0) {
        return validCards;
      }
    }
  } catch (parseError: unknown) {
    const errorMsg = parseError instanceof Error ? parseError.message : String(parseError);
    console.log("Direct parsing failed, trying alternative methods:", errorMsg);
  }
  
  // Strategy 2: Extract JSON array using regex
  try {
    const jsonMatch = content.match(/\[\s*\{[^]*\}\s*\]/);
    if (jsonMatch) {
      const extractedJson = jsonMatch[0];
      const parsed = JSON.parse(extractedJson);
      
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validCards = parsed.filter(card => 
          card && typeof card === 'object' && 
          'question' in card && 'answer' in card &&
          typeof card.question === 'string' && 
          typeof card.answer === 'string'
        );
        
        if (validCards.length > 0) {
          return validCards;
        }
      }
    }
  } catch (jsonError: unknown) {
    const errorMsg = jsonError instanceof Error ? jsonError.message : String(jsonError);
    console.warn("JSON extraction failed, trying cleanup methods:", errorMsg);
  }
  
  // Strategy 3: Advanced cleanup of malformed JSON
  try {
    const bracketMatch = content.match(/\[([\s\S]*)\]/);
    if (bracketMatch && bracketMatch[1]) {
      // Replace common issues that break JSON parsing
      let cleanedJson = '[' + bracketMatch[1]
        .replace(/(\w+):/g, '"$1":') // Replace unquoted keys
        .replace(/'/g, '"') // Replace single quotes with double quotes
        .replace(/,\s*\]/g, ']') // Remove trailing commas
        .replace(/,\s*,/g, ',') // Remove double commas
        + ']';
      
      // Fix missing quotes around values if needed
      cleanedJson = cleanedJson.replace(/"([^"]+)":\s*([^",\}\]]+)([,\}\]])/g, '"$1": "$2"$3');
      
      const parsedData = JSON.parse(cleanedJson);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        const validCards = parsedData.filter(card => 
          card && typeof card === 'object' && 
          'question' in card && 'answer' in card &&
          typeof card.question === 'string' && 
          typeof card.answer === 'string'
        );
        
        if (validCards.length > 0) {
          return validCards;
        }
      }
    }
  } catch (cleanError: unknown) {
    const errorMsg = cleanError instanceof Error ? cleanError.message : String(cleanError);
    console.warn("Advanced cleanup failed:", errorMsg);
  }
  
  // Last resort: Try to extract anything that looks like a question/answer pair
  try {
    // Look for question-answer patterns in text
    const qaPattern = /["']question["']\s*:\s*["']([^"']+)["']\s*,\s*["']answer["']\s*:\s*["']([^"']+)["']/g;
    const matches = [...content.matchAll(qaPattern)];
    
    if (matches.length > 0) {
      return matches.map(match => ({
        question: match[1],
        answer: match[2]
      }));
    }
  } catch (e) {
    console.warn("Last resort extraction failed");
  }
  
  // If all else fails
  throw new Error("Could not parse flashcard data from response");
};

/**
 * Process AI response to extract flashcards with improved error handling
 */
function processAIFlashcardResponse(content: string | undefined | null): Array<{question: string, answer: string}> {
  if (!content) {
    throw new Error("No content returned from AI model");
  }
  
  try {
    // Use the enhanced parser that tries multiple methods
    let flashcards = parseAIResponseToFlashcards(content);
    
    // Filter out problematic flashcards
    return filterProblematicFlashcards(flashcards);
  } catch (error: any) {
    console.error("Failed to extract flashcards:", error);
    throw new Error(`Couldn't parse flashcards from response: ${error.message}`);
  }
}

// Generate flashcards from text using Gemini
export const generateFlashcardsFromText = async (
  text: string, 
  count: number = 5,
  apiKey: string = getGeminiApiKey(),
  modelId: string = DEFAULT_GEMINI_MODEL
): Promise<Array<{question: string, answer: string}>> => {
  if (!apiKey) throw new Error("Gemini API key is required");
  
  try {
    // Use the educational flashcard prompt
    const prompt = EDUCATIONAL_FLASHCARD_PROMPT.replace('[Hier den deutschen Text einfügen]', text.substring(0, 8000));
    
    // Get the endpoint for the selected model
    const endpoint = getGeminiEndpoint(modelId);
    
    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // Process the response using our enhanced parser
    let flashcards = processAIFlashcardResponse(content);
    
    return flashcards;
  } catch (error: any) {
    console.error("Error generating flashcards:", error);
    throw new Error(`Failed to generate flashcards: ${error.message}`);
  }
};

// Convert image to Base64
export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Generate flashcards from an image using Gemini Vision
export const generateFlashcardsFromImage = async (
  imageFile: File, 
  count: number = 5,
  apiKey: string = getGeminiApiKey(),
  modelId: string = DEFAULT_GEMINI_MODEL
): Promise<Array<{question: string, answer: string}>> => {
  if (!apiKey) throw new Error("Gemini API key is required");
  
  try {
    const imageBase64 = await imageToBase64(imageFile);
    // Remove the data URL prefix
    const base64Data = imageBase64.split(',')[1];
    
    // Use the standard image prompt
    const prompt = EDUCATIONAL_IMAGE_FLASHCARD_PROMPT;
    
    // For image processing, we need a vision-capable model
    // If the selected model doesn't support vision, fall back to a vision model
    const modelInfo = AVAILABLE_MODELS[modelId as keyof typeof AVAILABLE_MODELS];
    const endpoint = modelInfo?.capabilities.includes("images") 
      ? getGeminiEndpoint(modelId)
      : getGeminiEndpoint("gemini-1.5-flash"); // Default to a model that supports images
      
    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: imageFile.type,
                data: base64Data
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error("No content returned from Gemini API");
    }

    // Try to parse the response in multiple ways
    try {
      let flashcards = extractFlashcardsFromText(content);
      return filterProblematicFlashcards(flashcards);
    } catch (parseError: any) {
      console.error("Failed to extract flashcards:", parseError);
      throw new Error(`Couldn't parse flashcards from response`);
    }
  } catch (error: any) {
    console.error("Error generating flashcards from image:", error);
    throw new Error(`Failed to generate flashcards from image: ${error.message}`);
  }
};

/**
 * Improves the quality of fallback answers by making them more informative and reasoned
 */
function enhanceFallbackAnswer(sentence: string, keyword: string): string {
  // Common topics that might appear in scientific or educational texts
  const topics = {
    // Biochemistry and molecular biology
    'enzym': 'Enzyme sind biologische Katalysatoren, die biochemische Reaktionen beschleunigen, ohne selbst verbraucht zu werden. Ihre Aktivität wird maßgeblich von Faktoren wie pH-Wert und Temperatur beeinflusst.',
    'protein': 'Proteine sind komplexe Makromoleküle, die aus Aminosäuren aufgebaut sind und vielfältige Funktionen im Organismus übernehmen, darunter als Enzyme, Strukturproteine und Transportmoleküle.',
    'dna': 'DNA (Desoxyribonukleinsäure) ist der Träger der genetischen Information, die durch die Abfolge ihrer Nukleotidbasen (A, T, G, C) codiert wird.',
    'rna': 'RNA (Ribonukleinsäure) übernimmt verschiedene Funktionen in der Genexpression, darunter als Boten-RNA (mRNA), Transfer-RNA (tRNA) und ribosomale RNA (rRNA).',
    
    // Physics and chemistry
    'temperatur': 'Die Temperatur ist ein physikalischer Parameter, der die Wärmeenergie in einem System beschreibt und zahlreiche chemische und biologische Prozesse beeinflusst.',
    'ph-wert': 'Der pH-Wert ist ein Maß für die Konzentration an Protonen (H⁺) in einer Lösung und beeinflusst maßgeblich die Struktur und Funktion von Biomolekülen wie Proteinen.',
    
    // General science concepts
    'prozess': 'Prozesse in wissenschaftlichen Kontexten beschreiben systematische Abfolgen von Vorgängen, die spezifischen Gesetzmäßigkeiten folgen und oft durch externe Faktoren beeinflusst werden können.',
    'struktur': 'Die Struktur eines Moleküls oder Systems bestimmt maßgeblich dessen Funktion und Eigenschaften, wobei verschiedene Ebenen der Organisation unterschieden werden können.',
    'funktion': 'Die Funktion biologischer oder chemischer Komponenten ergibt sich aus ihrer Struktur und ihren spezifischen Eigenschaften im Kontext des Gesamtsystems.',
    
    // Academic and learning
    'faktoren': 'Faktoren sind Einflussgrößen, die einen Prozess oder ein System beeinflussen können. Die Identifikation und Analyse dieser Faktoren ist essentiell für das wissenschaftliche Verständnis.'
  };

  // Check if sentence contains specific patterns where we can provide better answers
  const lowerSentence = sentence.toLowerCase();
  
  // Process the sentence to form a reasoned, clear answer
  let enhancedAnswer = "";
  
  // Check for specific topic patterns in the sentence
  for (const [topicKey, explanation] of Object.entries(topics)) {
    if (lowerSentence.includes(topicKey)) {
      // We found a relevant topic in the sentence
      enhancedAnswer = `${explanation} ${sentence}`;
      return enhancedAnswer;
    }
  }
  
  // Handle special cases based on sentence patterns
  if (lowerSentence.includes("temperatur") && lowerSentence.includes("ph")) {
    return "Temperatur und pH-Wert sind kritische Faktoren für die Enzymaktivität. Enzyme haben eine optimale Temperatur, bei der ihre katalytische Aktivität maximal ist. Über dieser Temperatur kommt es zur Denaturierung und Aktivitätsverlust. Der pH-Wert beeinflusst die Ladung der Aminosäurereste im aktiven Zentrum, was die Substratbindung und Katalyse direkt beeinflusst. Jedes Enzym hat einen charakteristischen optimalen pH-Bereich für seine Funktion.";
  }
  
  // If we can't create a specific enhanced answer, provide a more structured version of the original
  if (keyword) {
    enhancedAnswer = `${keyword} ist ein wichtiges Konzept in diesem Kontext. ${sentence} Dies ist fundamental für das Verständnis des beschriebenen Systems und seiner Funktionsweise.`;
  } else {
    enhancedAnswer = `Dieser Sachverhalt ist wichtig zu verstehen: ${sentence} Die genauen Zusammenhänge werden durch wissenschaftliche Prinzipien erklärt.`;
  }
  
  return enhancedAnswer;
}

// Create a simple fallback for when the API fails
export const generateFallbackFlashcards = (
  text: string,
  count: number = 5
): Array<{question: string, answer: string}> => {
  // Very basic algorithm to extract potential flashcards from text
  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 10);
  const flashcards: Array<{question: string, answer: string}> = [];
  
  // Create simple flashcards from sentences
  for (let i = 0; i < Math.min(count, sentences.length - 1); i++) {
    const sentenceIndex = Math.floor(Math.random() * (sentences.length - 1));
    const sentence = sentences[sentenceIndex].trim();
    
    if (sentence.length > 20) {
      // Extract potential topic from the sentence
      const words = sentence.split(" ");
      const importantWords = words.filter(word => 
        word.length > 5 && 
        !["weil", "ohne", "durch", "deshalb", "obwohl", "damit", "wenn", "aber", "oder", "denn"].includes(word.toLowerCase())
      );
      
      if (importantWords.length > 0) {
        const keyword = importantWords[Math.floor(Math.random() * importantWords.length)].replace(/[,.;:!?()]/g, '');
        
        const germanTemplates = [
          `Welche Funktion erfüllt ${keyword} im beschriebenen System?`,
          `Wie wirkt sich ${keyword} auf andere Prozesse aus?`,
          `Welche wissenschaftlichen Grundlagen erklären das Konzept von ${keyword}?`
        ];
        
        const question = germanTemplates[Math.floor(Math.random() * germanTemplates.length)];
        
        flashcards.push({
          question: question,
          answer: enhanceFallbackAnswer(sentence, keyword)
        });
      } else {
        // Fallback if no important words found
        flashcards.push({
          question: `Welche Erkenntnisse können aus folgendem Textausschnitt gewonnen werden?`,
          answer: enhanceFallbackAnswer(sentence, "")
        });
      }
    }
  }
  
  // If we couldn't create enough flashcards, add some generic ones
  while (flashcards.length < count) {
    const i = flashcards.length;
    flashcards.push({
      question: `Lernkarte ${i + 1}: Welche wichtigen Konzepte werden im Text behandelt?`,
      answer: "Bitte überprüfe den Inhalt und formuliere deine eigene Antwort für diese Lernkarte."
    });
  }
  
  return flashcards;
};

// Generate flashcards with fallback mechanism
export const generateFlashcardsWithFallback = async (
  text: string,
  count: number = 5,
  apiKey: string = getGeminiApiKey(),
  modelId: string = DEFAULT_GEMINI_MODEL
): Promise<Array<{question: string, answer: string}>> => {
  try {
    // Try using the API first
    return await generateFlashcardsFromText(text, count, apiKey, modelId);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn("API flashcard generation failed, using fallback method:", errorMsg);
    // Use the fallback if API fails
    return generateFallbackFlashcards(text, count);
  }
};

// Get the best available model for a specific capability
export const getBestModelFor = async (
  capability: "text" | "images" | "code", 
  apiKey: string
): Promise<string> => {
  if (!apiKey) return DEFAULT_GEMINI_MODEL;
  
  try {
    // Get available models from the API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    
    if (!response.ok) {
      // Fallback to default model on error
      return DEFAULT_GEMINI_MODEL;
    }
    
    const data = await response.json();
    const availableModels = data.models?.map((m: any) => m.name.split('/').pop()) || [];
    
    // Find the first recommended model that supports the capability and is available
    for (const [modelId, model] of Object.entries(AVAILABLE_MODELS)) {
      const modelInfo = model as any;
      if (
        modelInfo.recommended && 
        modelInfo.capabilities.includes(capability) && 
        availableModels.includes(modelId)
      ) {
        return modelId;
      }
    }
    
    // If no recommended model is available, try any model with the capability
    for (const [modelId, model] of Object.entries(AVAILABLE_MODELS)) {
      const modelInfo = model as any;
      if (modelInfo.capabilities.includes(capability) && availableModels.includes(modelId)) {
        return modelId;
      }
    }
    
    // Fallback to default
    return DEFAULT_GEMINI_MODEL;
    
  } catch (error) {
    console.warn("Failed to fetch available models:", error);
    return DEFAULT_GEMINI_MODEL;
  }
};

/**
 * Detects if the Gemini API key has access to the 1.5 family of models
 * This helps with providing better guidance to users
 */
export const checkGeminiApiKeyCapabilities = async (
  apiKey: string
): Promise<{
  hasAccess: boolean;
  availableModels: string[];
  recommendedModel: string;
}> => {
  if (!apiKey) {
    return {
      hasAccess: false,
      availableModels: [],
      recommendedModel: DEFAULT_GEMINI_MODEL
    };
  }
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    
    if (!response.ok) {
      return {
        hasAccess: false,
        availableModels: [],
        recommendedModel: DEFAULT_GEMINI_MODEL
      };
    }
    
    const data = await response.json();
    const availableModels = data.models?.map((m: any) => m.name.split('/').pop()) || [];
    
    // Check if any 1.5 models are available
    const has15Model = availableModels.some(m => m.includes("1.5"));
    
    // Find the best model to recommend
    let recommendedModel = DEFAULT_GEMINI_MODEL;
    if (availableModels.includes("gemini-1.5-flash")) {
      recommendedModel = "gemini-1.5-flash";
    } else if (availableModels.includes("gemini-1.5-pro")) {
      recommendedModel = "gemini-1.5-pro";
    } else if (availableModels.includes("gemini-pro-vision")) {
      recommendedModel = "gemini-pro-vision";
    } else if (availableModels.includes("gemini-pro")) {
      recommendedModel = "gemini-pro";
    }
    
    return {
      hasAccess: has15Model,
      availableModels,
      recommendedModel
    };
    
  } catch (error) {
    console.warn("Failed to check API key capabilities:", error);
    return {
      hasAccess: false,
      availableModels: [],
      recommendedModel: DEFAULT_GEMINI_MODEL
    };
  }
};

/**
 * Fixed Gemini API implementation
 * Removes the problematic responseStyle parameter
 */
export class GeminiAPI {
  private apiKey: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(apiKey: string = "", model: string = "gemini-pro") {
    this.apiKey = apiKey;
    this.model = model;
    this.temperature = 0.2;
    this.maxTokens = 8192;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  setModel(model: string) {
    this.model = model;
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // Check if the API key can access the model
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${this.model}?key=${this.apiKey}`
      );
      
      return response.status === 200;
    } catch (error) {
      console.error("Error validating API key:", error);
      return false;
    }
  }

  async generateFlashcardsFromText(text: string): Promise<FlashcardSubmission[]> {
    if (!this.apiKey) {
      throw new Error("API key is not set");
    }

    const prompt = `
      You are an expert educational content creator specializing in creating high-quality study flashcards.
      Your task is to generate concise, accurate, and effective flashcards based on the provided text.
      
      FORMAT YOUR RESPONSE AS A JSON ARRAY:
      [
        {
          "question": "Clear, specific question",
          "answer": "Concise, accurate answer",
          "tags": ["topic", "subtopic"]
        }
      ]
      
      CREATE 10-15 HIGH-QUALITY FLASHCARDS FROM THE FOLLOWING TEXT:
      
      ${text}
    `;

    // IMPORTANT: Removed the responseStyle parameter that was causing the error
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: this.temperature,
        maxOutputTokens: this.maxTokens,
        topP: 0.95,
        topK: 64
      }
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${errorText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;

      try {
        // Try to extract JSON from the text
        const jsonMatch = generatedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        
        // If no match, try parsing the whole text
        return JSON.parse(generatedText);
      } catch (error) {
        console.error("Failed to parse flashcards:", error);
        throw new Error("Failed to parse the AI response into flashcards");
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
      throw error;
    }
  }
}