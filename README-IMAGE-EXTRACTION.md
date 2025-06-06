# Image-Based Vocabulary Extraction

This feature allows you to extract vocabulary from images containing text in foreign languages.

## How It Works

The image extraction feature uses the Gemini Pro Vision API to analyze images and extract vocabulary words. It can:

1. Detect text in images
2. Identify the language of the text
3. Extract vocabulary words and their meanings
4. Format the data as term-definition pairs

## Usage

### From the UI

1. Navigate to the Vocabulary Extractor page
2. Select the "Extract from Images" tab
3. Upload an image containing text (JPEG, PNG, GIF, etc.)
4. Click "Extract Vocabulary"
5. View the extracted vocabulary below

### API Endpoint

You can also use the dedicated API endpoint for image extraction:

```
POST /api/vocabulary/extract-image
```

#### Request Headers:
- `X-Gemini-API-Key`: Your Gemini API key
- `X-Demo-Mode`: Set to "true" to use demo mode (no API key needed)
- `X-Force-Real-Api`: Set to "true" to force real API usage
- `X-Request-Id`: Optional unique ID for request tracking

#### Request Body:
- `image`: The image file (multipart form data)
- `targetLanguage`: Target language for translations (default: "English")

#### Response:
```json
{
  "success": true,
  "vocabulary": [
    { "term": "der Hund", "definition": "dog" },
    { "term": "die Katze", "definition": "cat" }
  ],
  "apiStatus": "connected",
  "mode": "live", // or "demo" or "fallback"
  "meta": {
    "requestId": "unique-request-id",
    "source": "image",
    "extractionStats": { /* image details */ },
    "timestamp": "2023-05-27T13:57:35.794Z",
    "itemCount": 2,
    "processingTime": "1234ms"
  }
}
```

## Best Practices

For best results:

1. Use images with clear, legible text
2. Ensure good lighting and contrast in the image
3. Try to capture text straight-on, not at an angle
4. Images with 10-20 vocabulary words work best
5. Images under 5MB process faster

## Supported Languages

The image extraction works best with these languages:

- German
- Spanish
- French
- Italian
- Portuguese
- Russian
- Dutch
- Chinese (Simplified)
- Japanese
- Korean

Other languages may work but with reduced accuracy.

## Troubleshooting

If you encounter issues:

1. **Empty Results**: If no vocabulary is extracted, try a clearer image with better lighting
2. **API Errors**: Check your API key and make sure you have access to Gemini Pro Vision
3. **Slow Response**: Large images take longer to process; try resizing to under 2MB
4. **Incorrect Translations**: The API makes its best guess; manually edit results as needed

## Privacy Note

Images are only processed for vocabulary extraction and are not stored on our servers. However, they are sent to the Google Gemini API for processing according to their [privacy policy](https://ai.google.dev/privacy).