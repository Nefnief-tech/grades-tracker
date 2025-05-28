@echo off
echo 🔧 Fixing Next.js installation...

REM Remove existing node_modules and lock files
echo 🗑️ Cleaning existing installation...
if exist node_modules rmdir /s /q node_modules
if exist pnpm-lock.yaml del pnpm-lock.yaml
if exist package-lock.json del package-lock.json

REM Clear pnpm cache
echo 🧹 Clearing pnpm cache...
pnpm store prune

REM Reinstall dependencies
echo 📦 Reinstalling dependencies...
pnpm install

echo ✅ Installation complete! You can now run:
echo   pnpm dev    # for development
echo   pnpm build  # to build static files

pause