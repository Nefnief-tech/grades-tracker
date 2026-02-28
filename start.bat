@echo off
echo 🚀 Starting local server for static files...

REM Check if out directory exists
if not exist "out" (
    echo ❌ Error: 'out' directory not found!
    echo Please build the project first with: pnpm run build
    pause
    exit /b 1
)

echo 📦 Serving static files from 'out' directory on http://localhost:3000
npx serve -s out -l 3000

pause