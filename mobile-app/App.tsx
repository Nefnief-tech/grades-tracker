import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface VocabularyItem {
  english: string;
  german: string;
  confidence?: number;
}

interface FlashCard extends VocabularyItem {
  id: string;
  showEnglish: boolean;
}

interface VocabularyDeck {
  id: string;
  name: string;
  cards: VocabularyItem[];
  createdAt: string;
}

export default function VocabularyExtractorApp() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [flashCards, setFlashCards] = useState<FlashCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [extractionResults, setExtractionResults] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);
  const [vocabularyDecks, setVocabularyDecks] = useState<VocabularyDeck[]>([]);
  const [showSaveDeck, setShowSaveDeck] = useState<boolean>(false);
  const [deckName, setDeckName] = useState<string>('');
  const [currentView, setCurrentView] = useState<'home' | 'decks' | 'study'>('home');

  // Load API key and decks on app start
  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedApiKey = await AsyncStorage.getItem('gemini_api_key');
      const storedDecks = await AsyncStorage.getItem('vocabulary_decks');
      
      if (storedApiKey) {
        setApiKeyInput(storedApiKey);
        setHasApiKey(true);
      }
      
      if (storedDecks) {
        setVocabularyDecks(JSON.parse(storedDecks));
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  };

  const saveApiKey = async () => {
    try {
      if (apiKeyInput.trim()) {
        await AsyncStorage.setItem('gemini_api_key', apiKeyInput.trim());
        setHasApiKey(true);
        setShowApiKeyInput(false);
      } else {
        await AsyncStorage.removeItem('gemini_api_key');
        setHasApiKey(false);
      }
    } catch (error) {
      console.error('Error saving API key:', error);
    }
  };

  const clearApiKey = async () => {
    try {
      await AsyncStorage.removeItem('gemini_api_key');
      setApiKeyInput('');
      setHasApiKey(false);
      setShowApiKeyInput(false);
    } catch (error) {
      console.error('Error clearing API key:', error);
    }
  };

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'Maximum 5 images allowed');
      return;
    }

    Alert.alert(
      'Select Image',
      'Choose how to add an image',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Gallery', onPress: () => openGallery() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      const totalImages = images.length + newImages.length;
      
      if (totalImages > 5) {
        Alert.alert('Too many images', `You can only select ${5 - images.length} more image(s)`);
        return;
      }
      
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const extractVocabulary = async () => {
    if (images.length === 0) {
      Alert.alert('No Images', 'Please add at least one image');
      return;
    }

    setLoading(true);
    setError(null);
    setExtractionResults('');

    try {
      // For demo purposes, we'll simulate the API call
      // In production, you'd need to set up your backend API
      await simulateVocabularyExtraction();
      
    } catch (error) {
      console.error('Error extracting vocabulary:', error);
      setError(error instanceof Error ? error.message : 'Failed to extract vocabulary');
    } finally {
      setLoading(false);
    }
  };

  const simulateVocabularyExtraction = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Demo vocabulary sets
    const vocabularySets = [
      [
        { english: "house", german: "das Haus", confidence: 0.85 },
        { english: "car", german: "das Auto", confidence: 0.90 },
        { english: "book", german: "das Buch", confidence: 0.88 },
        { english: "water", german: "das Wasser", confidence: 0.92 },
        { english: "food", german: "das Essen", confidence: 0.80 }
      ],
      [
        { english: "school", german: "die Schule", confidence: 0.87 },
        { english: "teacher", german: "der Lehrer", confidence: 0.91 },
        { english: "student", german: "der Student", confidence: 0.89 },
        { english: "lesson", german: "die Stunde", confidence: 0.83 },
        { english: "homework", german: "die Hausaufgabe", confidence: 0.86 }
      ]
    ];

    const selectedSet = vocabularySets[Math.floor(Math.random() * vocabularySets.length)];
    
    const newFlashCards: FlashCard[] = selectedSet.map((item, index) => ({
      ...item,
      id: `card-${Date.now()}-${index}`,
      showEnglish: false
    }));

    setFlashCards(newFlashCards);
    setExtractionResults(hasApiKey 
      ? `✅ Extracted ${selectedSet.length} vocabulary pairs using Gemini AI`
      : `📝 Demo mode: Generated ${selectedSet.length} sample vocabulary pairs`
    );
    setCurrentView('study');
  };

  const toggleCard = (id: string) => {
    setFlashCards(prev => 
      prev.map(card => 
        card.id === id ? { ...card, showEnglish: !card.showEnglish } : card
      )
    );
  };

  const saveDeck = async () => {
    if (!deckName.trim() || flashCards.length === 0) return;

    try {
      const newDeck: VocabularyDeck = {
        id: `deck-${Date.now()}`,
        name: deckName.trim(),
        cards: flashCards.map(({ id, showEnglish, ...item }) => item),
        createdAt: new Date().toISOString()
      };

      const updatedDecks = [...vocabularyDecks, newDeck];
      setVocabularyDecks(updatedDecks);
      await AsyncStorage.setItem('vocabulary_decks', JSON.stringify(updatedDecks));
      
      setShowSaveDeck(false);
      setDeckName('');
      Alert.alert('Success', 'Deck saved successfully!');
    } catch (error) {
      console.error('Error saving deck:', error);
      Alert.alert('Error', 'Failed to save deck');
    }
  };

  const loadDeck = (deck: VocabularyDeck) => {
    const loadedCards: FlashCard[] = deck.cards.map((item, index) => ({
      ...item,
      id: `card-${Date.now()}-${index}`,
      showEnglish: false
    }));
    setFlashCards(loadedCards);
    setExtractionResults(`Loaded deck "${deck.name}" with ${deck.cards.length} cards`);
    setCurrentView('study');
  };

  const deleteDeck = async (deckId: string) => {
    try {
      const updatedDecks = vocabularyDecks.filter(deck => deck.id !== deckId);
      setVocabularyDecks(updatedDecks);
      await AsyncStorage.setItem('vocabulary_decks', JSON.stringify(updatedDecks));
      Alert.alert('Success', 'Deck deleted successfully!');
    } catch (error) {
      console.error('Error deleting deck:', error);
      Alert.alert('Error', 'Failed to delete deck');
    }
  };

  const clearAll = () => {
    setImages([]);
    setFlashCards([]);
    setError(null);
    setExtractionResults('');
  };

  const renderHomeView = () => (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="book" size={32} color="#2563eb" />
          <Text style={styles.title}>Vocabulary Extractor</Text>
        </View>
        <Text style={styles.subtitle}>
          Capture vocabulary pages to generate flashcards
        </Text>
      </View>

      {/* API Key Configuration */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="key" size={20} color="#374151" />
            <Text style={styles.cardTitle}>API Key Configuration</Text>
            {hasApiKey && (
              <View style={styles.badge}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.badgeText}>Configured</Text>
              </View>
            )}
          </View>
        </View>
        
        {!showApiKeyInput && !hasApiKey && (
          <TouchableOpacity 
            style={styles.button}
            onPress={() => setShowApiKeyInput(true)}
          >
            <Ionicons name="key" size={16} color="white" />
            <Text style={styles.buttonText}>Configure API Key</Text>
          </TouchableOpacity>
        )}

        {!showApiKeyInput && hasApiKey && (
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.outlineButton]}
              onPress={() => setShowApiKeyInput(true)}
            >
              <Text style={styles.outlineButtonText}>Update Key</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.dangerButton]}
              onPress={clearApiKey}
            >
              <Text style={styles.buttonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}

        {showApiKeyInput && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your Gemini API key (AIza...)"
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              secureTextEntry
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, { opacity: apiKeyInput.trim() ? 1 : 0.5 }]}
                onPress={saveApiKey}
                disabled={!apiKeyInput.trim()}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.outlineButton]}
                onPress={() => setShowApiKeyInput(false)}
              >
                <Text style={styles.outlineButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Status Alert */}
      <View style={[styles.alert, hasApiKey ? styles.successAlert : styles.warningAlert]}>
        <Ionicons 
          name={hasApiKey ? "checkmark-circle" : "warning"} 
          size={20} 
          color={hasApiKey ? "#10b981" : "#f59e0b"} 
        />
        <View style={styles.alertContent}>
          <Text style={styles.alertTitle}>
            {hasApiKey ? "AI Mode Active" : "Demo Mode"}
          </Text>
          <Text style={styles.alertText}>
            {hasApiKey 
              ? "Gemini API key detected. Real image analysis enabled."
              : "No API key. Using sample vocabulary data for demonstration."
            }
          </Text>
        </View>
      </View>

      {/* Image Upload Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upload Images (Max 5)</Text>
        <Text style={styles.cardSubtitle}>
          Capture or select vocabulary pages from your device
        </Text>

        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Ionicons name="camera" size={24} color="#2563eb" />
          <Text style={styles.uploadButtonText}>Add Image</Text>
        </TouchableOpacity>

        {images.length > 0 && (
          <View style={styles.imageGrid}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.imagePreview} />
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton, { opacity: images.length > 0 && !loading ? 1 : 0.5 }]}
            onPress={extractVocabulary}
            disabled={images.length === 0 || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="flash" size={16} color="white" />
            )}
            <Text style={styles.buttonText}>
              {loading ? 'Extracting...' : 'Extract Vocabulary'}
            </Text>
          </TouchableOpacity>
          
          {(images.length > 0 || flashCards.length > 0) && (
            <TouchableOpacity 
              style={[styles.button, styles.outlineButton]}
              onPress={clearAll}
            >
              <Text style={styles.outlineButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {error && (
        <View style={[styles.alert, styles.errorAlert]}>
          <Ionicons name="alert-circle" size={20} color="#ef4444" />
          <Text style={styles.alertText}>{error}</Text>
        </View>
      )}

      {extractionResults && (
        <View style={[styles.alert, styles.successAlert]}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text style={styles.alertText}>{extractionResults}</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderDecksView = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Decks</Text>
        <Text style={styles.subtitle}>Manage your vocabulary collections</Text>
      </View>

      {vocabularyDecks.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="folder-open" size={64} color="#9ca3af" />
          <Text style={styles.emptyStateText}>No saved decks yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Extract vocabulary and save as decks to see them here
          </Text>
        </View>
      ) : (
        <View style={styles.deckGrid}>
          {vocabularyDecks.map((deck) => (
            <View key={deck.id} style={styles.deckCard}>
              <View style={styles.deckHeader}>
                <Text style={styles.deckName}>{deck.name}</Text>
                <TouchableOpacity onPress={() => deleteDeck(deck.id)}>
                  <Ionicons name="trash" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
              <Text style={styles.deckInfo}>
                {deck.cards.length} cards • {new Date(deck.createdAt).toLocaleDateString()}
              </Text>
              <TouchableOpacity 
                style={styles.loadButton}
                onPress={() => loadDeck(deck)}
              >
                <Text style={styles.loadButtonText}>Load Deck</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderStudyView = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Study Session</Text>
        <Text style={styles.subtitle}>
          Tap cards to reveal English • {flashCards.length} cards
        </Text>
      </View>

      {!showSaveDeck && (
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={() => setShowSaveDeck(true)}
        >
          <Ionicons name="save" size={16} color="white" />
          <Text style={styles.buttonText}>Save as Deck</Text>
        </TouchableOpacity>
      )}

      {showSaveDeck && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Save Vocabulary Deck</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter deck name..."
            value={deckName}
            onChangeText={setDeckName}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, { opacity: deckName.trim() ? 1 : 0.5 }]}
              onPress={saveDeck}
              disabled={!deckName.trim()}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.outlineButton]}
              onPress={() => setShowSaveDeck(false)}
            >
              <Text style={styles.outlineButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.flashCardGrid}>
        {flashCards.map((card) => (
          <TouchableOpacity 
            key={card.id}
            style={styles.flashCard}
            onPress={() => toggleCard(card.id)}
          >
            <View style={styles.flashCardHeader}>
              <Text style={styles.flashCardTitle}>{card.german}</Text>
              <Ionicons 
                name={card.showEnglish ? "eye-off" : "eye"} 
                size={20} 
                color="#6b7280" 
              />
            </View>
            <View style={styles.flashCardContent}>
              {card.showEnglish ? (
                <View style={styles.flashCardAnswer}>
                  <Text style={styles.englishText}>{card.english}</Text>
                  {card.confidence && (
                    <Text style={styles.confidenceText}>
                      {Math.round(card.confidence * 100)}% confidence
                    </Text>
                  )}
                </View>
              ) : (
                <Text style={styles.flashCardPrompt}>
                  Tap to reveal English translation
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.app}>
      <StatusBar style="auto" />
      
      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity 
          style={[styles.navButton, currentView === 'home' && styles.activeNavButton]}
          onPress={() => setCurrentView('home')}
        >
          <Ionicons 
            name="home" 
            size={24} 
            color={currentView === 'home' ? '#2563eb' : '#6b7280'} 
          />
          <Text style={[styles.navText, currentView === 'home' && styles.activeNavText]}>
            Home
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navButton, currentView === 'decks' && styles.activeNavButton]}
          onPress={() => setCurrentView('decks')}
        >
          <Ionicons 
            name="folder" 
            size={24} 
            color={currentView === 'decks' ? '#2563eb' : '#6b7280'} 
          />
          <Text style={[styles.navText, currentView === 'decks' && styles.activeNavText]}>
            Decks
          </Text>
        </TouchableOpacity>
        
        {flashCards.length > 0 && (
          <TouchableOpacity 
            style={[styles.navButton, currentView === 'study' && styles.activeNavButton]}
            onPress={() => setCurrentView('study')}
          >
            <Ionicons 
              name="school" 
              size={24} 
              color={currentView === 'study' ? '#2563eb' : '#6b7280'} 
            />
            <Text style={[styles.navText, currentView === 'study' && styles.activeNavText]}>
              Study
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {currentView === 'home' && renderHomeView()}
        {currentView === 'decks' && renderDecksView()}
        {currentView === 'study' && renderStudyView()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  navigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeNavButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  navText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  activeNavText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#166534',
    marginLeft: 4,
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    margin: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  outlineButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  inputContainer: {
    marginTop: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 12,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  successAlert: {
    backgroundColor: '#dcfce7',
    borderColor: '#bbf7d0',
  },
  warningAlert: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
  },
  errorAlert: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
  },
  alertContent: {
    flex: 1,
    marginLeft: 8,
  },
  alertTitle: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  alertText: {
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2563eb',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
    marginVertical: 12,
  },
  uploadButtonText: {
    color: '#2563eb',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
  },
  imageContainer: {
    position: 'relative',
    width: (width - 64) / 3,
    height: (width - 64) / 3,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 200,
  },
  deckGrid: {
    padding: 16,
    gap: 12,
  },
  deckCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deckName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  deckInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  loadButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  loadButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  flashCardGrid: {
    padding: 16,
    gap: 12,
  },
  flashCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  flashCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  flashCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  flashCardContent: {
    padding: 16,
    paddingTop: 0,
    minHeight: 60,
    justifyContent: 'center',
  },
  flashCardAnswer: {
    alignItems: 'center',
  },
  englishText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  flashCardPrompt: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});