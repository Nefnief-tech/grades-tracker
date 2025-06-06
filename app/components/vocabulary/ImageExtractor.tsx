import React, { useState, useRef } from 'react';
import { Button, Box, Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CloudUpload, Image, Photo, Check } from '@mui/icons-material';
import { useSettings } from '@/app/hooks/useSettings';

// Styled components
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const ImagePreview = styled('img')({
  maxWidth: '100%',
  maxHeight: '300px',
  objectFit: 'contain',
  marginTop: '16px',
  borderRadius: '4px',
});

const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

interface ImageExtractorProps {
  onExtracted: (vocabulary: any[]) => void;
  apiKey: string;
  disabled?: boolean;
  demoMode?: boolean;
}

const ImageExtractor: React.FC<ImageExtractorProps> = ({ 
  onExtracted,
  apiKey,
  disabled = false,
  demoMode = false
}) => {
  // State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get settings for the Force Real API flag
  const { settings } = useSettings();
  
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
    fileInputRef.current?.click();
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
      
      // Add force real API header if enabled in settings
      if (settings.forceRealApi) {
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
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <Photo sx={{ mr: 1, verticalAlign: 'middle' }} />
          Extract Vocabulary from Images
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Upload an image containing text to extract vocabulary. Works best with clear text in German, Spanish, French or other languages.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {!selectedImage ? (
          <UploadBox 
            onClick={handleDropZoneClick}
            sx={{ mb: 2 }}
          >
            <CloudUpload fontSize="large" color="primary" />
            <Typography variant="body1" sx={{ mt: 1 }}>
              Click to select an image file
            </Typography>
            <Typography variant="body2" color="text.secondary">
              JPG, PNG or GIF up to 5MB
            </Typography>
            <VisuallyHiddenInput
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              disabled={disabled || loading}
            />
          </UploadBox>
        ) : (
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <ImagePreview src={imagePreview || ''} alt="Selected image" />
              {selectedImage && (
                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                  {selectedImage.name} ({Math.round(selectedImage.size / 1024)} KB)
                </Typography>
              )}
            </Box>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleReset}
            disabled={!selectedImage || loading}
          >
            Reset
          </Button>
          
          <Button 
            variant="contained" 
            onClick={handleExtract}
            disabled={!selectedImage || loading || (disabled && !demoMode)}
            startIcon={loading ? <CircularProgress size={20} /> : <Check />}
          >
            {loading ? 'Extracting...' : 'Extract Vocabulary'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ImageExtractor;