/**
 * Enhanced Gemini API Service
 * Support for Gemini 1.5 Pro and Flash models with improved flashcard generation
 */

import { FlashcardSubmission } from "@/types/flashcards";
import { buildEnhancedPrompt } from "./ai-prompts-enhanced";

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
  subjectArea?: 'science' | 'mathematics' | 'humanities' | 'language';
}

// Default configuration
const DEFAULT_CONFIG: Partial<GeminiConfig> = {
  model: "gemini-1.5-flash",
  temperature: 0.2,
  maxOutputTokens: 8192,
};

/**
 * Enhanced Gemini service for generating flashcards
 */
export class EnhancedGeminiService {
  private apiKey: string;
  private model: GeminiModel;
  private temperature: number;
  private maxOutputTokens: number;
  private subjectArea?: 'science' | 'mathematics' | 'humanities' | 'language';

  /**
   * Create a new Gemini service instance
   */
  constructor(config: GeminiConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || DEFAULT_CONFIG.model as GeminiModel;
    this.temperature = config.temperature || DEFAULT_CONFIG.temperature as number;
    this.maxOutputTokens = config.maxOutputTokens || DEFAULT_CONFIG.maxOutputTokens as number;
    this.subjectArea = config.subjectArea;
  }

  /**
   * Update service configuration
   */
  updateConfig(config: Partial<GeminiConfig>): void {
    if (config.apiKey) this.apiKey = config.apiKey;
    if (config.model) this.model = config.model;
    if (config.temperature !== undefined) this.temperature = config.temperature;
    if (config.maxOutputTokens) this.maxOutputTokens = config.maxOutputTokens;
    if (config.subjectArea) this.subjectArea = config.subjectArea;
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
    // Use the enhanced prompt builder
    const modelType = this.model.includes('pro') ? 'pro' : 'flash';
    const { prompt, systemPrompt } = buildEnhancedPrompt('text', this.subjectArea, modelType);
    
    const finalPrompt = `${prompt}\n\n${text}`;
    
    // Construct the API request
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: systemPrompt
            }
          ],
          role: "system"
        },
        {
          parts: [
            {
              text: finalPrompt
            }
          ],
          role: "user"
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
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      // Extract the generated text from the response
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Parse the JSON response to extract flashcards
      try {
        // First, try to find JSON array in the response
        const jsonMatch = generatedText.match(/\[\s*\{.*\}\s*\]/s);
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
    
    // Use the enhanced prompt builder
    const modelType = this.model.includes('pro') ? 'pro' : 'flash';
    const { prompt, systemPrompt } = buildEnhancedPrompt('image', this.subjectArea, modelType);
    
    // Construct the API request
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: systemPrompt
            }
          ],
          role: "system"
        },
        {
          parts: [
            {
              text: prompt
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, "")
              }
            }
          ],
          role: "user"
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
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      // Extract the generated text from the response
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Parse the JSON response to extract flashcards
      try {
        // First, try to find JSON array in the response
        const jsonMatch = generatedText.match(/\[\s*\{.*\}\s*\]/s);
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
    
    // Use the enhanced prompt builder
    const modelType = this.model.includes('pro') ? 'pro' : 'flash';
    const { prompt, systemPrompt } = buildEnhancedPrompt('combined', this.subjectArea, modelType);
    
    const finalPrompt = `${prompt}\n\nTEXT:\n${text}`;
    
    // Construct the API request
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: systemPrompt
            }
          ],
          role: "system"
        },
        {
          parts: [
            {
              text: finalPrompt
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, "")
              }
            }
          ],
          role: "user"
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
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      // Extract the generated text from the response
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Parse the JSON response to extract flashcards
      try {
        // First, try to find JSON array in the response
        const jsonMatch = generatedText.match(/\[\s*\{.*\}\s*\]/s);
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

export default EnhancedGeminiService;