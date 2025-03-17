#!/bin/bash

# Install pnpm globally and make it available in PATH
npm config set prefix "/root/.npm"
npm install -g pnpm
export PATH="/root/.npm/bin:$PATH"
echo "PNPM installed at: $(which pnpm)"
echo "PNPM version: $(pnpm --version)"
