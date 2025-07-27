@echo off
echo ========================================
echo  Appwrite CLI Test & Setup Check
echo ========================================
echo.

echo Testing Appwrite CLI...
appwrite --version
if %errorlevel% neq 0 (
    echo ERROR: Appwrite CLI not working
    pause
    exit /b 1
)

echo.
echo Checking login status...
appwrite account get
if %errorlevel% neq 0 (
    echo ERROR: Not logged in to Appwrite
    echo Please run: appwrite login
    pause
    exit /b 1
)

echo.
echo Testing database access...
appwrite databases list
if %errorlevel% neq 0 (
    echo ERROR: Cannot access databases
    echo Please check your project is set: appwrite client setProject YOUR_PROJECT_ID
    pause
    exit /b 1
)

echo.
echo ========================================
echo All checks passed! Ready to create collections.
echo ========================================
pause