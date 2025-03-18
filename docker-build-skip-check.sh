#!/bin/bash

# Build Docker image with TypeScript checking disabled
export NEXT_TYPECHECK=false
export NEXT_STRICT_MODE=false

echo "Building Docker image with TypeScript checks disabled..."
docker build -t grades-app:latest .

echo "Docker build completed."
