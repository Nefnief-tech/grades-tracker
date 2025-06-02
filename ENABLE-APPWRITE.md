# 🔧 Switch from Demo Mode to Appwrite Mode

## Current Status: Demo Mode Active ⚠️

Your app is running in **Demo Mode** because the PROJECT_ID is set to placeholder value.

## To Enable Appwrite Integration:

### 1. Get Your Project ID
1. Go to your [Appwrite Console](https://cloud.appwrite.io/console)
2. Select your project
3. Go to **Settings** → **General**
4. Copy your **Project ID** (looks like: `67a1b2c3d4e5f6g7h8i9`)

### 2. Update Configuration
Edit: `f:\grade-tracker-v2\mobile\src\services\appwrite-complete.js`

```javascript
// Change this line:
const PROJECT_ID = 'YOUR_ACTUAL_PROJECT_ID';

// To your real Project ID:
const PROJECT_ID = '67a1b2c3d4e5f6g7h8i9'; // Your actual ID here
```

### 3. Also Update Collection IDs
Replace these with your actual IDs from Appwrite Console:

```javascript
export const DATABASE_ID = 'your_real_database_id';
export const SUBJECTS_COLLECTION_ID = 'your_real_subjects_id';
export const GRADES_COLLECTION_ID = 'your_real_grades_id';
export const VOCABULARY_COLLECTION_ID = 'your_real_vocabulary_id';
export const BUCKET_ID = 'your_real_bucket_id';
```

## ✅ After Update:
- ❌ Demo mode banner will disappear
- ✅ Real user authentication will work
- ✅ Data will sync to cloud
- ✅ Multi-device access enabled

## 🎯 Quick Verification:
Once updated, you should see:
- **Login/Register screens** instead of auto-login
- **"No authenticated user found"** becomes successful login
- **Data syncing** to Appwrite cloud

Your collections are already set up - just need to connect the Project ID! 🚀