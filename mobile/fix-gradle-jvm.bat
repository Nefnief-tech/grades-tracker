@echo off
echo ======================================
echo GRADLE JVM COMPATIBILITY FIX
echo ======================================
echo.

echo This script fixes the JVM target compatibility error:
echo - Java compilation target: 17
echo - Kotlin compilation target: 11 ^(inconsistent^)
echo.

echo Step 1: Checking Android project structure...
if exist "android" (
    echo ✓ Android directory found
    
    if exist "android\app\build.gradle" (
        echo ✓ Android app build.gradle found
    ) else (
        echo ✗ Android app build.gradle not found
        echo This fix requires an Android project structure
        pause
        exit /b 1
    )
) else (
    echo ✗ Android directory not found
    echo This appears to be an Expo managed project
    echo Try using EAS Build instead of local Android build
    echo.
    echo Suggested commands:
    echo 1. Install EAS CLI: npm install -g @expo/eas-cli
    echo 2. Configure EAS: eas build:configure
    echo 3. Build with EAS: eas build --platform android
    echo.
    pause
    exit /b 1
)

echo.
echo Step 2: Backing up build.gradle...
copy "android\app\build.gradle" "android\app\build.gradle.backup" >nul
echo ✓ Backup created: android\app\build.gradle.backup

echo.
echo Step 3: Manual edit required...
echo.
echo Please manually edit android\app\build.gradle and add these sections
echo inside the android { } block:
echo.
echo     compileOptions {
echo         sourceCompatibility JavaVersion.VERSION_17
echo         targetCompatibility JavaVersion.VERSION_17
echo     }
echo.
echo     kotlinOptions {
echo         jvmTarget = "17"
echo     }
echo.

echo Step 4: Alternative solutions...
echo.
echo OPTION 1: Clean and rebuild
echo cd android
echo gradlew clean
echo cd ..
echo npx expo run:android
echo.
echo OPTION 2: Update Gradle Wrapper
echo cd android
echo gradlew wrapper --gradle-version 8.13
echo cd ..
echo.
echo OPTION 3: Use EAS Build ^(Recommended^)
echo npm install -g @expo/eas-cli
echo eas build:configure
echo eas build --platform android
echo.
echo OPTION 4: Check Java version
echo java --version
echo # Should be Java 17 or higher
echo.
echo ======================================
echo QUICK FIX SUMMARY:
echo ======================================
echo.
echo The error occurs because:
echo - expo-linear-gradient uses Kotlin with JVM target 11
echo - Your project compiles Java with JVM target 17
echo - These targets must match
echo.
echo RECOMMENDED SOLUTION:
echo Use EAS Build instead of local builds:
echo 1. npm install -g @expo/eas-cli
echo 2. eas build:configure
echo 3. eas build --platform android
echo.
echo This avoids local Gradle configuration issues
echo and provides a more reliable build environment.
echo ======================================
pause