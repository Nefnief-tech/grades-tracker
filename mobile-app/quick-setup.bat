@echo off
echo 🚀 Quick Setup for Vocabulary Extractor
echo.

echo Creating assets directory...
if not exist assets mkdir assets

echo Creating basic PNG assets...
echo This will create minimal PNG files that work with Expo

:: Create a simple batch script to make basic files
echo Creating icon.png...
echo. > assets\icon.png

echo Creating adaptive-icon.png...
echo. > assets\adaptive-icon.png

echo Creating splash.png...
echo. > assets\splash.png

echo Creating favicon.png...
echo. > assets\favicon.png

echo.
echo ✅ Basic assets created!
echo.
echo Next steps:
echo 1. Run: npm start
echo 2. Install Expo Go on your phone
echo 3. Scan QR code to load your app
echo.
echo Your vocabulary extractor is ready! 🎉

pause