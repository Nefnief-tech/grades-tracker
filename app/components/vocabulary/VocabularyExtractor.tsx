import React, { useState } from 'react';

interface VocabularyExtractorProps {
  onExtracted: (vocabulary: Array<{ term: string, definition: string }>, source?: string) => void;
  apiKey?: string;
  demoMode?: boolean;
  forceRealApi?: boolean;
}

const VocabularyExtractor: React.FC<VocabularyExtractorProps> = ({
  onExtracted,
  apiKey,
  demoMode = false,
  forceRealApi = false
}) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }
    
    if (!apiKey && !demoMode) {
      setError('Please enter your Gemini API key');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Set up headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (demoMode) {
        headers['X-Demo-Mode'] = 'true';
      } else {
        headers['X-Gemini-API-Key'] = apiKey || '';
      }
      
      // Add force real API header if enabled
      if (forceRealApi) {
        headers['X-Force-Real-Api'] = 'true';
      }
      
      // Request a unique ID for tracking
      headers['X-Request-Id'] = crypto.randomUUID();
      
      // Call the API
      const response = await fetch('/api/vocabulary/extract', {
        method: 'POST',
        headers,
        body: JSON.stringify({ text }),
      });
      
      // Parse the response
      const data = await response.json();
      
      if (data.success) {
        onExtracted(data.vocabulary, 'text');
      } else {
        setError(data.details || data.error || 'Failed to extract vocabulary');
      }
    } catch (err) {
      console.error('Error extracting vocabulary:', err);
      setError('An error occurred while extracting vocabulary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="text" className="block mb-2 text-sm">
            Enter text (German, Spanish, etc.):
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 border rounded h-32"
            placeholder="Paste text in a foreign language here..."
          />
        </div>
        
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          disabled={loading || (!apiKey && !demoMode)}
        >
          {loading ? 'Extracting...' : 'Extract Vocabulary'}
        </button>
      </form>
    </div>
  );
};

export default VocabularyExtractor;