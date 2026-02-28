#!/bin/bash

# Deployment script for prebuilt static files
# This script deploys the contents of the 'out' directory

set -e

echo "🚀 Starting deployment of prebuilt files..."

# Check if out directory exists
if [ ! -d "out" ]; then
    echo "❌ Error: 'out' directory not found!"
    echo "Please build the project first with: npm run build"
    exit 1
fi

echo "✅ Found prebuilt files in 'out' directory"

# Check if out directory has content
if [ -z "$(ls -A out)" ]; then
    echo "❌ Error: 'out' directory is empty!"
    echo "Please build the project first with: npm run build"
    exit 1
fi

echo "📦 Deploying static files..."

# Example deployment commands for different platforms:

# For rsync to a server:
# rsync -avz --delete out/ user@server:/path/to/webroot/

# For AWS S3:
# aws s3 sync out/ s3://your-bucket-name --delete

# For FTP:
# lftp -c "open ftp://user:pass@server; mirror -R out/ /path/to/webroot/ --delete"

# For now, just show what would be deployed
echo "Files to deploy:"
find out -type f | head -20
echo "..."
echo "Total files: $(find out -type f | wc -l)"

echo "✅ Deployment preparation complete!"
echo "💡 Configure your deployment method in this script or use your platform's CLI"