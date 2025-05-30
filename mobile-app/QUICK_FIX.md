# 🔧 Quick Fix Commands

## CRC Error Fix

If you're getting CRC errors when building your Android app:

```bash
cd mobile-app
npm run reset-assets
npm start
```

## ⚠️ Important: Use npm run, not node directly

**❌ Don't use:** `node reset-assets.js`  
**✅ Use instead:** `npm run reset-assets`

The npm script combines two separate scripts:
- `npm run cleanup-assets` (runs `cleanup-assets.js`)
- `npm run create-assets` (runs `create-assets.js`)

## Available Scripts

- `npm run reset-assets` - Clean and recreate all PNG assets ⭐
- `npm run create-assets` - Create PNG assets only  
- `npm run cleanup-assets` - Remove existing PNG files only
- `npm run setup` - Full setup (cleanup + create + install)

## Step-by-Step Fix

1. **Navigate to mobile app folder:**
   ```bash
   cd mobile-app
   ```

2. **Reset assets (use npm script):**
   ```bash
   npm run reset-assets
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

4. **Use Expo Go app to scan QR code**

## What Each Script Does

- **cleanup-assets.js** - Removes corrupted PNG files
- **create-assets.js** - Creates valid PNG files from base64 data
- **reset-assets** - Runs cleanup then create (recommended)

Your app should now work with Expo Go! 🎉