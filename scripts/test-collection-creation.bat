@echo off
echo ========================================
echo  Simple Analytics Collection Test
echo ========================================
echo Database ID: 67d6b079002144822b5e
echo.

echo Testing single collection creation...
echo.

echo Creating test collection...
appwrite databases create-collection --databaseId 67d6b079002144822b5e --collectionId test_analytics --name "Test Analytics"
if %errorlevel% neq 0 (
    echo ERROR: Failed to create collection
    echo Make sure you are logged in and project is set
    pause
    exit /b 1
)

echo.
echo Adding one test attribute...
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId test_analytics --key testField --size 100 --required true
if %errorlevel% neq 0 (
    echo ERROR: Failed to create attribute
    pause
    exit /b 1
)

echo.
echo ========================================
echo Test collection created successfully!
echo ========================================
echo.
echo You can now delete this test collection from Appwrite Console
echo and run the full analytics setup script.
echo.
pause