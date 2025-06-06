/**
 * Fixed Gemini API Service
 * Support for Gemini 1.5 models without the problematic responseStyle parameter
 */

import { FlashcardSubmission } from "@/types/flashcards";

// Available Gemini models
export type GeminiModel = 
  | "gemini-1.5-flash"
  | "gemini-1.5-pro"
  | "gemini-1.5-pro-vision";

// Configuration for Gemini API
interface GeminiConfig {
  apiKey: string;
  model: GeminiModel;
  temperature?: number;
  maxOutputTokens?: number;
}

// Default configuration
const DEFAULT_CONFIG: Partial<GeminiConfig> = {
  model: "gemini-1.5-flash",
  temperature: 0.2,
  maxOutputTokens: 8192,
};

/**
 * Text prompt for generating flashcards
 */
const FLASHCARD_PROMPT = `
You are an expert educational content creator specializing in creating high-quality study flashcards.
Your task is to create concise, accurate, and effective flashcards based on the provided text.

GUIDELINES FOR EXCELLENT FLASHCARDS:
1. Create clear, concise question-answer pairs that follow best practices for learning and retention
2. Focus on core concepts, definitions, important facts, relationships between ideas, and practical applications
3. Use precise language and avoid ambiguity
4. Break complex topics into smaller, focused flashcards rather than creating lengthy, overwhelming ones
5. Include a mix of recall, comprehension, application, and critical thinking questions

FORMAT YOUR RESPONSE AS A JSON ARRAY:
[
  {
    "question": "Clear, specific question",
    "answer": "Concise, accurate answer",
    "tags": ["topic", "subtopic"]
  },
  {
    "question": "Another question?",
    "answer": "Another answer",
    "tags": ["relevant", "tags"]
  }
]

CREATE 10-15 HIGH-QUALITY FLASHCARDS FROM THE FOLLOWING TEXT:
`;

/**
 * Fixed Gemini service for generating flashcards
 */
export class FixedGeminiService {
  private apiKey: string;
  private model: GeminiModel;
  private temperature: number;
  private maxOutputTokens: number;

  /**
   * Create a new Gemini service instance
   */
  constructor(config: GeminiConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || DEFAULT_CONFIG.model as GeminiModel;
    this.temperature = config.temperature || DEFAULT_CONFIG.temperature as number;
    this.maxOutputTokens = config.maxOutputTokens || DEFAULT_CONFIG.maxOutputTokens as number;
  }

  /**
   * Update service configuration
   */
  updateConfig(config: Partial<GeminiConfig>): void {
    if (config.apiKey) this.apiKey = config.apiKey;
    if (config.model) this.model = config.model;
    if (config.temperature !== undefined) this.temperature = config.temperature;
    if (config.maxOutputTokens) this.maxOutputTokens = config.maxOutputTokens;
  }

