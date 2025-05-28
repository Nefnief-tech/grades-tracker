import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Check if we're in a Node.js environment
const isServerEnvironment = typeof window === 'undefined';

// Create a polyfill for the File API in Node.js environments
class NodeFile {
  name: string;
  type: string;
  size: number;
  data: Buffer | ArrayBuffer;

  constructor(
    bits: BlobPart[],
    name: string,
    options?: FilePropertyBag
  ) {
    this.name = name;
    this.type = options?.type || '';
    
    // Convert bits to Buffer for Node.js
    if (Array.isArray(bits) && bits.length > 0) {
      if (bits[0] instanceof Buffer) {
        this.data = bits[0];
      } else if (bits[0] instanceof ArrayBuffer) {
        this.data = bits[0];
      } else if (typeof bits[0] === 'string') {
        this.data = Buffer.from(bits[0]);
      } else {
        // Fallback
        this.data = Buffer.alloc(0);
      }
    } else {
      this.data = Buffer.alloc(0);
    }
    this.size = Buffer.isBuffer(this.data) ? this.data.length : this.data.byteLength;
  }

  // Methods to match File API
  arrayBuffer() {
    return Promise.resolve(this.data);
  }

  text() {
    if (Buffer.isBuffer(this.data)) {
      return Promise.resolve(this.data.toString('utf-8'));
    }
    return Promise.resolve(new TextDecoder().decode(this.data as ArrayBuffer));
  }

  slice(start?: number, end?: number, contentType?: string) {
    if (Buffer.isBuffer(this.data)) {
      const newData = this.data.slice(start, end);
      return new NodeFile([newData], this.name, { type: contentType || this.type });
    }
    const newData = this.data.slice(start, end);
    return new NodeFile([newData], this.name, { type: contentType || this.type });
  }
}

// Use either the browser's File or our polyfill
const FileClass = isServerEnvironment ? NodeFile : File;

// Create a type for our custom NodeFile
type CustomFile = {
  name: string;
  type: string;
  size: number;
  data?: Buffer | ArrayBuffer;
  arrayBuffer: () => Promise<ArrayBuffer>;
  text: () => Promise<string>;
  slice: (start?: number, end?: number, contentType?: string) => any;
};

// Helper function to convert blob to base64
async function blobToBase64(blob: Blob | File | CustomFile): Promise<string> {
  if (isServerEnvironment) {
    // Node.js environment
    if ((blob as CustomFile).data) {
      const data = (blob as CustomFile).data;
      if (Buffer.isBuffer(data)) {
        return data.toString('base64');
      } else if (data instanceof ArrayBuffer) {
        return Buffer.from(data).toString('base64');
      }
    }
    
    // If it's a blob or file with arrayBuffer method
    if ('arrayBuffer' in blob) {
      const arrayBuffer = await blob.arrayBuffer();
      return Buffer.from(arrayBuffer).toString('base64');
    }
    
    // Last resort
    return '';
  } else {
    // Browser environment
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(blob as Blob);
    });
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

