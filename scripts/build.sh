#!/bin/bash

# Print current Node.js version
echo "Starting build with Node.js version: $(node --version)"

# Run build with pnpm
echo "Building with pnpm..."
pnpm install --no-frozen-lockfile
pnpm build