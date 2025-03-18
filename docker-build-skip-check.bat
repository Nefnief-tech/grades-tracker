@echo off
REM Build Docker image with TypeScript checking disabled

REM Set environment variables
set NEXT_TYPECHECK=false
set NEXT_STRICT_MODE=false

echo Building Docker image with TypeScript checks disabled...
docker build -t grades-app:latest .

echo Docker build completed.
pause
