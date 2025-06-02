# 🚀 Complete Appwrite Setup for Grade Tracker

## 🎯 Quick Setup (5 minutes)

### Step 1: Create Appwrite Project
1. Go to [Appwrite Console](https://cloud.appwrite.io/console)
2. Click **"Create Project"**
3. Name: **"Grade Tracker"**
4. Copy your **Project ID** (looks like: `6754c8ae002e45b2a3f8`)

### Step 2: Get API Key
1. In your project, go to **Settings** → **API Keys**
2. Click **"Create API Key"**
3. Name: **"Setup Key"**
4. Scopes: Select **ALL** (databases.write, storage.write, etc.)
5. Copy the **API Key**

### Step 3: Update Configuration
Edit `f:\grade-tracker-v2\mobile\src\services\appwrite-complete.js`:
```javascript
const PROJECT_ID = 'YOUR_ACTUAL_PROJECT_ID'; // Replace with your Project ID
```

### Step 4: Run Setup Script
1. Edit `f:\grade-tracker-v2\setup-appwrite.js`:
   ```javascript
   .setProject('YOUR_PROJECT_ID') // Replace with your Project ID
   .setKey('YOUR_API_KEY'); // Replace with your API Key
   ```

2. Run the setup:
   ```bash
   cd f:\grade-tracker-v2
   node setup-appwrite.js
   ```

3. Copy the generated Collection IDs and update `appwrite-complete.js`

### Step 5: Enable Auth (Optional)
1. Go to **Auth** in Appwrite Console
2. Enable **Email/Password** authentication
3. Set session length to **30 days**

## 🎉 That's It!

Your app will now have:
- ✅ **Real-time cloud sync**
- ✅ **User authentication** 
- ✅ **Secure data storage**
- ✅ **Image uploads** for vocabulary
- ✅ **Multi-device access**

## 🔧 Manual Setup (Alternative)

If the script doesn't work, create manually:

### Database: "GradeTracker"

### Collections:

**1. Subjects Collection:**
```
- name (string, required, 100 chars)
- target_grade (float, optional)
- userId (string, required, 50 chars)
- date_created (datetime, required)
- date_updated (datetime, required)
```

**2. Grades Collection:**
```
- name (string, required, 100 chars)
- score (float, required)
- weight (float, required, default: 1.0)
- subject_id (string, required, 50 chars)
- userId (string, required, 50 chars)
- notes (string, optional, 500 chars)
- date_created (datetime, required)
- date_updated (datetime, required)
```

**3. Vocabulary Collection:**
```
- word (string, required, 100 chars)
- type (string, required, 50 chars)
- difficulty (integer, required)
- confidence (float, required)
- compounds (string, optional, 500 chars)
- source_image_id (string, optional, 50 chars)
- source_text (string, optional, 1000 chars)
- extraction_method (string, required, 50 chars)
- language (string, required, 10 chars, default: "de")
- verified (boolean, required, default: false)
- userId (string, required, 50 chars)
- date_created (datetime, required)
```

### Storage Bucket: "images"
- Max size: 10MB
- Allowed: jpg, jpeg, png
- Permissions: users (create, read, delete)

### Permissions for ALL Collections:
- **Create**: users
- **Read**: users
- **Update**: users  
- **Delete**: users

## 🚨 Troubleshooting

**"Project not found":**
- Check Project ID in `appwrite-complete.js`
- Ensure project exists in console

**"Collection not found":**
- Run setup script or create manually
- Verify Collection IDs match

**"Permission denied":**
- Check collection permissions include `users`
- Ensure user is authenticated

**"Attribute not found":**
- Verify all attributes are created
- Check spelling matches exactly

## 📱 Test Your Setup

1. Run the app
2. Register a new user
3. Add a subject
4. Add a grade
5. Check data in Appwrite Console

## 🎯 Production Ready!

Once setup is complete, your Grade Tracker will have:
- 🔐 **Secure authentication**
- ☁️ **Cloud data sync**
- 📱 **Cross-device access**
- 🖼️ **Image processing**
- 📊 **Real-time analytics**