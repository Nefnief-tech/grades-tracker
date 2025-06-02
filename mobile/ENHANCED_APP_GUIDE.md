# Enhanced Mobile App - User Guide

## 🚀 **What's New**

Your Grade Tracker mobile app now has **full encryption integration** with the web app! This means you can securely sync your grades between platforms.

## 📱 **Main Features**

### **🔐 Secure Sync**
- Enter your password to sync grades from the web app
- Automatic encryption conversion (web format → mobile format)
- Two-way sync: changes sync back to web app

### **📊 Grade Management**
- View all your subjects and grades
- Add new grades with automatic sync
- Color-coded grades (Green=Good, Orange=OK, Red=Poor)
- Achievement notifications for excellent grades

### **🧪 Testing & Validation**
- Test encryption functionality
- Check API connectivity status
- Validate data integrity
- Monitor sync operations

## 🎯 **How to Use**

### **1. First Time Setup**
1. Open the app
2. You'll see "Connected to Web App ✅" or "Offline Mode ⚠️"
3. Enter your web app password in the sync section

### **2. Sync Your Grades**
1. Enter your password
2. Tap **"🔄 Sync Grades"**
3. Your web app grades will be downloaded and decrypted
4. View your subjects and grades in the summary

### **3. Add New Grades**
1. Tap **"📱 View All Features"** to see grade management
2. Or use the integrated grade manager (if available)
3. Select subject → Add grade → It syncs back to web app

### **4. Test Encryption**
1. Enter your password
2. Tap **"🧪 Test"**
3. See encryption validation results
4. Confirms everything is working correctly

## 🔧 **Technical Details**

### **Encryption Process**
```
Web App (Complex AES-256-GCM)
    ↓ API converts
Mobile App (Simple Base64 + User ID Key)
```

### **API Endpoints Used**
- `POST /api/grades/mobile-decrypt` - Convert web → mobile
- `POST /api/grades/mobile-encrypt` - Convert mobile → web  
- `POST /api/grades/test-mobile-decrypt` - Test functionality

### **Offline Capability**
- Works without internet connection
- Uses sample data for demonstration
- Caches synced data for offline use
- Automatic fallback if sync fails

## 🎨 **User Interface**

### **Main Screen Sections**

**📊 Current Grades**
- Shows subject count, total grades, average
- Horizontal scroll of subjects
- Live statistics

**🔐 Encryption & Sync**
- Password input for sync
- Sync and Test buttons
- Connection status display

**📡 API Status**
- Real-time connectivity indicator
- Refresh API status button
- Detailed status information

**🧪 Test Results**
- Last encryption test results
- Success/failure indicators
- Error details if issues occur

## 🚨 **Troubleshooting**

### **"Offline Mode" Status**
- Web app API is not running
- App uses sample data instead
- Start your web app to enable sync

### **Sync Fails**
- Check password is correct
- Ensure web app is running on localhost:3000
- App continues with local data

### **Encryption Test Fails**
- Normal if API is offline
- App shows detailed error message
- Sample data still works for testing

### **No Grades Showing**
- Enter password and sync first
- Or view sample data for demonstration
- Check API connectivity status

## 💡 **Tips**

### **For Developers**
- Check console logs for detailed debugging
- API calls show full request/response info
- Encryption service has extensive error handling
- Test with sample data first

### **For Users**
- Always sync before adding new grades
- Password must match your web app account
- Good grades (≤2.0) trigger achievement notifications
- App works offline once initial sync is done

## 🔄 **Sync Flow**

1. **Enter Password** → Authenticate with web app
2. **Sync Grades** → Download & decrypt from web app  
3. **View/Edit** → Manage grades in mobile app
4. **Auto-Sync** → Changes automatically sync back
5. **Offline Use** → Cached data available without internet

## 📈 **Data Flow**

```
You Add Grade → Mobile Encryption → API → Web Encryption → Web App Database
You View Grades ← Mobile Decryption ← API ← Web Decryption ← Web App Database
```

Your mobile app is now a **full-featured companion** to your web application with **secure, seamless synchronization**! 🎉