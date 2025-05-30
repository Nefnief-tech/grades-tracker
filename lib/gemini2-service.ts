/**
 * Gemini 2.0 API Service
 * 
 * Integrates the latest Gemini 2.0 models for improved flashcard generation
 */

import { FlashcardSubmission } from "@/types/flashcards";
import { filterProblematicFlashcards, normalizeFlashcards } from './flashcard-filter';

// Available Gemini 2.0 models
export type Gemini2Model = 
  | "gemini-2.0-pro"
  | "gemini-2.0-pro-vision"
  | "gemini-2.0-ultra";

// Configuration for Gemini 2.0 API
interface Gemini2Config {
  apiKey: string;
  model: Gemini2Model;
  temperature?: number;
  maxOutputTokens?: number;
}

// Default configuration
const DEFAULT_CONFIG: Partial<Gemini2Config> = {
  model: "gemini-2.0-pro",
  temperature: 0.2,
  maxOutputTokens: 8192,
};

/**
 * Text prompt for generating flashcards with Gemini 2.0
 */
const G2_FLASHCARD_PROMPT = `
You are an expert educational content creator specializing in creating high-quality study flashcards.
Your task is to create concise, accurate, and effective flashcards based on the provided text.

GUIDELINES FOR EXCELLENT FLASHCARDS:
1. Create clear, concise question-answer pairs that follow best practices for learning and retention
2. Focus on core concepts, definitions, important facts, relationships between ideas, and practical applications
3. Use precise language and avoid ambiguity
4. Break complex topics into smaller, focused flashcards rather than creating lengthy, overwhelming ones
5. Include a mix of recall, comprehension, application, and critical thinking questions
6. Ensure all content is factually accurate and academically sound

FORMAT YOUR RESPONSE AS A JSON ARRAY:
[
  {
    "question": "Clear, specific question",
    "answer": "Concise, accurate answer",
    "tags": ["topic", "subtopic"]
  }
]

CREATE 10-15 HIGH-QUALITY FLASHCARDS FROM THE FOLLOWING TEXT:
`;

/**
 * Gemini 2.0 service for generating flashcards
 */
export class Gemini2Service {
  private apiKey: string;
  private model: Gemini2Model;
  private temperature: number;
  private maxOutputTokens: number;

  /**
   * Create a new Gemini 2.0 service instance
   */
  constructor(config: Gemini2Config) {
    this.apiKey = config.apiKey;
    this.model = config.model || DEFAULT_CONFIG.model as Gemini2Model;
    this.temperature = config.temperature || DEFAULT_CONFIG.temperature as number;
    this.maxOutputTokens = config.maxOutputTokens || DEFAULT_CONFIG.maxOutputTokens as number;
  }

  /**
   * Update service configuration
   */
  updateConfig(config: Partial<Gemini2Config>): void {
    if (config.apiKey) this.apiKey = config.apiKey;
    if (config.model) this.model = config.model;
    if (config.temperature !== undefined) this.temperature = config.temperature;
    if (config.maxOutputTokens) this.maxOutputTokens = config.maxOutputTokens;
  }

  /**
   * Process AI response to extract and validate flashcards
   */
  private processAIFlashcardResponse(generatedText: string): FlashcardSubmission[] {
    try {
      let flashcards: FlashcardSubmission[] = [];
      
      // First, try to find JSON array in the response
      const jsonMatch = generatedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        flashcards = JSON.parse(jsonStr);
      } else {
        // If no match, try parsing the whole text
        flashcards = JSON.parse(generatedText);
      }
      
      // Filter out problematic flashcards
      const filteredFlashcards = filterProblematicFlashcards(flashcards);
      
      // Normalize the flashcards
      const normalizedFlashcards = normalizeFlashcards(filteredFlashcards);
      
      return normalizedFlashcards;
    } catch (error) {
      console.error("Failed to extract flashcards:", error);
      throw new Error(`Couldn't parse flashcards from response: ${error}`);
    }
  }

  /**
   * Check if the API key is valid
   */
  async validateApiKey(): Promise<boolean> {
    try {
      // Make a minimal request to check if the API key works
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v2/models/${this.model}?key=${this.apiKey}`
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
    const finalPrompt = `${G2_FLASHCARD_PROMPT}\n\n${text}`;
    
    // Construct the API request with Gemini 2.0 format
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
      // Note the v2 endpoint for Gemini 2.0
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v2/models/${this.model}:generateContent?key=${this.apiKey}`,
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
      
      // Process the response to extract and validate flashcards
      return this.processAIFlashcardResponse(generatedText);
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
    if (!this.model.includes('vision')) {
      this.model = 'gemini-2.0-pro-vision';
      console.log("Switched to vision-capable model:", this.model);
    }
    
    const imagePrompt = `
    You are an expert educational content creator specializing in creating study flashcards from visual information.
    Your task is to analyze the image provided and create high-quality flashcards based on its content.
    
    CREATE 5-10 HIGH-QUALITY FLASHCARDS FROM THE IMAGE PROVIDED.
    
    Format your response as a JSON array of flashcard objects with question, answer, and tags fields.
    `;
    
    // Construct the API request for image analysis
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
      // Note the v2 endpoint for Gemini 2.0
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v2/models/${this.model}:generateContent?key=${this.apiKey}`,
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
      
      // Process the response to extract and validate flashcards
      return this.processAIFlashcardResponse(generatedText);
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
    if (!this.model.includes('vision')) {
      this.model = 'gemini-2.0-pro-vision';
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
    
    // Construct the API request for combined text and image analysis
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
      // Note the v2 endpoint for Gemini 2.0
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v2/models/${this.model}:generateContent?key=${this.apiKey}`,
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
      
      // Process the response to extract and validate flashcards
      return this.processAIFlashcardResponse(generatedText);
    } catch (error) {
      console.error("Error generating flashcards from combined sources:", error);
      throw error;
    }
  }
}

export default Gemini2Service;