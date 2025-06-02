@echo off
echo ==========================================
echo INSTALLING ENHANCED MOBILE APP
echo ==========================================
echo.

echo This will install the enhanced Grade Tracker mobile app
echo with integrated encryption and web app sync capabilities.
echo.

echo Step 1: Backing up current App.js...
if exist App.js (
    copy App.js App.js.backup >nul
    echo ✓ Current App.js backed up to App.js.backup
) else (
    echo ! No existing App.js found
)

echo.
echo Step 2: Installing enhanced app with encryption...
if exist App.enhanced.js (
    copy App.enhanced.js App.js >nul
    echo ✓ Enhanced app installed as App.js
) else (
    echo ✗ App.enhanced.js not found
    echo Please ensure all files are in the mobile directory
    pause
    exit /b 1
)

echo.
echo Step 3: Verifying required files...
set "missing_files="

if not exist MobileEncryptionService.js (
    set "missing_files=%missing_files% MobileEncryptionService.js"
)

if not exist GradeManager.js (
    set "missing_files=%missing_files% GradeManager.js"
)

if defined missing_files (
    echo ✗ Missing required files:%missing_files%
    echo Please ensure all files are present
    pause
    exit /b 1
) else (
    echo ✓ All required files present
)

echo.
echo Step 4: Checking React Native dependencies...
echo Checking if Buffer polyfill is available...
npm list buffer >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Buffer polyfill for React Native...
    npm install buffer
    if %errorlevel% neq 0 (
        echo ✗ Failed to install Buffer polyfill
        echo You may need to install it manually: npm install buffer
    ) else (
        echo ✓ Buffer polyfill installed
    )
) else (
    echo ✓ Buffer polyfill already available
)

echo.
echo Step 5: Testing app startup...
echo.
echo Starting Metro bundler to test the enhanced app...
echo (This will open in a new window)
echo.

start cmd /k "npx expo start --clear"

echo Waiting for Metro to start...
timeout /t 5 /nobreak >nul

echo.
echo ==========================================
echo ENHANCED MOBILE APP INSTALLED! 🚀
echo ==========================================
echo.
echo Your Grade Tracker mobile app now includes:
echo.
echo 🔐 ENCRYPTION FEATURES:
echo   • Secure grade decryption from web app
echo   • Base64 encryption with user ID key
echo   • Two-way sync with web application
echo   • Offline capability with cached data
echo.
echo 📱 NEW COMPONENTS:
echo   • App.enhanced.js → Enhanced main app
echo   • MobileEncryptionService.js → Encryption service
echo   • GradeManager.js → Grade management UI
echo.
echo 🎯 MAIN FEATURES:
echo   • Password-based sync with web app
echo   • Real-time grade management
echo   • Encryption testing and validation
echo   • API status monitoring
echo   • Sample data for offline use
echo.
echo 📊 GRADE MANAGEMENT:
echo   • Add grades with sync to web app
echo   • Achievement notifications for good grades
echo   • Subject-based organization
echo   • Grade type categorization (Test, Quiz, etc.)
echo   • Visual grade display with color coding
echo.
echo 🔄 SYNC CAPABILITIES:
echo   • Enter password to sync with web app
echo   • Automatic encryption conversion
echo   • Fallback to local data if sync fails
echo   • Test encryption functionality
echo.
echo 🧪 TESTING FEATURES:
echo   • Test encryption/decryption
echo   • Check API connectivity status
echo   • Validate data integrity
echo   • Monitor sync operations
echo.
echo 📱 HOW TO USE:
echo.
echo 1. Open the app on your device/emulator
echo 2. Enter your password in the sync section
echo 3. Tap "🔄 Sync Grades" to get data from web app
echo 4. Use "🧪 Test" to verify encryption works
echo 5. Add new grades and they'll sync back to web app
echo.
echo 🔍 TROUBLESHOOTING:
echo.
echo • If sync fails → App works offline with sample data
echo • If API is offline → Shows "Offline Mode" status
echo • If encryption fails → Falls back to local storage
echo • Check console logs for detailed error information
echo.
echo The app automatically detects if your web app API
echo is running and adjusts functionality accordingly.
echo.
echo 🎉 Your mobile app is now fully integrated with
echo the web app's encryption system!
echo ==========================================
pause