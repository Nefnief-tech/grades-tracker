# 🔧 Java Version Fix & Alternative Setup

## Issue: Java Version Compatibility

The error you're seeing is because you have Java 22 installed, but Android build tools expect Java 17 or earlier.

### 🎯 Quick Solution: Use Expo Go (Recommended)

Instead of building native Android, use Expo Go for development:

```bash
cd mobile-app
npm run reset-assets
npm start
```

Then:
1. Install **Expo Go** from Google Play Store
2. Scan the QR code with Expo Go
3. Your app runs instantly without any Java/Android setup!

### 🔧 Fix Java Version (If you want native builds)

**Option 1: Install Java 17**
1. Download Java 17 from [Adoptium](https://adoptium.net/temurin/releases/?version=17)
2. Set JAVA_HOME to point to Java 17
3. Verify: `java -version` should show version 17

**Option 2: Use Gradle JVM settings**
Create or update `gradle.properties`:

```properties
org.gradle.java.home=C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.x-hotspot
org.gradle.jvmargs=-Xmx2048m -XX:MaxPermSize=512m
```

### 🎯 Recommended Development Flow

For vocabulary extractor development, I recommend:

1. **Development**: Use Expo Go (fastest iteration)
2. **Testing**: Use Expo Go on real device
3. **Distribution**: Build APK later with EAS Build (cloud-based)

### 🚀 Start Developing Now

```bash
cd mobile-app
npm run reset-assets
npm start
```

This bypasses all Java/Android setup issues and gets your app running immediately!

### 📱 Why Expo Go is Better for Development

- ✅ No Java/Android Studio setup required
- ✅ Instant reload and hot reload
- ✅ Test on real device immediately  
- ✅ Same performance as native during development
- ✅ Easy to share with others for testing

You can always build native APK later using EAS Build (cloud-based, no local setup needed).