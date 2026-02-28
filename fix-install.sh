#!/bin/bash

echo "🔧 Fixing Next.js installation..."

# Remove existing node_modules and lock files
echo "🗑️ Cleaning existing installation..."
rm -rf node_modules
rm -f pnpm-lock.yaml
rm -f package-lock.json

# Clear pnpm cache
echo "🧹 Clearing pnpm cache..."
pnpm store prune

# Reinstall dependencies
echo "📦 Reinstalling dependencies..."
pnpm install

echo "✅ Installation complete! You can now run:"
echo "  pnpm dev    # for development"
echo "  pnpm build  # to build static files"