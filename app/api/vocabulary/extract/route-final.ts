import { NextRequest, NextResponse } from 'next/server';

interface VocabularyItem {
  english: string;
  german: string;
  confidence?: number;
}

// Helper function to convert File to base64
async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString('base64');
}

// Helper function to extract vocabulary using Gemini Vision
async function extractVocabularyWithGemini(imageBase64: string, apiKey: string): Promise<VocabularyItem[]> {
  try {
    // Dynamically import to avoid build issues if package isn't installed
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
    Analyze this image of a vocabulary page from a textbook. Extract all vocabulary pairs where typically:
    - English words/phrases are on the left side
    - German translations are on the right side
    
    Return the vocabulary as a JSON array with this exact format:
    [
      {"english": "word/phrase", "german": "translation", "confidence": 0.95},
      {"english": "another word", "german": "andere Übersetzung", "confidence": 0.90}
    ]
    
    Rules:
    1. Only extract clear, readable vocabulary pairs
    2. Include confidence score (0.0 to 1.0) based on how clear the text is
    3. Clean up any OCR artifacts or partial words
    4. Ignore headers, page numbers, or non-vocabulary content
    5. If the layout is different (German on left, English on right), adapt accordingly
    6. Return valid JSON only, no additional text or explanation
    7. If no vocabulary is found, return an empty array []
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg'
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      console.warn('No valid JSON found in Gemini response:', text);
      return [];
    }

    try {
      const vocabulary = JSON.parse(jsonMatch[0]);
      return Array.isArray(vocabulary) ? vocabulary.filter((item: any) => 
        item.english && item.german && 
        typeof item.english === 'string' && 
        typeof item.german === 'string'
      ) : [];
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON response:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Gemini extraction error:', error);
    throw error;
  }
}

