import React, { useState, useRef } from 'react';

interface ImageExtractorProps {
  onExtracted: (vocabulary: any[]) => void;
  apiKey: string;
  disabled?: boolean;
  demoMode?: boolean;
  forceRealApi?: boolean;
}

const SimpleImageExtractor: React.FC<ImageExtractorProps> = ({ 
  onExtracted,
  apiKey,
  disabled = false,
  demoMode = false,
  forceRealApi = false
}) => {
  // State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, etc.)');
        return;
      }
      
      // Clear any previous errors
      setError(null);
      
      // Update state with the selected file
      setSelectedImage(file);
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };
  
  // Handle drop zone click
  const handleDropZoneClick = () => {
    if (!disabled && !loading) {
      fileInputRef.current?.click();
    }
  };
  
  // Handle extract button click
  const handleExtract = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }
    
    if (!apiKey && !demoMode) {
      setError('Please enter your Gemini API key');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create form data with the image
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('targetLanguage', 'English'); // Default target language
      
      // Set up headers
      const headers: Record<string, string> = {};
      
      if (demoMode) {
        headers['X-Demo-Mode'] = 'true';
      } else {
        headers['X-Gemini-API-Key'] = apiKey;
      }
      
      // Add force real API header if enabled
      if (forceRealApi) {
        headers['X-Force-Real-Api'] = 'true';
      }
      
      // Request a unique ID for tracking
      headers['X-Request-Id'] = crypto.randomUUID();
      
      // Call the API
      const response = await fetch('/api/vocabulary/extract-image', {
        method: 'POST',
        headers,
        body: formData,
      });
      
      // Parse the response
      const data = await response.json();
      
      if (data.success) {
        onExtracted(data.vocabulary);
      } else {
        setError(data.details || data.error || 'Failed to extract vocabulary');
      }
    } catch (err) {
      console.error('Error extracting vocabulary from image:', err);
      setError('Failed to process the image. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Reset the form
  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="image-extractor">
      <h3 className="text-lg font-medium mb-2">Extract Vocabulary from Images</h3>
      
      <p className="text-sm mb-4 text-gray-600">
        Upload an image containing text to extract vocabulary. Works best with clear text in German, Spanish, French or other languages.
      </p>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!selectedImage ? (
        <div 
          className="border-2 border-dashed border-blue-500 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 mb-4"
          onClick={handleDropZoneClick}
        >
          <svg className="mx-auto h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="mt-2">Click to select an image file</p>
          <p className="text-xs text-gray-500">JPG, PNG or GIF up to 5MB</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            disabled={disabled || loading}
            className="hidden"
          />
        </div>
      ) : (
        <div className="text-center mb-4">
          <div className="inline-block">
            <img 
              src={imagePreview || ''} 
              alt="Selected image" 
              className="max-w-full max-h-64 object-contain rounded"
            />
            {selectedImage && (
              <p className="text-xs mt-1 text-gray-600">
                {selectedImage.name} ({Math.round(selectedImage.size / 1024)} KB)
              </p>
            )}
          </div>
        </div>
      )}
      
      <div className="flex justify-between mt-4">
        <button 
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={handleReset}
          disabled={!selectedImage || loading}
        >
          Reset
        </button>
        
        <button 
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={handleExtract}
          disabled={!selectedImage || loading || (disabled && !demoMode)}
        >
          {loading ? 'Extracting...' : 'Extract Vocabulary'}
        </button>
      </div>
    </div>
  );
};

export default SimpleImageExtractor;