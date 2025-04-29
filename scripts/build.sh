#!/bin/bash

# Print current Node.js version
echo "Starting build with Node.js version: $(node --version)"

# Try to use n to switch to Node.js 20
if command -v n &> /dev/null; then
    echo "Using n to switch to Node.js 20..."
    n 20.10.0
    export PATH="/usr/local/bin:$PATH"
    echo "Node.js version after switch: $(node --version)"
else
    echo "n command not found, installing..."
    npm install -g n
    n 20.10.0
    export PATH="/usr/local/bin:$PATH"
    echo "Node.js version after install and switch: $(node --version)"
fi

# Install pnpm if not installed
if ! command -v pnpm &> /dev/null; then
    echo "pnpm not found, installing..."
    npm install -g pnpm
fi

# Run build with pnpm
echo "Building with pnpm..."
pnpm install --no-frozen-lockfile
pnpm build