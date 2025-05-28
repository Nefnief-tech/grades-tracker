#!/bin/bash

# Start script for serving static files locally
echo "🚀 Starting local server for static files..."

# Check if out directory exists
if [ ! -d "out" ]; then
    echo "❌ Error: 'out' directory not found!"
    echo "Please build the project first with: pnpm run build"
    exit 1
fi

# Check if npx is available
if command -v npx >/dev/null 2>&1; then
    echo "📦 Serving static files from 'out' directory on http://localhost:3000"
    npx serve -s out -l 3000
else
    echo "❌ Error: npx not found. Please install Node.js"
    exit 1
fi