// Enhanced local extraction with realistic vocabulary samples (fallback)
async function extractVocabularyLocal(imageBase64: string, imageName: string): Promise<VocabularyItem[]> {
  console.log(`Using fallback local extraction for ${imageName}`);
  
  // Simulate vocabulary extraction with different sets based on image
  const vocabularySets = [
    [
      { english: "house", german: "das Haus", confidence: 0.85 },
      { english: "car", german: "das Auto", confidence: 0.90 },
      { english: "book", german: "das Buch", confidence: 0.88 },
      { english: "water", german: "das Wasser", confidence: 0.92 },
      { english: "food", german: "das Essen", confidence: 0.80 }
    ],
    [
      { english: "school", german: "die Schule", confidence: 0.87 },
      { english: "teacher", german: "der Lehrer", confidence: 0.91 },
      { english: "student", german: "der Student", confidence: 0.89 },
      { english: "lesson", german: "die Stunde", confidence: 0.83 },
      { english: "homework", german: "die Hausaufgabe", confidence: 0.86 }
    ],
    [
      { english: "family", german: "die Familie", confidence: 0.93 },
      { english: "mother", german: "die Mutter", confidence: 0.95 },
      { english: "father", german: "der Vater", confidence: 0.94 },
      { english: "brother", german: "der Bruder", confidence: 0.88 },
      { english: "sister", german: "die Schwester", confidence: 0.90 }
    ]
  ];
  
  // Select vocabulary set based on image name hash
  const hash = imageName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const setIndex = Math.abs(hash) % vocabularySets.length;
  return vocabularySets[setIndex];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const images: File[] = [];
    const apiKey = formData.get('apiKey') as string;
    
    // Extract all uploaded images
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image') && value instanceof File) {
        images.push(value);
      }
    }
    
    if (images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }
    
    console.log(`Processing ${images.length} images for vocabulary extraction`);
    console.log(`API Key provided: ${!!apiKey}`);
    
    let allVocabulary: VocabularyItem[] = [];
    let extractionLog = '';
    let usesFallback = false;
    let geminiWorking = false;
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      console.log(`Processing image ${i + 1}: ${image.name}`);
      
      try {
        // Convert image to base64
        const imageBase64 = await fileToBase64(image);
        
        let vocabulary: VocabularyItem[];
        
        // Try Gemini API first if API key is available
        if (apiKey) {
          try {
            vocabulary = await extractVocabularyWithGemini(imageBase64, apiKey);
            
            if (vocabulary.length > 0) {
              extractionLog += `✅ Image ${i + 1} (${image.name}): Extracted ${vocabulary.length} vocabulary pairs using Gemini AI\n`;
              console.log(`Gemini extracted ${vocabulary.length} vocabulary items from image ${i + 1}`);
              geminiWorking = true;
            } else {
              extractionLog += `⚠️ Image ${i + 1} (${image.name}): No vocabulary found by Gemini AI\n`;
              vocabulary = await extractVocabularyLocal(imageBase64, image.name);
              extractionLog += `📝 Using fallback vocabulary (${vocabulary.length} pairs)\n`;
              usesFallback = true;
            }
          } catch (geminiError) {
            console.warn(`Gemini failed for image ${i + 1}, falling back to local extraction:`, geminiError);
            vocabulary = await extractVocabularyLocal(imageBase64, image.name);
            extractionLog += `❌ Image ${i + 1} (${image.name}): Gemini failed - ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}\n`;
            extractionLog += `📝 Using fallback vocabulary (${vocabulary.length} pairs)\n`;
            usesFallback = true;
          }
        } else {
          console.log('No Gemini API key provided, using local extraction');
          vocabulary = await extractVocabularyLocal(imageBase64, image.name);
          extractionLog += `📝 Image ${i + 1} (${image.name}): Using demo vocabulary (${vocabulary.length} pairs)\n`;
          usesFallback = true;
        }
        
        // Add vocabulary items with source information
        const processedVocabulary = vocabulary.map((item, index) => ({
          ...item,
          sourceImage: image.name,
          extractionIndex: index
        }));
        
        allVocabulary.push(...processedVocabulary);
        
      } catch (error) {
        console.error(`Error processing image ${i + 1}:`, error);
        extractionLog += `❌ Image ${i + 1} (${image.name}): Error during processing - ${error instanceof Error ? error.message : 'Unknown error'}\n`;
      }
    }
    
    // Remove duplicates based on English word
    const uniqueVocabulary = allVocabulary.filter((item, index, self) => 
      index === self.findIndex(v => v.english.toLowerCase() === item.english.toLowerCase())
    );
    
    // Add status information to extraction log
    if (usesFallback && !geminiWorking) {
      if (!apiKey) {
        extractionLog += '\n🔑 No API key provided - using demo vocabulary data.\n';
        extractionLog += 'To enable real image analysis, configure your Gemini API key in flashcard settings.';
      } else {
        extractionLog += '\n⚠️ Gemini AI encountered issues - some results may be demo data.\n';
        extractionLog += 'Check your images are clear and contain visible vocabulary pairs.';
      }
    } else if (geminiWorking) {
      extractionLog += '\n🎉 Successfully extracted vocabulary using Gemini AI!';
    }
    
    console.log(`Total vocabulary extracted: ${uniqueVocabulary.length} unique items`);
    
    return NextResponse.json({
      vocabulary: uniqueVocabulary,
      totalImages: images.length,
      totalVocabulary: uniqueVocabulary.length,
      extractionLog: extractionLog.trim(),
      usedFallback: usesFallback,
      geminiWorking: geminiWorking
    });
    
  } catch (error) {
    console.error('Vocabulary extraction error:', error);
    
    // Check if it's a missing package error
    if (error instanceof Error && error.message.includes('@google/generative-ai')) {
      return NextResponse.json(
        { 
          error: 'Google Generative AI package not installed. Please run: npm install @google/generative-ai',
          details: 'The @google/generative-ai package is required for image analysis.'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to extract vocabulary: ' + (error instanceof Error ? error.message : 'Unknown error'),
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}