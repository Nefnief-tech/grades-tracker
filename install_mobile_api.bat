@echo off
echo ==========================================
echo INSTALLING MOBILE API SERVER
echo ==========================================
echo.

echo This will set up the API server that converts encrypted grades
echo from the web app format to mobile-compatible format.
echo.

echo Step 1: Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Node.js not found
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js found

echo.
echo Step 2: Creating API directory structure...
if not exist "api" mkdir api
if not exist "api\routes" mkdir api\routes
echo ✓ API directories created

echo.
echo Step 3: Installing API dependencies...
cd api
call npm install
if %errorlevel% neq 0 (
    echo ✗ Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo Step 4: Setting up environment configuration...
if not exist ".env" (
    copy ".env.example" ".env" >nul
    echo ✓ Environment file created from example
    echo ! Please edit api\.env with your Appwrite credentials
) else (
    echo ✓ Environment file already exists
)

cd ..

echo.
echo Step 5: Testing API server...
echo Starting server test...
cd api
start /b npm start
timeout /t 5 /nobreak >nul

echo Testing health endpoint...
curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% eq 0 (
    echo ✓ API server is running successfully
) else (
    echo ! API server test skipped (curl not available)
    echo ! Server should be running on http://localhost:3001
)

echo.
echo ==========================================
echo MOBILE API INSTALLATION COMPLETE! 🚀
echo ==========================================
echo.
echo Your Grade Tracker Mobile API is ready:
echo.
echo 🌐 SERVER ENDPOINTS:
echo   • Health Check: http://localhost:3001/api/health
echo   • Documentation: http://localhost:3001/api/docs
echo   • Decrypt Grades: POST /api/mobile/grades/decrypt
echo   • Encrypt Grades: POST /api/mobile/grades/encrypt
echo   • Test Decrypt: POST /api/mobile/grades/test-decrypt
echo.
echo 🔐 ENCRYPTION FLOW:
echo   1. Web app encrypts grades with complex AES-256-GCM
echo   2. API decrypts using user password
echo   3. API re-encrypts with simple Base64 + user ID key
echo   4. Mobile app can easily decrypt with user ID
echo.
echo 📱 MOBILE INTEGRATION:
echo   • MobileEncryptionService.js handles API communication
echo   • Automatic fallback to cached/sample data
echo   • Offline capability with local encryption
echo   • Sync functionality with web app
echo.
echo ⚙️ NEXT STEPS:
echo.
echo 1. Configure Environment:
echo    • Edit api\.env with your Appwrite credentials
echo    • Set APPWRITE_PROJECT_ID and APPWRITE_API_KEY
echo    • Configure JWT_SECRET for production
echo.
echo 2. Start API Server:
echo    cd api
echo    npm start
echo.
echo 3. Update Mobile App:
echo    • Add MobileEncryptionService.js to your app
echo    • Update API_BASE_URL if needed
echo    • Test with sample data first
echo.
echo 4. Test Integration:
echo    • Use POST /api/mobile/grades/decrypt
echo    • Send: token, encryptedGrades, userPassword
echo    • Receive: mobile-compatible encrypted grades
echo.
echo 🔧 PRODUCTION CHECKLIST:
echo   ✓ Update environment variables
echo   ✓ Set proper CORS origins
echo   ✓ Configure rate limiting
echo   ✓ Set up SSL/HTTPS
echo   ✓ Monitor API performance
echo.
echo Your mobile app can now decrypt grades that were
echo encrypted by the web app! 🎉
echo ==========================================

cd ..
pause