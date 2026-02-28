#!/bin/bash

# Vocabulary Extractor Mobile App Setup Script

echo "🚀 Setting up Vocabulary Extractor Mobile App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Navigate to mobile app directory
cd "$(dirname "$0")"

echo "📦 Installing dependencies..."
npm install

# Check if Expo CLI is installed globally
if ! command -v expo &> /dev/null; then
    echo "📱 Installing Expo CLI globally..."
    npm install -g @expo/cli
fi

echo "✅ Expo CLI found: $(expo --version)"

echo ""
echo "🎉 Setup complete! Your Vocabulary Extractor mobile app is ready!"
echo ""
echo "📱 To start developing:"
echo "   1. cd mobile-app"
echo "   2. npm start"
echo "   3. Use Expo Go app on your phone to scan the QR code"
echo ""
echo "🔧 To run on Android emulator:"
echo "   npm run android"
echo ""
echo "🍎 To run on iOS simulator (Mac only):"
echo "   npm run ios"
echo ""
echo "📚 Features included:"
echo "   ✓ Camera integration for capturing vocabulary pages"
echo "   ✓ AI-powered vocabulary extraction with Gemini"
echo "   ✓ Demo mode with sample data"
echo "   ✓ Deck management and offline storage"
echo "   ✓ Interactive flashcard study mode"
echo "   ✓ Cross-platform (Android & iOS)"
echo ""
echo "🔑 Don't forget to configure your Gemini API key in the app!"
echo "   Get one free at: https://makersuite.google.com/app/apikey"