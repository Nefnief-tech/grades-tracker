import VocabularyExtractor from '@/app/components/vocabulary/VocabularyExtractor';
import WordList from '@/app/components/vocabulary/WordList';
import SimpleImageExtractor from '@/app/components/vocabulary/SimpleImageExtractor';
import React, { useState, useEffect } from 'react';

export default function VocabularyPage() {
  // State to hold the list of extracted vocabulary
  const [vocabulary, setVocabulary] = useState<Array<{ term: string, definition: string }>>([]);
  // State for API key
  const [apiKey, setApiKey] = useState<string>('');
  // State for demo mode
  const [demoMode, setDemoMode] = useState<boolean>(false);
  // State for force real API mode
  const [forceRealApi, setForceRealApi] = useState<boolean>(false);
  // State to track extraction source
  const [extractionSource, setExtractionSource] = useState<string>('text');

  // Load settings from localStorage when component mounts
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('vocabularyExtractorSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setDemoMode(settings.demoMode || false);
        setForceRealApi(settings.forceRealApi || false);
      }
      
      // Try to load saved API key
      const savedApiKey = localStorage.getItem('geminiApiKey');
      if (savedApiKey) {
        setApiKey(savedApiKey);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('vocabularyExtractorSettings', JSON.stringify({
        demoMode,
        forceRealApi,
      }));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [demoMode, forceRealApi]);

  // Handler for when API key changes
  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    try {
      localStorage.setItem('geminiApiKey', newApiKey);
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  };

  // Handler for when demo mode changes
  const handleDemoModeChange = (newDemoMode: boolean) => {
    setDemoMode(newDemoMode);
  };

  // Handler for when force real API changes
  const handleForceRealApiChange = (newForceRealApi: boolean) => {
    setForceRealApi(newForceRealApi);
  };

  // Handler for when new vocabulary is extracted
  const handleVocabularyExtracted = (words: Array<{ term: string, definition: string }>, source: string = 'text') => {
    setVocabulary(words);
    setExtractionSource(source);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Vocabulary Extractor</h1>
      
      {/* Settings panel */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="demoMode"
              checked={demoMode}
              onChange={(e) => handleDemoModeChange(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="demoMode" className="text-sm">Demo Mode</label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="forceRealApi"
              checked={forceRealApi}
              onChange={(e) => handleForceRealApiChange(e.target.checked)}
              disabled={demoMode}
              className="mr-2"
            />
            <label 
              htmlFor="forceRealApi" 
              className={`text-sm ${demoMode ? 'text-gray-400' : ''}`}
            >
              Force Real API
            </label>
          </div>
          
          {!demoMode && (
            <div className="flex-grow">
              <label htmlFor="apiKey" className="block text-sm mb-1">
                Gemini API Key:
              </label>
              <input
                type="text"
                id="apiKey"
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                className="w-full p-1 border rounded text-sm"
                placeholder="Enter your Gemini API key"
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/2">
          <div className="border rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold mb-2">Extract from Text</h2>
            <VocabularyExtractor 
              onExtracted={(words) => handleVocabularyExtracted(words, 'text')} 
              apiKey={apiKey}
              demoMode={demoMode}
              forceRealApi={forceRealApi}
            />
          </div>
        </div>
        
        <div className="w-full md:w-1/2">
          <div className="border rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold mb-2">Extract from Images</h2>
            <SimpleImageExtractor 
              onExtracted={(words) => handleVocabularyExtracted(words, 'image')} 
              apiKey={apiKey}
              disabled={!apiKey && !demoMode}
              demoMode={demoMode}
              forceRealApi={forceRealApi}
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Extracted Words 
          {vocabulary.length > 0 && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              (from {extractionSource})
            </span>
          )}
        </h2>
        <WordList vocabulary={vocabulary} />
      </div>
    </div>
  );
}