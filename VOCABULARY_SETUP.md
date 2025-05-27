# Vocabulary Extractor Setup

## Overview
The Vocabulary Extractor is a new feature that allows students to upload images of vocabulary pages from textbooks and automatically generate digital flashcards.

## Features
- Upload up to 5 images at once
- Automatic vocabulary extraction using AI
- Interactive flashcards with click-to-reveal functionality
- Export functionality to JSON format
- Demo mode with sample vocabulary

## Setup Instructions

### 1. Install Dependencies (Optional - for Gemini AI)
For real image analysis capabilities, install the Google Generative AI package:

```bash
npm install @google/generative-ai
```

### 2. Get Gemini API Key (Optional)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file:

```env
GEMINI_API_KEY=your_api_key_here
```

### 3. Demo Mode
Without the API key and package, the system runs in demo mode with sample vocabulary data. This allows you to test the interface and functionality.

## Usage
1. Navigate to `/vocabulary` in your application
2. Upload clear images of vocabulary pages (works best with English-German pairs)
3. Click "Extract Vocabulary" to process the images
4. Use the generated flashcards for studying
5. Export your vocabulary sets as JSON files

## File Structure
- `/app/vocabulary/page.tsx` - Main vocabulary extractor interface
- `/app/api/vocabulary/extract/route.ts` - API endpoint for processing images
- Environment variable: `GEMINI_API_KEY` for real AI processing

## Navigation
Add this link to your navigation component to access the vocabulary extractor:

```tsx
<Link href="/vocabulary" className="nav-link-class">
  <BookOpen className="h-4 w-4" />
  <span>Vocabulary</span>
</Link>
```

## Technical Details
- **Image Processing**: Base64 conversion for API transmission
- **AI Integration**: Gemini 1.5 Flash model for image analysis
- **Fallback System**: Demo vocabulary when AI is unavailable
- **Deduplication**: Automatic removal of duplicate vocabulary entries
- **File Support**: All common image formats (JPEG, PNG, WebP, etc.)

## Future Enhancements
- OCR-only mode using Tesseract.js
- Support for other language pairs
- Integration with spaced repetition algorithms
- Batch processing for multiple vocabulary sets
- Study progress tracking