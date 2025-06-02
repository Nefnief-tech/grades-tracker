# Fix Appwrite SDK Version Mismatch

## Issue: SDK 1.7.0 vs Server 1.6.1

The error shows that your Appwrite SDK version (1.7.0) is newer than your server version (1.6.1).

## Quick Fix:

### Option 1: Downgrade SDK (Recommended)
```bash
cd f:\grade-tracker-v2\mobile
npm uninstall appwrite
npm install appwrite@14.0.1
```

### Option 2: Alternative Compatible Version
```bash
npm install appwrite@13.0.2
```

### After Installing:
1. **Restart Metro bundler** (Ctrl+C then `npm start`)
2. **Clear cache if needed**: `npx react-native start --reset-cache`

## ✅ Fixed TypeError Issues:

I've also fixed the `toFixed` errors by adding null checks:
- `grade.score.toFixed(1)` → `(grade.score || 0).toFixed(1)`
- `avg.toFixed(1)` → `(avg || 0).toFixed(1)`
- Added fallbacks for gpa, totalSubjects, totalGrades

## Expected Result:

After downgrading Appwrite SDK:
- ✅ No more version mismatch warnings
- ✅ No more `toFixed` TypeError
- ✅ App should run smoothly

## Alternative: Use Latest Server

If you control the Appwrite server, you could also upgrade it to 1.7.0 instead of downgrading the SDK.

---

**Run the npm commands above to resolve the version mismatch!** 🚀