@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting deployment of prebuilt files...

REM Check if out directory exists
if not exist "out" (
    echo ❌ Error: 'out' directory not found!
    echo Please build the project first with: npm run build
    exit /b 1
)

echo ✅ Found prebuilt files in 'out' directory

REM Check if out directory has content
dir /b out 2>nul | findstr . >nul
if errorlevel 1 (
    echo ❌ Error: 'out' directory is empty!
    echo Please build the project first with: npm run build
    exit /b 1
)

echo 📦 Deploying static files...

REM Show what would be deployed
echo Files to deploy:
dir /s /b out | head -20
echo ...

echo ✅ Deployment preparation complete!
echo 💡 Configure your deployment method in this script or use your platform's CLI

pause