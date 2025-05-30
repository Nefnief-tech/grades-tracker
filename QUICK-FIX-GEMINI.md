# Quick Fix: Gemini API 404 Model Not Found Error

If you're seeing this error:
```
[uuid] Gemini API call failed: Error: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent: [404 Not Found] models/gemini-pro is not found for API version v1beta, or is not supported for generateContent.
```

This is because Google has updated their Gemini API and the model name has changed. Here's how to fix it:

## Immediate Solution

1. Create a `.env.local` file in the project root:

```
# Disable real API usage temporarily
USE_REAL_GEMINI_API=false
```

2. This will force the system to use sample data for now

## Permanent Fix (for developers)

1. Update the model name in `app\api\vocabulary\extract\route.ts`:

Find this code:
```javascript
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
```

Replace with:
```javascript
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
```

2. Update the @google/generative-ai package:

```bash
npm install @google/generative-ai@latest
```

3. After making these changes, try enabling real API usage again:

```
# In .env.local
USE_REAL_GEMINI_API=true
```

## Testing Your Fix

1. Go to the vocabulary extractor page
2. Turn off "Demo Mode"
3. Turn on "Force Real API" 
4. Add your API key
5. Try extracting vocabulary from a simple text
6. Check server logs to confirm API calls are working

## Need More Help?

If you continue experiencing issues, please contact support and include the full error logs from the server console.