#!/bin/bash

# Install pnpm globally and make it available in PATH
npm config set prefix "/usr/local"
npm install -g pnpm
echo "PNPM installed at: $(which pnpm)"
echo "PNPM version: $(pnpm --version)"
