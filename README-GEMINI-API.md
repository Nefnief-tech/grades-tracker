# Using the Real Gemini API with the Vocabulary Extractor

This document provides instructions on how to use the real Google Gemini API with the vocabulary extractor feature.

## Setup Instructions

### 1. Get a Gemini API Key

- Visit the [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create an account if you don't have one
- Generate an API key (it should start with "AI...")

### 2. Configure the System

There are three ways to enable real API usage:

#### Option A: Environment Variable (Server-side)

1. Create or modify the `.env.local` file in the project root:
   ```
   # Enable real API usage instead of demo data
   USE_REAL_GEMINI_API=true
   ```

2. Restart the application server

#### Option B: Force Real API Usage (Client-side)

1. Open the vocabulary extractor page
2. Enter your Gemini API key
3. Toggle the "Force Real API" switch to ON

#### Option C: API Header (Advanced)

When making direct API calls to the vocabulary extraction endpoint, include the header:
```
X-Force-Real-Api: true
```

### 3. Understanding the Modes

The vocabulary extractor can operate in several modes:

- **demo**: Using sample data (no API calls)
- **live-demo**: Using real API key but still serving sample data (environment variable off)
- **live**: Using the real Gemini API (sending actual requests)
- **fallback**: Attempted to use real API but failed, falling back to demo data

## Troubleshooting

### Common Issues

1. **API Key Invalid**: Ensure your key starts with "AI" and is the complete key
2. **Rate Limiting**: Gemini has rate limits for free tiers
3. **Content Restrictions**: Gemini has content policies that may restrict certain inputs
4. **404 Model Not Found Error**: The Gemini API has been updated with newer model names

### Solutions

- Try toggling the "Force Real API" switch off and on again
- Check the server logs for detailed error messages
- Ensure your API key has been saved correctly
- Try a simpler text input if complex content is failing

### Fixing the 404 "Model Not Found" Error

If you see a 404 error mentioning "models/gemini-pro is not found for API version v1beta", this indicates that the Gemini API model names have changed. To fix this:

1. Update the model name in the code:
   - Open `app/api/vocabulary/extract/route.ts`
   - Find the line with `model: "gemini-pro"`
   - Try one of these alternatives:
     ```javascript
     model: "gemini-1.0-pro"  // Newer version
     // or
     model: "gemini-1.5-pro"  // Latest version
     ```

2. Verify API version:
   - Google has been updating their API from v1beta to more stable versions
   - Make sure your @google/generative-ai package is up to date:
     ```bash
     npm install @google/generative-ai@latest
     ```

3. Check Official Documentation:
   - Visit [Google AI documentation](https://ai.google.dev/) for the latest model names
   - Look at their examples to ensure you're using the correct API format

## Working with File Extraction

When extracting vocabulary from files:

1. The file is processed on the server
2. For image processing, Gemini multimodal capabilities are used
3. Text is extracted and formatted into vocabulary items
4. If extraction fails, the system will fall back to demo data

## Technical Details

- The client sends either text or file data to the API endpoint
- The server validates the Gemini API key
- Based on configuration, it either:
  - Returns sample data (demo mode)
  - Makes a real API call (live mode)
- The response is formatted and returned to the client

## Support

If you encounter issues using the real Gemini API:

- Check for any error messages in the browser console
- Look at the server logs for API response details
- Try enabling demo mode to ensure the rest of the system is working
- Contact the system administrator if problems persist