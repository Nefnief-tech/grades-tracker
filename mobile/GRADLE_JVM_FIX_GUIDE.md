# Gradle JVM Compatibility Fix Guide

## 🚨 Problem
You're getting this error:
```
Inconsistent JVM-target compatibility detected for tasks 
'compileReleaseJavaWithJavac' (17) and 'compileReleaseKotlin' (11)
```

This happens because:
- **Java compilation** targets JVM 17
- **Kotlin compilation** (expo-linear-gradient) targets JVM 11
- These must match for the build to succeed

## 🔧 Solutions (Choose One)

### ✅ **RECOMMENDED: Use EAS Build**
This is the easiest and most reliable solution:

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure EAS Build
eas build:configure

# Build for Android
eas build --platform android
```

**Why EAS Build is better:**
- Handles all Gradle configurations automatically
- Consistent build environment
- No local Java/Gradle version conflicts
- Official Expo solution

### 🛠️ **Alternative: Fix Local Build**

If you prefer local builds, manually edit `android/app/build.gradle`:

```gradle
android {
    // ... existing code ...
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    
    kotlinOptions {
        jvmTarget = "17"
    }
    
    // ... existing code ...
}
```

Then clean and rebuild:
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

### 🔄 **Other Options to Try**

**1. Update Gradle Wrapper:**
```bash
cd android
./gradlew wrapper --gradle-version 8.13
cd ..
```

**2. Check Java Version:**
```bash
java --version
# Should be Java 17 or higher
```

**3. Clean Everything:**
```bash
# Clean React Native
npx react-native clean

# Clean Android
cd android
./gradlew clean
cd ..

# Clear Metro cache
npx expo start --clear
```

## 🎯 **Why This Happens**

This error is common with Expo projects that include native modules like:
- `expo-linear-gradient`
- `expo-image-loader`
- `expo-file-system`

These modules are compiled with different JVM targets, causing conflicts.

## 💡 **Best Practice**

For Expo projects, **always use EAS Build** for production builds:
- More reliable than local builds
- Handles all native dependencies automatically
- Provides consistent build environment
- Official Expo recommendation

## 🚀 **Quick Start with EAS Build**

```bash
# 1. Install EAS CLI globally
npm install -g @expo/eas-cli

# 2. Login to Expo account
eas login

# 3. Configure your project
eas build:configure

# 4. Build for Android
eas build --platform android

# 5. Build for both platforms
eas build --platform all
```

The EAS build will handle all the JVM compatibility issues automatically! 🎉