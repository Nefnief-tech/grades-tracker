# 🚀 Manual Asset Creation & Quick Start

Since npm scripts aren't updating, let's create the assets manually and get your app running.

## Step 1: Create Assets Manually

Run these commands one by one:

```bash
cd mobile-app
node cleanup-assets.js
node create-assets.js
```

## Step 2: Start Your App

```bash
npm start
```

## Step 3: Test with Expo Go

1. Install **Expo Go** from Google Play Store
2. Scan the QR code that appears
3. Your vocabulary extractor loads instantly! 📱

## If the individual scripts don't work, create assets manually:

Create the `assets` folder and PNG files:

```bash
mkdir assets
```

Then we'll use an alternative method to create the required PNG files.

## Alternative: Skip Asset Issues Entirely

The app might work without custom assets using Expo's defaults. Try:

```bash
npm start
```

If you get asset errors in Expo Go, we can fix them after the app is running.

## What to expect:

✅ Camera integration for vocabulary capture  
✅ AI-powered extraction (with API key)  
✅ Demo mode (works without API key)  
✅ Deck management and study mode  
✅ Offline storage  

Your vocabulary extractor should work perfectly in Expo Go! 🎉