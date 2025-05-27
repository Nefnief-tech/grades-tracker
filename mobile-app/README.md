# Android Vocabulary Extractor App

This is the mobile version of the Vocabulary Extractor built with React Native and Expo.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- For Android: Android Studio and Android SDK
- For iOS: Xcode (Mac only)

### Installation

1. Navigate to the mobile app directory:
```bash
cd mobile-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on Android:
```bash
npm run android
```

### 📱 App Features

- **Camera Integration**: Take photos of vocabulary pages directly in the app
- **Gallery Access**: Select multiple images from device gallery
- **AI-Powered Extraction**: Uses Gemini AI to extract vocabulary (with API key)
- **Demo Mode**: Works without API key using sample data
- **Deck Management**: Save and organize vocabulary into named decks
- **Study Mode**: Interactive flashcards with German → English learning
- **Offline Storage**: All data stored locally on device
- **Cross-Platform**: Works on both Android and iOS

### 🔧 Configuration

#### Gemini API Key
1. Get your free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. In the app, go to "Configure API Key"
3. Enter your key and save
4. The app will now use real AI for vocabulary extraction

#### Permissions
The app requires the following permissions:
- **Camera**: To take photos of vocabulary pages
- **Photo Library**: To select images from gallery
- **Storage**: To save extracted vocabulary locally

### 🏗️ Project Structure

```
mobile-app/
├── App.tsx                 # Main app component
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── babel.config.js        # Babel configuration
├── tsconfig.json         # TypeScript configuration
└── assets/               # App icons and splash screen
```

### 🔄 Data Flow

1. **Image Capture**: User takes photo or selects from gallery
2. **Processing**: Images sent to Gemini AI API (or demo mode)
3. **Extraction**: Vocabulary pairs extracted and displayed as flashcards
4. **Study**: User studies German → English with tap-to-reveal
5. **Save**: Vocabulary saved as named decks for future study

### 📦 Building for Production

#### Android APK
```bash
eas build --platform android
```

#### iOS App
```bash
eas build --platform ios
```

**Note**: You'll need to install EAS CLI and configure your build:
```bash
npm install -g eas-cli
eas build:configure
```

### 🎨 Customization

The app uses a clean, modern design with:
- Material Design principles
- Intuitive navigation
- Responsive layouts
- Dark/light theme support
- Accessibility features

### 🐛 Troubleshooting

**Common Issues:**

1. **Camera not working**: Check permissions in device settings
2. **API errors**: Verify your Gemini API key is correct
3. **Build issues**: Clear Expo cache with `expo r -c`

**Getting Help:**
- Check Expo documentation: https://docs.expo.dev/
- React Native docs: https://reactnative.dev/docs/getting-started

### 🌟 Future Enhancements

- Offline AI processing
- Advanced image preprocessing
- Cloud sync between devices
- Additional language pairs
- Speech recognition
- Progress tracking and analytics