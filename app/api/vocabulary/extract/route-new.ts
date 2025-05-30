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
async function extractVocabularyWithGemini(imageBase64: string): Promise<VocabularyItem[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  // For now, this is a placeholder - install @google/generative-ai to enable real functionality
  throw new Error('Gemini integration requires: npm install @google/generative-ai');
}

// Enhanced local extraction with realistic vocabulary samples
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
    
    let allVocabulary: VocabularyItem[] = [];
    let extractionLog = '';
    let usesFallback = false;
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      console.log(`Processing image ${i + 1}: ${image.name}`);
      
      try {
        // Convert image to base64
        const imageBase64 = await fileToBase64(image);
        
        let vocabulary: VocabularyItem[];
        
        // Try Gemini API first
        if (process.env.GEMINI_API_KEY) {
          try {
            vocabulary = await extractVocabularyWithGemini(imageBase64);
            extractionLog += `Image ${i + 1} (${image.name}): Extracted ${vocabulary.length} vocabulary pairs using Gemini AI\n`;
            console.log(`Gemini extracted ${vocabulary.length} vocabulary items from image ${i + 1}`);
          } catch (geminiError) {
            console.warn(`Gemini failed for image ${i + 1}, falling back to local extraction:`, geminiError);
            vocabulary = await extractVocabularyLocal(imageBase64, image.name);
            extractionLog += `Image ${i + 1} (${image.name}): Fallback extraction used (${vocabulary.length} pairs) - ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}\n`;
            usesFallback = true;
          }
        } else {
          console.log('No Gemini API key found, using local extraction');
          vocabulary = await extractVocabularyLocal(imageBase64, image.name);
          extractionLog += `Image ${i + 1} (${image.name}): Local extraction used (${vocabulary.length} pairs)\n`;
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
        extractionLog += `Image ${i + 1} (${image.name}): Error during processing - ${error instanceof Error ? error.message : 'Unknown error'}\n`;
      }
    }
    
    // Remove duplicates based on English word
    const uniqueVocabulary = allVocabulary.filter((item, index, self) => 
      index === self.findIndex(v => v.english.toLowerCase() === item.english.toLowerCase())
    );
    
    if (usesFallback) {
      extractionLog += '\n📝 Demo Mode: Using sample vocabulary data.\n';
      extractionLog += 'For real image analysis:\n';
      extractionLog += '1. Get a Gemini API key from Google AI Studio\n';
      extractionLog += '2. Add it to your .env.local file as GEMINI_API_KEY=your_key_here\n';
      extractionLog += '3. Install the package: npm install @google/generative-ai';
    }
    
    console.log(`Total vocabulary extracted: ${uniqueVocabulary.length} unique items`);
    
    return NextResponse.json({
      vocabulary: uniqueVocabulary,
      totalImages: images.length,
      totalVocabulary: uniqueVocabulary.length,
      extractionLog: extractionLog.trim(),
      usedFallback: usesFallback
    });
    
  } catch (error) {
    console.error('Vocabulary extraction error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to extract vocabulary: ' + (error instanceof Error ? error.message : 'Unknown error'),
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}