  /**
   * Check if the API key is valid
   */
  async validateApiKey(): Promise<boolean> {
    try {
      // Make a minimal request to check if the API key works
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}?key=${this.apiKey}`
      );
      
      if (response.status === 200) {
        return true;
      } else if (response.status === 403 || response.status === 401) {
        console.error("Invalid API key or insufficient permissions");
        return false;
      } else {
        console.error(`API validation failed with status: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error("Error validating API key:", error);
      return false;
    }
  }

  /**
   * Generate flashcards from text content
   */
  async generateFlashcardsFromText(text: string): Promise<FlashcardSubmission[]> {
    const finalPrompt = `${FLASHCARD_PROMPT}\n\n${text}`;
    
    // Construct the API request with fixed parameters
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: finalPrompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: this.temperature,
        maxOutputTokens: this.maxOutputTokens,
        topP: 0.95,
        topK: 64
      }
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
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
      
      // Extract the generated text from the response
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Parse the JSON response to extract flashcards
      try {
        // First, try to find JSON array in the response
        const jsonMatch = generatedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          const flashcards = JSON.parse(jsonStr) as FlashcardSubmission[];
          return flashcards;
        }
        
        // If no JSON array found, try parsing the entire response
        const flashcards = JSON.parse(generatedText) as FlashcardSubmission[];
        return flashcards;
      } catch (error) {
        console.error("Failed to parse flashcards from JSON:", error);
        console.error("Raw response:", generatedText);
        throw new Error("Failed to parse the AI response into flashcards");
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
      throw error;
    }
  }

  /**
   * Generate flashcards from an image
   */
  async generateFlashcardsFromImage(imageBase64: string): Promise<FlashcardSubmission[]> {
    // Ensure we're using a vision-capable model
    if (!this.model.includes('vision') && !this.model.includes('pro')) {
      this.model = 'gemini-1.5-pro-vision';
      console.log("Switched to vision-capable model:", this.model);
    }
    
    const imagePrompt = `
    You are an expert educational content creator specializing in creating study flashcards from visual information.
    Your task is to analyze the image provided and create high-quality flashcards based on its content.
    
    CREATE 5-10 HIGH-QUALITY FLASHCARDS FROM THE IMAGE PROVIDED.
    
    Format your response as a JSON array of flashcard objects with question, answer, and tags fields.
    `;
    
    // Construct the API request with fixed parameters
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: imagePrompt
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, "")
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: this.temperature,
        maxOutputTokens: this.maxOutputTokens,
        topP: 0.95,
        topK: 64
      }
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
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
      
      // Extract the generated text from the response
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Parse the JSON response to extract flashcards
      try {
        // First, try to find JSON array in the response
        const jsonMatch = generatedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          const flashcards = JSON.parse(jsonStr) as FlashcardSubmission[];
          return flashcards;
        }
        
        // If no JSON array found, try parsing the entire response
        const flashcards = JSON.parse(generatedText) as FlashcardSubmission[];
        return flashcards;
      } catch (error) {
        console.error("Failed to parse flashcards from JSON:", error);
        console.error("Raw response:", generatedText);
        throw new Error("Failed to parse the AI response into flashcards");
      }
    } catch (error) {
      console.error("Error generating flashcards from image:", error);
      throw error;
    }
  }

  /**
   * Generate flashcards from both text and image
   */
  async generateFlashcardsFromCombined(text: string, imageBase64: string): Promise<FlashcardSubmission[]> {
    // Ensure we're using a vision-capable model
    if (!this.model.includes('vision') && !this.model.includes('pro')) {
      this.model = 'gemini-1.5-pro-vision';
      console.log("Switched to vision-capable model:", this.model);
    }
    
    const combinedPrompt = `
    You are an expert educational content creator specializing in creating comprehensive study flashcards.
    Your task is to analyze both the text and image provided and create high-quality, integrated flashcards.
    
    TEXT:
    ${text}
    
    CREATE 10-15 HIGH-QUALITY FLASHCARDS BASED ON THE ABOVE TEXT AND THE PROVIDED IMAGE.
    
    Format your response as a JSON array of flashcard objects with question, answer, and tags fields.
    `;
    
    // Construct the API request with fixed parameters
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: combinedPrompt
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, "")
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: this.temperature,
        maxOutputTokens: this.maxOutputTokens,
        topP: 0.95,
        topK: 64
      }
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
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
      
      // Extract the generated text from the response
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Parse the JSON response to extract flashcards
      try {
        // First, try to find JSON array in the response
        const jsonMatch = generatedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          const flashcards = JSON.parse(jsonStr) as FlashcardSubmission[];
          return flashcards;
        }
        
        // If no JSON array found, try parsing the entire response
        const flashcards = JSON.parse(generatedText) as FlashcardSubmission[];
        return flashcards;
      } catch (error) {
        console.error("Failed to parse flashcards from JSON:", error);
        console.error("Raw response:", generatedText);
        throw new Error("Failed to parse the AI response into flashcards");
      }
    } catch (error) {
      console.error("Error generating flashcards from combined sources:", error);
      throw error;
    }
  }
}

export default FixedGeminiService;