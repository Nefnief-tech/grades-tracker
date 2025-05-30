/**
 * Fixed Gemini API Service
 * Support for Gemini 1.5 models - simplified version
 */
import { FlashcardSubmission } from "@/types/flashcards";

export class GeminiAPI {
  private apiKey: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(apiKey: string = "", model: string = "gemini-1.5-flash") {
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

  /**
   * Validate the API key by checking if it can access the specified model
   */
  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}?key=${this.apiKey}`
      );
      return response.status === 200;
    } catch (error) {
      console.error("Error validating API key:", error);
      return false;
    }
  }

  /**
   * Generate flashcards from text
   */
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

  /**
   * Generate flashcards from an image
   */
  async generateFlashcardsFromImage(imageBase64: string): Promise<FlashcardSubmission[]> {
    if (!this.apiKey) {
      throw new Error("API key is not set");
    }

    // Use a vision-capable model
    const visionModel = this.model.includes('vision') ? this.model : 'gemini-1.5-pro-vision';

    const prompt = `
      You are an expert educational content creator specializing in creating study flashcards from visual information.
      Your task is to analyze the image provided and create high-quality flashcards based on its content.
      
      FORMAT YOUR RESPONSE AS A JSON ARRAY:
      [
        {
          "question": "Clear question about the image content",
          "answer": "Accurate answer based on the image",
          "tags": ["relevant", "topics"]
        }
      ]
      
      CREATE 5-10 HIGH-QUALITY FLASHCARDS FROM THE IMAGE PROVIDED.
    `;

    const requestBody = {
      contents: [
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
        `https://generativelanguage.googleapis.com/v1beta/models/${visionModel}:generateContent?key=${this.apiKey}`,
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
      console.error("Error generating flashcards from image:", error);
      throw error;
    }
  }
}

export default GeminiAPI;