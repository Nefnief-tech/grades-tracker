# 📱 Android App Setup Guide

## Step-by-Step Instructions to Get Your Vocabulary Extractor Android App Running

### 🎯 Option 1: Quick Testing with Expo Go (Recommended for Development)

This is the fastest way to test your app - **no Android Studio or Java setup required**:

1. **Install Expo Go on your Android phone**
   - Download from Google Play Store: [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Setup the project**
   ```bash
   cd mobile-app
   npm run reset-assets
   npm start
   ```
   
   This will:
   - Create required PNG assets that work properly
   - Install all dependencies  
   - Start the development server

3. **Connect your phone**
   - Make sure your phone and computer are on the same WiFi network
   - Scan the QR code that appears in your terminal with Expo Go
   - Your app will load directly on your phone!

**✅ This bypasses all Java version issues and gets your app running immediately!**

### 🏗️ Option 2: Build Native Android APK (Advanced)

For a standalone APK that doesn't require Expo Go (requires Java setup):

**⚠️ Note: You may need to fix Java version compatibility first. See JAVA_FIX.md**

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure build**
   ```bash
   cd mobile-app
   eas build:configure
   ```

4. **Build APK (cloud-based - recommended)**
   ```bash
   eas build --platform android
   ```

   This builds in the cloud and avoids local Java/Android setup issues!

### 🔧 Troubleshooting Setup Issues

**If you get Java version errors (like "Unsupported class file major version 66"):**

👉 **Use Expo Go instead** - it bypasses all Java setup issues:
```bash
cd mobile-app
npm run reset-assets
npm start
# Then use Expo Go app to scan QR code
```

**If you get CRC error or config sync errors:**

1. **Clean and recreate assets**
   ```bash
   cd mobile-app
   npm run reset-assets
   ```
   
   ⚠️ **Important:** Use `npm run reset-assets` (not `node reset-assets.js`)

2. **Clear Expo cache**
   ```bash
   expo r -c
   ```

3. **Reinstall dependencies**
   ```bash
   rm -rf node_modules
   npm install
   ```

4. **Try Expo Go development (recommended)**
   ```bash
   npm start
   ```

**For Java version fixes, see:** `JAVA_FIX.md`

**If build fails:**

1. **Check your app.json is clean** (no missing asset references)
2. **Ensure all required permissions are listed**
3. **Try development build first**
   ```bash
   eas build --platform android --profile development
   ```

### 📱 Testing Your App

Once running, you can test all features:

✅ **Camera Integration**: Take photos of vocabulary pages  
✅ **Gallery Access**: Select images from your phone  
✅ **Demo Mode**: Works without API key  
✅ **AI Mode**: Configure Gemini API key for real extraction  
✅ **Deck Management**: Save and load vocabulary decks  
✅ **Study Mode**: Practice with German → English flashcards  

### 🔑 Adding Your Gemini API Key

1. Open the app
2. Go to "Configure API Key" section
3. Enter your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
4. Save and start extracting real vocabulary!

### 🎉 Success!

Your vocabulary extractor is now a fully functional Android app that can:
- Work offline with demo data
- Use AI when you add an API key
- Store all data locally on the device
- Provide a native mobile experience

**Next Steps:**
- Test with real vocabulary images
- Save your first deck
- Share the APK with others
- Consider publishing to Google Play Store