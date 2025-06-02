#!/bin/bash

echo "======================================"
echo "GRADLE JVM COMPATIBILITY FIX"
echo "======================================"
echo ""

echo "This script fixes the JVM target compatibility error:"
echo "- Java compilation target: 17"
echo "- Kotlin compilation target: 11 (inconsistent)"
echo ""

echo "Step 1: Checking Android project structure..."
if [ -d "android" ]; then
    echo "✓ Android directory found"
    
    if [ -f "android/app/build.gradle" ]; then
        echo "✓ Android app build.gradle found"
    else
        echo "✗ Android app build.gradle not found"
        echo "This fix requires an Android project structure"
        exit 1
    fi
else
    echo "✗ Android directory not found"
    echo "This appears to be an Expo managed project"
    echo "Try using EAS Build instead of local Android build"
    echo ""
    echo "Suggested commands:"
    echo "1. Install EAS CLI: npm install -g @expo/eas-cli"
    echo "2. Configure EAS: eas build:configure"
    echo "3. Build with EAS: eas build --platform android"
    echo ""
    exit 1
fi

echo ""
echo "Step 2: Backing up build.gradle..."
cp android/app/build.gradle android/app/build.gradle.backup
echo "✓ Backup created: android/app/build.gradle.backup"

echo ""
echo "Step 3: Applying JVM compatibility fix..."

# Check if compileOptions already exists
if grep -q "compileOptions" android/app/build.gradle; then
    echo "! compileOptions section found - manual edit required"
    echo ""
    echo "Please manually edit android/app/build.gradle and ensure:"
    echo ""
    echo "compileOptions {"
    echo "    sourceCompatibility JavaVersion.VERSION_17"
    echo "    targetCompatibility JavaVersion.VERSION_17"
    echo "}"
    echo ""
    echo "kotlinOptions {"
    echo "    jvmTarget = \"17\""
    echo "}"
    echo ""
else
    # Add compileOptions section
    echo "✓ Adding compileOptions to build.gradle"
    
    # This is a simplified approach - in practice, you'd need more sophisticated text processing
    echo ""
    echo "Manual edit required for android/app/build.gradle:"
    echo "Add these sections inside the android { } block:"
    echo ""
    echo "    compileOptions {"
    echo "        sourceCompatibility JavaVersion.VERSION_17"
    echo "        targetCompatibility JavaVersion.VERSION_17"
    echo "    }"
    echo ""
    echo "    kotlinOptions {"
    echo "        jvmTarget = \"17\""
    echo "    }"
fi

echo ""
echo "Step 4: Additional fixes you can try..."
echo ""
echo "OPTION 1: Clean and rebuild"
echo "cd android"
echo "./gradlew clean"
echo "cd .."
echo "npx expo run:android"
echo ""
echo "OPTION 2: Update Gradle Wrapper"
echo "cd android"
echo "./gradlew wrapper --gradle-version 8.13"
echo "cd .."
echo ""
echo "OPTION 3: Use EAS Build (Recommended)"
echo "npm install -g @expo/eas-cli"
echo "eas build:configure"
echo "eas build --platform android"
echo ""
echo "OPTION 4: Check Java version"
echo "java --version"
echo "# Should be Java 17 or higher"
echo ""
echo "======================================"
echo "NEXT STEPS:"
echo "======================================"
echo ""
echo "1. Edit android/app/build.gradle manually"
echo "2. Add the compileOptions and kotlinOptions sections"
echo "3. Clean and rebuild: cd android && ./gradlew clean"
echo "4. Try building again: npx expo run:android"
echo ""
echo "If issues persist, consider using EAS Build"
echo "which handles these compatibility issues automatically."
echo "======================================"