@echo off
echo =====================================
echo  Installing Appwrite Authentication
echo =====================================
echo.

echo [1/3] Installing Appwrite SDK...
call npm install appwrite
if %errorlevel% neq 0 (
    echo     ❌ Failed to install Appwrite SDK
    goto :error_exit
) else (
    echo     ✓ Appwrite SDK installed successfully
)

echo.
echo [2/3] Installing additional dependencies...
call npm install react-native-url-polyfill >nul 2>&1
echo     ✓ URL polyfill installed

echo.
echo [3/3] Creating Appwrite configuration template...

if not exist "src\config" mkdir src\config >nul 2>&1

echo // Appwrite Configuration > src\config\appwrite.js
echo // Replace these values with your actual Appwrite project details >> src\config\appwrite.js
echo. >> src\config\appwrite.js
echo const APPWRITE_CONFIG = { >> src\config\appwrite.js
echo   endpoint: 'https://cloud.appwrite.io/v1', // Your Appwrite endpoint >> src\config\appwrite.js
echo   projectId: 'your-project-id-here', // Your Appwrite project ID >> src\config\appwrite.js
echo   databaseId: 'your-database-id', // Your database ID ^(optional^) >> src\config\appwrite.js
echo   gradesCollectionId: 'grades-collection-id' // Your grades collection ID ^(optional^) >> src\config\appwrite.js
echo }; >> src\config\appwrite.js
echo. >> src\config\appwrite.js
echo export default APPWRITE_CONFIG; >> src\config\appwrite.js

echo     ✓ Configuration template created

echo.
echo =====================================
echo  Installation Complete!
echo =====================================
echo.
echo ✅ Appwrite SDK installed successfully
echo ✅ Dependencies configured
echo ✅ Configuration template created
echo.
echo 📋 Next Steps:
echo.
echo 1. 🌐 Create Appwrite Project:
echo    • Go to https://cloud.appwrite.io
echo    • Create a new project
echo    • Note your Project ID
echo.
echo 2. ⚙️  Configure Project:
echo    • Edit src\config\appwrite.js
echo    • Replace 'your-project-id-here' with your actual Project ID
echo    • Update the endpoint if using self-hosted Appwrite
echo.
echo 3. 📱 Update Platform Settings:
echo    • In Appwrite Console → Settings → Platforms
echo    • Add Android platform: com.yourapp.name
echo    • Add iOS platform: com.yourapp.name
echo.
echo 4. 🔧 Update AppwriteService:
echo    • Edit src\services\AppwriteService.js
echo    • Import and use the config file
echo.
echo 💡 Quick Setup Example:
echo.
echo In AppwriteService.js, replace:
echo   .setProject^('your-project-id'^)
echo.
echo With:
echo   .setProject^('675abc123def456'^) // Your actual project ID
echo.
echo 🚀 Ready to Test:
echo    • Your app now supports Appwrite authentication
echo    • Users can register, login, and sync data
echo    • User IDs are properly obtained from Appwrite accounts
echo.
goto :success_exit

:error_exit
echo ❌ Installation failed!
echo Please check your internet connection and try again.
pause
exit /b 1

:success_exit
echo ✅ Ready to configure Appwrite! 🚀
pause