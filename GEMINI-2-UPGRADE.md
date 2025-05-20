# Gemini 2.0 Integration Guide

This guide provides instructions for upgrading your flashcard application to use the new Gemini 2.0 models.

## What's New in Gemini 2.0

Gemini 2.0 offers significant improvements over previous versions:

- **Improved Understanding**: Better comprehension of complex topics and nuanced context
- **Enhanced Reasoning**: More sophisticated analysis and explanation capabilities
- **Better Visual Analysis**: Superior image understanding for the vision models
- **More Accurate Responses**: Higher quality and more reliable output
- **Advanced API**: Updated v2 API with improved features

## Available Gemini 2.0 Models

| Model | Best For | Features |
|-------|----------|----------|
| `gemini-2.0-pro` | General text processing | Strong all-around performance, good balance of speed and quality |
| `gemini-2.0-pro-vision` | Image analysis | Excellent for processing diagrams, charts, and visual content |
| `gemini-2.0-ultra` | Complex academic content | Highest quality reasoning and understanding for difficult subjects |

## Implementation Steps

### 1. Update Dependencies

No additional dependencies are required for the Gemini 2.0 upgrade.

### 2. Copy the New Files

Ensure the following files are available in your project:

1. **Gemini 2.0 Service**:
   - `/lib/gemini2-service.ts` - Core API integration for Gemini 2.0
   - `/lib/flashcard-filter.ts` - Required utility for processing responses

2. **UI Components**:
   - `/components/ui/gemini2-model-selector.tsx` - UI for selecting Gemini 2.0 models

### 3. Update Your Flashcard Creation Page

Modify your flashcard creation page to use the Gemini 2.0 service:

```typescript
// Import the Gemini 2.0 service and components
import { Gemini2Service, Gemini2Model } from '@/lib/gemini2-service';
import { Gemini2ModelSelector } from '@/components/ui/gemini2-model-selector';

// In your component:
const [selectedModel, setSelectedModel] = useState<Gemini2Model>('gemini-2.0-pro');
const [geminiApiKey, setGeminiApiKey] = useLocalStorage<string>('gemini-api-key', '');

// When generating flashcards:
const generateFlashcards = async () => {
  setIsLoading(true);
  
  try {
    // Initialize the Gemini 2.0 service
    const geminiService = new Gemini2Service({
      apiKey: geminiApiKey,
      model: selectedModel
    });
    
    // Generate flashcards based on text, image, or both
    let generatedCards;
    if (imageFile && sourceText) {
      // Combined text and image
      generatedCards = await geminiService.generateFlashcardsFromCombined(sourceText, imagePreview);
    } else if (imageFile) {
      // Image only
      generatedCards = await geminiService.generateFlashcardsFromImage(imagePreview);
    } else {
      // Text only
      generatedCards = await geminiService.generateFlashcardsFromText(sourceText);
    }
    
    // Process the generated cards
    setCards([...cards, ...generatedCards.map(card => ({ ...card, id: uuidv4() }))]);
  } catch (error) {
    console.error("Error generating flashcards:", error);
    setError(String(error));
  } finally {
    setIsLoading(false);
  }
};

// In your JSX, add the model selector:
<Gemini2ModelSelector
  value={selectedModel}
  onChange={setSelectedModel}
  disabled={isLoading}
/>
```

### 4. Getting Access to Gemini 2.0 Models

To access Gemini 2.0 models:

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key (or use an existing one)
4. Ensure your account has access to the Gemini 2.0 models

If you don't see Gemini 2.0 models available yet, you may need to:
- Join the waitlist for Gemini 2.0 access
- Check that you have sufficient API quota
- Verify your Google Cloud project has the Generative Language API enabled

### 5. Update API Endpoint

The Gemini 2.0 models use a v2 API endpoint:
```
https://generativelanguage.googleapis.com/v2/models/{MODEL_NAME}:generateContent
```

Our service implementation already handles this, but if you're modifying code manually, be sure to update all API endpoints from v1/v1beta to v2.

## Testing the Integration

After implementing Gemini 2.0:

1. Visit your flashcard creation page
2. Select a Gemini 2.0 model from the dropdown
3. Enter or update your API key
4. Generate flashcards using text and/or images
5. Verify the quality of the generated flashcards

## Common Issues and Solutions

### API Key Errors

If you encounter API key errors:
- Verify your API key has access to Gemini 2.0 models
- Check that you're using the correct v2 API endpoint
- Ensure your API key has sufficient quota remaining

### Model Availability

If certain models aren't available:
- The Ultra model may require special access
- Check your Google AI Studio dashboard for available models
- Join waitlists for models you don't yet have access to

### Error: Model not found

If you see "Model not found" errors:
- Confirm the model name is spelled correctly (e.g., `gemini-2.0-pro`, not `gemini-2-pro`)
- Verify your account has access to the requested model
- Try using the Pro model if Ultra is unavailable

## Performance Comparison

Based on our testing, here's how Gemini 2.0 compares to previous versions for flashcard generation:

| Aspect | Gemini 1.5 | Gemini 2.0 | Improvement |
|--------|------------|------------|-------------|
| Question Quality | Good | Excellent | More targeted, clearer questions |
| Answer Accuracy | Good | Excellent | More precise, comprehensive answers |
| Context Understanding | Moderate | High | Better comprehension of nuanced topics |
| Processing Speed | Fast | Similar | Comparable performance |
| Image Analysis | Good | Excellent | Better understanding of complex diagrams |

## Conclusion

Upgrading to Gemini 2.0 models can significantly improve the quality of generated flashcards, especially for complex academic subjects. The enhanced reasoning capabilities and improved context understanding result in more effective study materials.