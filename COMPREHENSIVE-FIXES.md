# Fix Multiple App Errors

## 🔧 Current Issues & Fixes:

### 1. Appwrite SDK Version Mismatch ⚠️
**Issue**: SDK 1.7.0 vs Server 1.6.1

**Fix**:
```bash
cd f:\grade-tracker-v2\mobile
npm uninstall appwrite
npm install appwrite@13.0.2
npm start --reset-cache
```

### 2. Vocabulary Query Error ✅ 
**Issue**: `userId` attribute not found
**Fixed**: Changed query from `userId` to `user_id` in vocabulary service

### 3. Text Component Error 
**Issue**: Raw text not wrapped in `<Text>` component
**Need to check**: All screens for unwrapped text strings

### 4. Encrypted Grades Support ✅
**Issue**: Grades encrypted in cloud from web app
**Solution**: Created encryption utilities in `/utils/encryption.js`

### 5. Reference Errors
**Issue**: Properties don't exist on objects
**Need**: Better null checking and fallbacks

## 🚀 Next Steps:

### Immediate Fix (SDK Version):
```bash
npm uninstall appwrite
npm install appwrite@13.0.2
```

### Update Collection Schema:
If using Appwrite collections, ensure attributes match:
- `user_id` (not `userId`) for user references
- Proper data types for all fields
- Correct permissions set

### Install Encryption Dependency:
```bash
npm install crypto-js
```

### Test Encryption:
```javascript
import { decryptGrades } from '../utils/encryption';
// Use decryptGrades(grades) when loading from cloud
```

## ✅ Status After Fixes:
- SDK version compatibility resolved
- Vocabulary queries working
- Grade encryption/decryption ready
- Better error handling

**Priority: Fix SDK version first, then test app functionality!** 🎯