export async function POST(request: NextRequest) {  try {
    console.log("Vocabulary extraction API called");
    
    // Add more debug info about the request
    console.log("Request method:", request.method);
    console.log("Request headers:", Object.fromEntries(request.headers.entries()));
    
    // Get form data with better error handling
    let formData;
    try {
      formData = await request.formData();
      console.log("Form data entries:", Array.from(formData.entries()).map(([key]) => key));
    } catch (error) {
      console.error("Error parsing form data:", error);
      return NextResponse.json({ 
        error: "Invalid form data", 
        details: error instanceof Error ? error.message : String(error) 
      }, { status: 400 });
    }
    
    // Get image files
    const imageFiles = formData.getAll("images") as unknown[];
    console.log(`Retrieved ${imageFiles.length} images from form data`);
    
    // No images provided
    if (!imageFiles || imageFiles.length === 0) {
      console.log("No images provided");
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }    // Get API key
    const apiKey = formData.get("apiKey");
    console.log("API key provided:", apiKey ? "YES" : "NO");
    
    // For demo mode, use a fixed response
    if (!apiKey || apiKey === "demo" || apiKey === "demomode") {
      console.log("Using demo mode - returning sample vocabulary");
      return NextResponse.json({
        success: true,
        vocabulary: getSampleVocabulary(),
        mode: "demo"
      });
    }

    console.log(`Processing ${imageFiles.length} images with Gemini API`);
    const genAI = new GoogleGenerativeAI(apiKey as string);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Prepare the prompt
    const prompt = `
    You are a language learning assistant, specialized in extracting vocabulary from textbooks.
    
    Analyze the uploaded image(s) of vocabulary pages from a language textbook.
    The pages are likely to have a two-column layout with vocabulary words in one language and their translations in another.
    Extract all vocabulary words and their translations.
    
    Please return the results in the following JSON format:
    {
      "vocabulary": [
        {"term": "word1", "definition": "translation1"},
        {"term": "word2", "definition": "translation2"},
        ...
      ]
    }
    
    Don't include any additional text or explanations in your response, ONLY the JSON.
    If you cannot extract vocabulary from the images, return an empty array.
    `;

    // Prepare image parts for the model
    const imageParts: Array<{inlineData: {data: string, mimeType: string}}> = [];
      try {
      for (const imageFile of imageFiles) {
        console.log("Processing image file:", 
          typeof imageFile, 
          (imageFile as any).name || "no-name", 
          (imageFile as any).type || "no-type"
        );
        
        // This is where we need to fix the File handling
        let fileData: File | Blob | CustomFile;
        
        // Special handling for demo mode
        if (apiKey === "demo" || apiKey === "demomode") {
          console.log("Demo mode - skipping actual image processing");
          continue;
        }
        
        // Check if it's already a File or Blob
        if (imageFile instanceof FileClass) {
          console.log("Image is already a File instance");
          fileData = imageFile as any;
        } else if ('arrayBuffer' in (imageFile as any) && typeof (imageFile as any).arrayBuffer === 'function') {
          console.log("Image has arrayBuffer method");
          fileData = imageFile as any;
        } else {
          // Handle other formats
          console.log("Converting unknown image format to File");
          let fileBlob;
          
          // Try different ways to get the file data
          if ('arrayBuffer' in (imageFile as any)) {
            console.log("Using arrayBuffer method");
            const buffer = await (imageFile as Blob).arrayBuffer();
            fileBlob = buffer;
          } else if (Buffer.isBuffer(imageFile)) {
            console.log("Image is a Buffer");
            fileBlob = imageFile;
          } else {
            // Last resort for unknown types
            console.warn('Unknown image file type:', typeof imageFile);
            fileBlob = new Uint8Array(0);
          }
          
          const fileName = (imageFile as any).name || 'image.jpg';
          const fileType = (imageFile as any).type || 'image/jpeg';
          fileData = new FileClass([fileBlob], fileName, { type: fileType }) as any;
        }
        
        const base64Data = await blobToBase64(fileData);
        imageParts.push({
          inlineData: {
            data: base64Data,
            mimeType: fileData.type || 'image/jpeg',
          },
        });
      }
    } catch (error) {
      console.error("Error processing image files:", error);
      return NextResponse.json({
        success: false,
        error: "Failed to process image files",
        message: error instanceof Error ? error.message : String(error),
      }, { status: 500 });
    }

    // Generate content with the model
    console.log("Building request for Gemini API");
    const parts = [{ text: prompt }];
    
    // Add each image part separately
    for (const part of imageParts) {
      parts.push(part as any);
    }
    
    console.log("Sending request to Gemini API");
    let result;
    try {
      result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: parts,
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096,
        },
      });
    } catch (error) {
      console.error("Gemini API error:", error);
      return NextResponse.json({
        success: false,
        error: "Failed to process image with Gemini API",
        message: error instanceof Error ? error.message : String(error),
      }, { status: 500 });
    }

    console.log("Received response from Gemini API");
    const response = result.response;
    const text = response.text();

    // Extract JSON from the response
    try {
      // Find JSON within the text
      console.log("Parsing JSON response");
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      const data = JSON.parse(jsonStr);
      console.log("Successfully parsed vocabulary response");
      return NextResponse.json({
        success: true,
        vocabulary: data.vocabulary || [],
      });
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      return NextResponse.json({
        success: false,
        error: "Failed to parse vocabulary results",
        rawResponse: text,
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Vocabulary extraction error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to extract vocabulary",
      message: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}