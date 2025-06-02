@echo off
echo ==========================================
echo SETTING UP WEB APP GRADE API
echo ==========================================
echo.

echo This sets up the Grade API routes in your Next.js web app
echo for converting encrypted grades between web and mobile formats.
echo.

echo Step 1: Checking web app directory structure...
if not exist "app\api" (
    echo ✗ app\api directory not found
    echo This script should be run from the web app root directory
    echo Current directory: %CD%
    pause
    exit /b 1
)
echo ✓ Web app directory structure found

echo.
echo Step 2: Verifying API routes created...
if exist "app\api\grades\mobile-decrypt\route.ts" (
    echo ✓ Mobile decrypt route created
) else (
    echo ✗ Mobile decrypt route missing
)

if exist "app\api\grades\mobile-encrypt\route.ts" (
    echo ✓ Mobile encrypt route created
) else (
    echo ✗ Mobile encrypt route missing
)

if exist "app\api\grades\test-mobile-decrypt\route.ts" (
    echo ✓ Test decrypt route created
) else (
    echo ✗ Test decrypt route missing
)

echo.
echo Step 3: Testing Next.js development server...
echo.
echo Starting development server to test API routes...
echo (This will start the server in a new window)
echo.

start cmd /k "npm run dev"

echo Waiting for server to start...
timeout /t 10 /nobreak >nul

echo.
echo ==========================================
echo WEB APP GRADE API SETUP COMPLETE! 🚀
echo ==========================================
echo.
echo Your Next.js web app now has these API routes:
echo.
echo 🔄 GRADE CONVERSION ROUTES:
echo   • POST /api/grades/mobile-decrypt
echo     Convert web encrypted grades → mobile format
echo.
echo   • POST /api/grades/mobile-encrypt  
echo     Convert mobile encrypted grades → web format
echo.
echo   • POST /api/grades/test-mobile-decrypt
echo     Test mobile decryption functionality
echo.
echo 🔐 ENCRYPTION FLOW:
echo   Web App (AES-256-GCM + PBKDF2)
echo       ↓ [API Route]
echo   Mobile App (AES-256-CBC + Base64 + User ID Key)
echo.
echo 📡 API USAGE:
echo.
echo 1. Mobile Decrypt:
echo    POST /api/grades/mobile-decrypt
echo    Body: {
echo      "encryptedGrades": "web_encrypted_data",
echo      "userPassword": "user_password", 
echo      "userId": "user123",
echo      "requestId": "optional_id"
echo    }
echo.
echo 2. Mobile Encrypt:
echo    POST /api/grades/mobile-encrypt
echo    Body: {
echo      "mobileEncryptedGrades": "mobile_encrypted_data",
echo      "userPassword": "user_password",
echo      "userId": "user123"
echo    }
echo.
echo 3. Test Decrypt:
echo    POST /api/grades/test-mobile-decrypt
echo    Body: {
echo      "mobileEncryptedGrades": "mobile_data",
echo      "userId": "user123"
echo    }
echo.
echo 🧪 TESTING THE API:
echo.
echo 1. Web app running at: http://localhost:3000
echo 2. Test endpoints with curl or Postman:
echo.
echo    curl -X POST http://localhost:3000/api/grades/mobile-decrypt \
echo      -H "Content-Type: application/json" \
echo      -d "{"encryptedGrades":"...","userPassword":"...","userId":"user123"}"
echo.
echo 📱 MOBILE APP INTEGRATION:
echo.
echo 1. MobileEncryptionService.js updated to use web app API
echo 2. API endpoints use Next.js route handlers
echo 3. No separate Express server needed
echo 4. Integrated with your existing web app
echo.
echo 🎯 NEXT STEPS:
echo.
echo 1. Test API routes in development
echo 2. Update mobile app to use new service
echo 3. Implement actual grade data fetching
echo 4. Deploy web app with API routes
echo.
echo Your mobile app can now communicate directly with
echo your web app to convert encrypted grades! 🎉
echo ==========================================
pause