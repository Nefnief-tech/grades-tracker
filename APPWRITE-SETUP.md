# 🚀 Appwrite Setup Guide for Grade Tracker

## ⚠️ IMPORTANT: Complete Setup Required

The Grade Tracker app is currently configured with example Appwrite IDs that need to be replaced with your actual project details.

## 📋 Quick Setup Steps

### 1. Create Appwrite Project
1. Go to [Appwrite Console](https://cloud.appwrite.io/console)
2. Click "Create Project"
3. Name: "Grade Tracker" 
4. Copy your **Project ID**

### 2. Configure Project ID
Edit `src/services/appwrite-complete.js`:
```javascript
const PROJECT_ID = 'YOUR_ACTUAL_PROJECT_ID'; // Replace this!
```

### 3. Create Database & Collections

#### Create Database:
1. Go to **Databases** → **Create Database**
2. Name: "GradeTracker"
3. Copy the **Database ID**

#### Create Collections:

**A) Subjects Collection:**
```
Name: subjects
Attributes:
- name (string, required)
- target_grade (float, optional)  
- userId (string, required)
- date_created (datetime, required)
- date_updated (datetime, required)
```

**B) Grades Collection:**
```
Name: grades
Attributes:
- name (string, required)
- score (float, required)
- weight (float, required, default: 1)
- subject_id (string, required)
- userId (string, required)
- notes (string, optional)
- date_created (datetime, required)
- date_updated (datetime, required)
```

**C) Vocabulary Collection:**
```
Name: vocabulary
Attributes:
- word (string, required)
- type (string, required)
- difficulty (integer, required)
- confidence (float, required)
- compounds (string, optional)
- source_image_id (string, optional)
- source_text (string, optional)
- extraction_method (string, required)
- language (string, required, default: "de")
- verified (boolean, required, default: false)
- userId (string, required)
- date_created (datetime, required)
```

### 4. Set Collection Permissions

For each collection, set these permissions:
- **Create**: `users`
- **Read**: `users` 
- **Update**: `users`
- **Delete**: `users`

### 5. Create Storage Bucket

1. Go to **Storage** → **Create Bucket**
2. Name: "images"
3. Max file size: 10MB
4. Allowed file types: `jpg,jpeg,png`
5. Permissions:
   - **Create**: `users`
   - **Read**: `users`
   - **Delete**: `users`

### 6. Update Configuration

Edit `src/services/appwrite-complete.js` with your actual IDs:

```javascript
const PROJECT_ID = '674ea5c2003be8b4994b'; // Your actual Project ID
export const DATABASE_ID = '674ea5c3001d8f2a8c1a'; // Your Database ID
export const SUBJECTS_COLLECTION_ID = '674ea5c30039c7b2f456'; // Subjects Collection ID
export const GRADES_COLLECTION_ID = '674ea5c30052a8c3d789'; // Grades Collection ID  
export const VOCABULARY_COLLECTION_ID = '674ea5c3006b39d4e012'; // Vocabulary Collection ID
export const BUCKET_ID = '674ea5c30084faef234'; // Storage Bucket ID
```

### 7. Test Authentication

The app includes authentication screens. Users can:
- Register new accounts
- Login with email/password
- Data is automatically filtered by user

## 🔧 Alternative: Use Local Storage (Development)

If you want to test without Appwrite, you can:
1. Copy `App.js` over `App-appwrite.js`
2. Use the original local storage version
3. Set up Appwrite later for production

## 🎯 Verification Steps

Once configured:
1. Run the app
2. Register a new user
3. Add a subject
4. Add a grade
5. Check data appears in Appwrite console

## 🆘 Troubleshooting

**"Project not found" error:**
- Double-check Project ID in `appwrite-complete.js`
- Ensure project exists in Appwrite console

**"Collection not found" error:**
- Verify all Collection IDs are correct
- Check collections exist in your database

**"Attribute not found" error:**
- Ensure all attributes are created exactly as specified
- Check attribute names match (case-sensitive)

**Authentication issues:**
- Verify Auth service is enabled in Appwrite
- Check user permissions on collections

## 📞 Need Help?

1. Check Appwrite documentation: https://appwrite.io/docs
2. Verify IDs in Appwrite console
3. Test with Appwrite's built-in API explorer

Once setup is complete, you'll have a fully functional grade tracking app with:
- ✅ Real-time cloud sync
- ✅ User authentication
- ✅ Image-based vocabulary extraction
- ✅ Advanced analytics
- ✅ Grade predictions