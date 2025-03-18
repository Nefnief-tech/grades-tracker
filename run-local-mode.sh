#!/bin/bash
# This script runs the Grade Tracker app in local-only mode, without Appwrite cloud features

# Export the environment variable to force local mode
export NEXT_PUBLIC_FORCE_LOCAL_MODE=true

# Run docker-compose
docker-compose up -d

echo "Grade Tracker is running in local-only mode on http://localhost:8080"
echo "All data will be stored locally within the Docker container."
