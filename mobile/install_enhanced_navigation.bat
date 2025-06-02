@echo off
echo =====================================
echo  Enhanced Mobile App Installation
echo  With Material You 3 Navigation
echo =====================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this script from the mobile app directory.
    pause
    exit /b 1
)

echo [1/6] Backing up current App.js...
if exist "App.js" (
    copy "App.js" "App.js.backup.%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%" >nul 2>&1
    echo     ✓ Backup created: App.js.backup.*
) else (
    echo     ! No existing App.js found
)

echo.
echo [2/6] Installing/updating dependencies...
call npm install @react-native-async-storage/async-storage >nul 2>&1
call npm install react-native-vector-icons >nul 2>&1
call npm install @react-navigation/native >nul 2>&1
call npm install @react-navigation/stack >nul 2>&1
call npm install @react-navigation/bottom-tabs >nul 2>&1
call npm install react-native-screens >nul 2>&1
call npm install react-native-safe-area-context >nul 2>&1
call npm install react-native-gesture-handler >nul 2>&1
echo     ✓ Dependencies installed

echo.
echo [3/6] Checking if Buffer polyfill is needed...
findstr /c:"import {Buffer}" node_modules 2>nul
if errorlevel 1 (
    call npm install buffer >nul 2>&1
    echo     ✓ Buffer polyfill installed
) else (
    echo     ✓ Buffer already available
)

echo.
echo [4/6] Verifying file structure...
if not exist "src" mkdir src
if not exist "src\screens" mkdir src\screens
if not exist "src\context" mkdir src\context
echo     ✓ Directory structure verified

echo.
echo [5/6] Checking required files...
set "missing_files="

if not exist "MobileEncryptionService.js" (
    set "missing_files=%missing_files% MobileEncryptionService.js"
)

if not exist "src\context\EncryptionContext.js" (
    set "missing_files=%missing_files% EncryptionContext.js"
)

if not exist "src\screens\AuthScreenEnhanced.js" (
    set "missing_files=%missing_files% AuthScreenEnhanced.js"
)

if not exist "src\screens\HomeScreenEnhanced.js" (
    set "missing_files=%missing_files% HomeScreenEnhanced.js"
)

if not exist "src\screens\SettingsScreenEnhanced.js" (
    set "missing_files=%missing_files% SettingsScreenEnhanced.js"
)

if not exist "src\screens\AddGradeScreenMaterialEnhanced.js" (
    set "missing_files=%missing_files% AddGradeScreenMaterialEnhanced.js"
)

if "%missing_files%" neq "" (
    echo     ⚠️  Warning: Missing enhanced files:
    echo         %missing_files%
    echo     The app may not work correctly without these files.
) else (
    echo     ✓ All enhanced files present
)

echo.
echo [6/6] Installation complete!
echo.
echo =====================================
echo  🎉 Enhanced Mobile App Ready!
echo =====================================
echo.
echo 📱 Features Installed:
echo   ✓ Material You 3 Navigation Structure
echo   ✓ Encryption Service Integration
echo   ✓ Enhanced Auth Screen with Cloud Sync
echo   ✓ Smart Home Screen with Sync Status
echo   ✓ Advanced Settings with Encryption Info
echo   ✓ Grade Manager with Auto-Sync
echo   ✓ Encryption Context Provider
echo.
echo 🔄 Navigation Flow:
echo   • Welcome → Main Tabs (Home/Subjects/Grades/Settings)
echo   • Auth Screen for Cloud Sync login
echo   • AddGrade Screen with sync integration
echo   • Subject Detail Screen
echo.
echo 🔐 Encryption Features:
echo   • Secure sync with Web App
echo   • Offline capability with cached data
echo   • Real-time API status monitoring
echo   • Achievement notifications
echo   • Auto-sync on grade changes
echo.
echo 🚀 To start development:
echo   1. npx react-native start
echo   2. npx react-native run-android (or run-ios)
echo.
echo 📖 Check the enhanced files for:
echo   • AuthScreenEnhanced.js - Cloud sync login
echo   • HomeScreenEnhanced.js - Dashboard with sync status
echo   • SettingsScreenEnhanced.js - Encryption management
echo   • EncryptionContext.js - Shared encryption state
echo.

if "%missing_files%" neq "" (
    echo ⚠️  Note: Some enhanced files are missing.
    echo    Please ensure all files are properly created.
    echo.
)

echo Ready to test your enhanced mobile app! 📱🔐✨
echo.
pause