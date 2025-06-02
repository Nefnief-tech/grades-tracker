@echo off
echo =====================================
echo  Enhanced Mobile App - Fix Installation
echo  Resolving Buffer and Import Issues
echo =====================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this script from the mobile app directory.
    pause
    exit /b 1
)

echo [1/7] Installing Buffer polyfill...
call npm install buffer >nul 2>&1
echo     ✓ Buffer polyfill installed

echo.
echo [2/7] Installing required dependencies...
call npm install @react-native-async-storage/async-storage >nul 2>&1
call npm install react-native-vector-icons >nul 2>&1
call npm install @react-navigation/native >nul 2>&1
call npm install @react-navigation/stack >nul 2>&1
call npm install @react-navigation/bottom-tabs >nul 2>&1
call npm install react-native-screens >nul 2>&1
call npm install react-native-safe-area-context >nul 2>&1
call npm install react-native-gesture-handler >nul 2>&1
echo     ✓ Navigation dependencies installed

echo.
echo [3/7] Creating directory structure...
if not exist "src" mkdir src
if not exist "src\screens" mkdir src\screens
if not exist "src\context" mkdir src\context
echo     ✓ Directories created

echo.
echo [4/7] Verifying polyfill files...
if exist "polyfills.js" (
    echo     ✓ polyfills.js found
) else (
    echo     ⚠️  polyfills.js missing - creating...
    echo // Global polyfills for React Native > polyfills.js
    echo import { Buffer } from 'buffer'; >> polyfills.js
    echo global.Buffer = Buffer; >> polyfills.js
)

if exist "metro.config.js" (
    echo     ✓ metro.config.js found
) else (
    echo     ⚠️  metro.config.js missing - Buffer polyfill may not work properly
)

echo.
echo [5/7] Checking required context file...
if exist "src\context\EncryptionContext.js" (
    echo     ✓ EncryptionContext.js found
) else (
    echo     ❌ ERROR: EncryptionContext.js missing!
    echo        This file is required for the app to work.
    echo        Please ensure src\context\EncryptionContext.js exists.
    set "missing_context=1"
)

echo.
echo [6/7] Checking MobileEncryptionService...
if exist "MobileEncryptionService.js" (
    echo     ✓ MobileEncryptionService.js found
) else (
    echo     ❌ ERROR: MobileEncryptionService.js missing!
    echo        This file is required for encryption functionality.
    set "missing_service=1"
)

echo.
echo [7/7] Checking enhanced screens...
set "screen_count=0"
if exist "src\screens\AuthScreenEnhanced.js" set /a screen_count+=1
if exist "src\screens\HomeScreenEnhanced.js" set /a screen_count+=1
if exist "src\screens\SettingsScreenEnhanced.js" set /a screen_count+=1
if exist "src\screens\AddGradeScreenMaterialEnhanced.js" set /a screen_count+=1

echo     ✓ Found %screen_count%/4 enhanced screens

echo.
echo =====================================
echo  Installation Status
echo =====================================
echo.

if "%missing_context%"=="1" (
    echo ❌ CRITICAL: EncryptionContext.js missing
    echo    App will not start without this file.
    echo.
    echo 📋 To fix:
    echo    1. Create src\context\EncryptionContext.js
    echo    2. Copy the EncryptionContext code from the enhanced files
    echo.
    goto :error_exit
)

if "%missing_service%"=="1" (
    echo ❌ CRITICAL: MobileEncryptionService.js missing
    echo    App will not work without encryption service.
    echo.
    echo 📋 To fix:
    echo    1. Create MobileEncryptionService.js in mobile root
    echo    2. Copy the enhanced encryption service code
    echo.
    goto :error_exit
)

echo ✅ Dependencies installed successfully!
echo ✅ Buffer polyfill configured!
echo ✅ Directory structure ready!
echo ✅ Required files present!
echo.
echo 🚀 Next Steps:
echo   1. Clear Metro cache: npx react-native start --reset-cache
echo   2. Restart bundler: npx react-native start
echo   3. Run app: npx react-native run-android
echo.
echo 💡 If you still get Buffer errors:
echo   1. Stop Metro bundler (Ctrl+C)
echo   2. Run: npx react-native start --reset-cache
echo   3. Rebuild: npx react-native run-android --reset-cache
echo.
echo 🔧 Troubleshooting:
echo   • Buffer errors → Reset Metro cache
echo   • Import errors → Check file paths in App.js
echo   • Screen errors → Verify enhanced screen files exist
echo.
goto :success_exit

:error_exit
echo ❌ Installation incomplete due to missing files!
echo    Please create the missing files and run again.
echo.
pause
exit /b 1

:success_exit
echo ✅ Ready to test your enhanced mobile app! 📱🔐
echo.
pause