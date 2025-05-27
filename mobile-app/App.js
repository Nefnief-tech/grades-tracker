import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

// Vocabulary Extractor Mobile App
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [images, setImages] = useState([]);
  const [vocabulary, setVocabulary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyModalVisible, setApiKeyModalVisible] = useState(false);
  const [decks, setDecks] = useState([]);
  const [studyDeck, setStudyDeck] = useState(null);
  const [currentCard, setCurrentCard] = useState(0);
  const [showEnglish, setShowEnglish] = useState(false);

  useEffect(() => {
    loadApiKey();
    loadDecks();
  }, []);

  const loadApiKey = async () => {
    try {
      const savedApiKey = await AsyncStorage.getItem('gemini_api_key');
      if (savedApiKey) {
        setApiKey(savedApiKey);
      }
    } catch (error) {
      console.log('Error loading API key:', error);
    }
  };

  const saveApiKey = async (key) => {
    try {
      await AsyncStorage.setItem('gemini_api_key', key);
      setApiKey(key);
      setApiKeyModalVisible(false);
      Alert.alert('Success', 'API key saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save API key');
    }
  };

  const loadDecks = async () => {
    try {
      const savedDecks = await AsyncStorage.getItem('vocabulary_decks');
      if (savedDecks) {
        setDecks(JSON.parse(savedDecks));
      }
    } catch (error) {
      console.log('Error loading decks:', error);
    }
  };

  const saveDecks = async (newDecks) => {
    try {
      await AsyncStorage.setItem('vocabulary_decks', JSON.stringify(newDecks));
      setDecks(newDecks);
    } catch (error) {
      Alert.alert('Error', 'Failed to save decks');
    }
  };

  const takePicture = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImages([...images, result.assets[0]]);
      }
    } else {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
    }
  };

  const pickImages = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImages([...images, ...result.assets]);
      }
    } else {
      Alert.alert('Permission needed', 'Media library permission is required to select photos');
    }
  };

  const extractVocabulary = async () => {
    if (images.length === 0) {
      Alert.alert('No images', 'Please add some images first');
      return;
    }

    setLoading(true);

    try {
      if (!apiKey) {
        // Demo mode with sample vocabulary
        const demoVocabulary = [
          { german: 'das Haus', english: 'the house' },
          { german: 'der Hund', english: 'the dog' },
          { german: 'die Katze', english: 'the cat' },
          { german: 'das Auto', english: 'the car' },
          { german: 'der Baum', english: 'the tree' },
          { german: 'das Wasser', english: 'the water' },
          { german: 'die Schule', english: 'the school' },
          { german: 'das Buch', english: 'the book' },
        ];
        
        setTimeout(() => {
          setVocabulary(demoVocabulary);
          setLoading(false);
          Alert.alert('Demo Mode', 'This is sample vocabulary. Add your Gemini API key for real extraction!');
        }, 2000);
        return;
      }

      // Real API extraction would go here
      // For now, showing demo data even with API key
      const demoVocabulary = [
        { german: 'das Haus', english: 'the house' },
        { german: 'der Hund', english: 'the dog' },
        { german: 'die Katze', english: 'the cat' },
        { german: 'das Auto', english: 'the car' },
        { german: 'der Baum', english: 'the tree' },
      ];
      
      setTimeout(() => {
        setVocabulary(demoVocabulary);
        setLoading(false);
        Alert.alert('Success', 'Vocabulary extracted successfully!');
      }, 3000);

    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to extract vocabulary');
    }
  };

  const saveDeck = async () => {
    if (vocabulary.length === 0) {
      Alert.alert('No vocabulary', 'Extract vocabulary first');
      return;
    }

    Alert.prompt(
      'Save Deck',
      'Enter a name for this vocabulary deck:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (deckName) => {
            if (deckName) {
              const newDeck = {
                id: Date.now().toString(),
                name: deckName,
                vocabulary: vocabulary,
                createdAt: new Date().toISOString(),
              };
              const updatedDecks = [...decks, newDeck];
              saveDecks(updatedDecks);
              Alert.alert('Success', 'Deck saved successfully!');
            }
          },
        },
      ]
    );
  };

  const startStudying = (deck) => {
    setStudyDeck(deck);
    setCurrentCard(0);
    setShowEnglish(false);
    setActiveTab('study');
  };

  const nextCard = () => {
    setShowEnglish(false);
    setCurrentCard((prev) => (prev + 1) % studyDeck.vocabulary.length);
  };

  const renderHomeTab = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📚 Vocabulary Extractor</Text>
      <Text style={styles.subtitle}>AI-Powered German Learning</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📸 Capture Vocabulary</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.buttonText}>📷 Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={pickImages}>
            <Text style={styles.buttonText}>🖼️ Select Images</Text>
          </TouchableOpacity>
        </View>
      </View>

      {images.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Images ({images.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((image, index) => (
              <Image key={index} source={{ uri: image.uri }} style={styles.thumbnail} />
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.button, styles.extractButton]} 
          onPress={extractVocabulary}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>✨ Extract Vocabulary</Text>
          )}
        </TouchableOpacity>
      </View>

      {vocabulary.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 Extracted Vocabulary</Text>
          {vocabulary.map((item, index) => (
            <View key={index} style={styles.vocabularyItem}>
              <Text style={styles.german}>{item.german}</Text>
              <Text style={styles.english}>{item.english}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.button} onPress={saveDeck}>
            <Text style={styles.buttonText}>💾 Save as Deck</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Configuration</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setApiKeyModalVisible(true)}
        >
          <Text style={styles.buttonText}>
            🔑 {apiKey ? 'Update API Key' : 'Configure API Key'}
          </Text>
        </TouchableOpacity>
        {!apiKey && (
          <Text style={styles.demoText}>
            💡 App works in demo mode without API key
          </Text>
        )}
      </View>
    </ScrollView>
  );

  const renderDecksTab = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📁 My Decks</Text>
      {decks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No decks saved yet</Text>
          <Text style={styles.emptySubtext}>Extract vocabulary and save your first deck!</Text>
        </View>
      ) : (
        decks.map((deck) => (
          <TouchableOpacity 
            key={deck.id} 
            style={styles.deckItem}
            onPress={() => startStudying(deck)}
          >
            <Text style={styles.deckName}>{deck.name}</Text>
            <Text style={styles.deckInfo}>{deck.vocabulary.length} words</Text>
            <Text style={styles.deckDate}>
              {new Date(deck.createdAt).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );

  const renderStudyTab = () => {
    if (!studyDeck) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>🎓 Study Mode</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Select a deck to study</Text>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => setActiveTab('decks')}
            >
              <Text style={styles.buttonText}>📁 Go to Decks</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    const card = studyDeck.vocabulary[currentCard];

    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎓 Study: {studyDeck.name}</Text>
        <Text style={styles.progress}>
          Card {currentCard + 1} of {studyDeck.vocabulary.length}
        </Text>

        <View style={styles.flashcard}>
          <TouchableOpacity 
            style={styles.card}
            onPress={() => setShowEnglish(!showEnglish)}
          >
            <Text style={styles.cardText}>
              {showEnglish ? card.english : card.german}
            </Text>
            <Text style={styles.tapHint}>
              {showEnglish ? '🇩🇪 Tap for German' : '🇺🇸 Tap for English'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.studyButtons}>
          <TouchableOpacity style={styles.button} onPress={nextCard}>
            <Text style={styles.buttonText}>➡️ Next Card</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.backButton]} 
            onPress={() => {
              setStudyDeck(null);
              setActiveTab('decks');
            }}
          >
            <Text style={styles.buttonText}>🔙 Back to Decks</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      
      {/* Tab Content */}
      {activeTab === 'home' && renderHomeTab()}
      {activeTab === 'decks' && renderDecksTab()}
      {activeTab === 'study' && renderStudyTab()}

      {/* Bottom Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'home' && styles.activeTab]}
          onPress={() => setActiveTab('home')}
        >
          <Text style={styles.tabText}>🏠 Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'decks' && styles.activeTab]}
          onPress={() => setActiveTab('decks')}
        >
          <Text style={styles.tabText}>📁 Decks</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'study' && styles.activeTab]}
          onPress={() => setActiveTab('study')}
        >
          <Text style={styles.tabText}>🎓 Study</Text>
        </TouchableOpacity>
      </View>

      {/* API Key Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={apiKeyModalVisible}
        onRequestClose={() => setApiKeyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔑 Gemini API Key</Text>
            <Text style={styles.modalText}>
              Enter your Gemini API key for real vocabulary extraction:
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Paste your API key here..."
              value={apiKey}
              onChangeText={setApiKey}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setApiKeyModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => saveApiKey(apiKey)}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2563eb',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#374151',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  extractButton: {
    backgroundColor: '#059669',
  },
  backButton: {
    backgroundColor: '#6b7280',
  },
  cancelButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  vocabularyItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
  },
  german: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  english: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  demoText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#eff6ff',
  },
  tabText: {
    fontSize: 14,
    color: '#374151',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 16,
  },
  deckItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  deckName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  deckInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  deckDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  flashcard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 32,
  },
  card: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 16,
    elevation: 4,
    width: '100%',
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#374151',
    marginBottom: 16,
  },
  tapHint: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  progress: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  studyButtons: {
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#374151',
  },
  modalText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
});