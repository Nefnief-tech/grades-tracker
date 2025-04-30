@echo off
echo Creating 2FA collections in Appwrite...
echo.

echo This script will create:
echo - two_factor_codes collection
echo - user_preferences collection
echo.

echo Make sure you have set the APPWRITE_API_KEY in your .env file!
echo.

pause

node lib/collection-creator.js

echo.
echo If successful, you can now use the 2FA feature with actual collections.
echo.

pause