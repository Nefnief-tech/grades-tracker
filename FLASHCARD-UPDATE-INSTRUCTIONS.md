# Enhanced Flashcard System Implementation Guide

This guide provides instructions for upgrading the flashcard system to use the next-gen Gemini models with improved prompting techniques.

## 1. Install Required Dependencies

First, install the necessary dependencies:

```bash
# Run this command in your project directory
npm install react-colorful uuid
```

## 2. Copy the New Files

Ensure all the following files are available in your project:

1. **AI Prompts and Utilities**:
   - `/lib/ai-prompts-enhanced.ts` - Advanced prompts for better flashcard generation
   - `/lib/gemini-service-enhanced.ts` - Updated Gemini API integration

2. **UI Components**:
   - `/components/ui/gemini-model-selector-enhanced.tsx` - Model selection dropdown
   - `/components/ui/subject-area-selector.tsx` - Subject area selector
   - `/components/ui/gemini-key-validator-enhanced.tsx` - Improved key validator

3. **Hooks**:
   - `/hooks/useLocalStorage.ts` - Local storage hook for saving preferences

4. **Updated Page**:
   - `/app/flashcards/create/page-enhanced.tsx` - Enhanced flashcard creation page

## 3. Update Your Routes

Implement the new page in your application by either:

### Option A: Replace the existing page

```bash
# Backup your current page first
cp app/flashcards/create/page.tsx app/flashcards/create/page.tsx.bak

# Copy the enhanced page to replace the current one
cp app/flashcards/create/page-enhanced.tsx app/flashcards/create/page.tsx
```

### Option B: Create a separate route

If you want to keep both versions:

1. Keep the existing route at `/flashcards/create`
2. Create a new route at `/flashcards/create-enhanced` using the enhanced page

## 4. Update Your Import Paths

Make sure all components use the enhanced versions:

1. If you're using the enhanced key validator, update imports:
   ```typescript
   // Change this:
   import { GeminiKeyValidator } from '@/components/ui/gemini-key-validator';
   
   // To this:
   import { GeminiKeyValidator } from '@/components/ui/gemini-key-validator-enhanced';
   ```

2. Update model selector imports:
   ```typescript
   // Change this:
   import GeminiModelSelector from '@/components/ui/gemini-model-selector';
   
   // To this:
   import GeminiModelSelector from '@/components/ui/gemini-model-selector-enhanced';
   ```

## 5. Important: Fix for Gemini API Error

If you encounter this error:
```
Error: Gemini API error: Invalid JSON payload received. Unknown name "responseStyle" at 'generation_config': Cannot find field.
```

This indicates an incompatibility with the Gemini API. To fix it:

1. Use the provided fixed version of the Gemini API client:
   - `/lib/gemini-api-fixed.ts` - Remove the problematic responseStyle parameter
   - `/lib/gemini-service-fixed.ts` - More comprehensive fixed implementation

2. If you're updating manually, find and remove the `responseStyle` parameter in your API request:
   ```typescript
   const requestBody = {
     contents: [ ... ],
     generationConfig: {
       temperature: this.temperature,
       maxOutputTokens: this.maxTokens,
       topP: 0.95,
       topK: 64,
       // Remove this line:
       // responseStyle: "DETAILED" 
     }
   };
   ```

This issue occurs because the `responseStyle` parameter is not supported in the current Gemini API version.

## 6. Testing the Implementation

After implementing all changes:

1. Visit the flashcard creation page
2. Verify that all new features work:
   - Model selection between Gemini 1.5 Flash, Pro, and Pro Vision
   - Subject area selection
   - Improved prompts for better flashcard quality
   - Support for text, image, and combined inputs

## New Features Overview

This update enhances the flashcard system with:

1. **Next-Gen Gemini Models**:
   - **Gemini 1.5 Models**:
     - `gemini-1.5-flash` - Fast responses for simple flashcards
     - `gemini-1.5-pro` - Higher quality with more nuanced understanding
     - `gemini-1.5-pro-vision` - Advanced image understanding capabilities
   - **New Gemini 2.0 Models** (see GEMINI-2-UPGRADE.md):
     - `gemini-2.0-pro` - Improved general purpose model
     - `gemini-2.0-pro-vision` - Enhanced image understanding
     - `gemini-2.0-ultra` - Premium model for highest quality

2. **Subject-Specific Prompting**:
   - Science-specific prompts
   - Mathematics-specific prompts
   - Humanities-specific prompts
   - Language learning prompts

3. **Enhanced Content Handling**:
   - Better text processing
   - Improved image analysis
   - Combined text-and-image flashcard generation

4. **Improved User Experience**:
   - Deck color selection with color picker
   - Better validation feedback
   - More detailed error handling
   - Enhanced UI components

## Troubleshooting

If you encounter issues:

1. **API key validation fails**:
   - Ensure you have access to the Gemini 1.5 models
   - Check for network connectivity issues
   - Verify API quota limits

2. **Image processing issues**:
   - Ensure images are < 4MB
   - Use clear, readable images
   - Try using the Pro Vision model specifically for image content

3. **Flashcard quality issues**:
   - Select the appropriate subject area
   - Provide clear, structured source text
   - Try adjusting the model (Pro generally gives better quality than Flash)

4. **API Error about "responseStyle"**:
   - Use the fixed implementations provided
   - Or manually remove the responseStyle parameter from your API requests
   - See the "Fix for Gemini API Error" section above

For any additional help, refer to the implementation code comments or contact the development team.