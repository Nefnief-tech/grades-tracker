# Appwrite Collections Setup Guide

## Required Collections for Teams & Chat

You need to create these collections in your Appwrite console. Here's the exact configuration for each:

---

## 1. Create `teams` Collection

### Collection Settings:
- **Collection ID:** `teams`
- **Collection Name:** Teams

### Attributes:
```
1. name (String, 100 chars, Required)
2. description (String, 500 chars, Optional)
3. owner (String, 50 chars, Required)
4. isPublic (Boolean, Required, Default: false)
5. avatar (String, 255 chars, Optional)
6. maxMembers (Integer, Required, Default: 50)
7. memberCount (Integer, Required, Default: 1)
8. createdAt (DateTime, Required)
9. updatedAt (DateTime, Required)
```

### Indexes:
- `owner` (key index)
- `isPublic` (key index)
- `createdAt` (key index)

---

## 2. Create `team_members` Collection

### Collection Settings:
- **Collection ID:** `team_members`
- **Collection Name:** Team Members

### Attributes:
```
1. teamId (String, 50 chars, Required)
2. userId (String, 50 chars, Required)
3. userEmail (String, 255 chars, Required)
4. userName (String, 100 chars, Required)
5. role (String, 20 chars, Required, Default: "member")
6. status (String, 20 chars, Required, Default: "pending")
7. invitedBy (String, 50 chars, Required)
8. joinedAt (DateTime, Optional)
9. invitedAt (DateTime, Required)
10. lastActive (DateTime, Optional)
```

### Indexes:
- `teamId` (key index)
- `userId` (key index)
- `userEmail` (key index)
- `status` (key index)
- `teamId_userId` (unique composite index)

---

## 3. Create `chat_channels` Collection

### Collection Settings:
- **Collection ID:** `chat_channels`
- **Collection Name:** Chat Channels

### Attributes:
```
1. teamId (String, 50 chars, Required)
2. name (String, 50 chars, Required)
3. description (String, 200 chars, Optional)
4. type (String, 20 chars, Required, Default: "text")
5. isPrivate (Boolean, Required, Default: false)
6. createdBy (String, 50 chars, Required)
7. messageCount (Integer, Required, Default: 0)
8. lastMessageAt (DateTime, Optional)
9. lastMessageId (String, 50 chars, Optional)
10. createdAt (DateTime, Required)
```

### Indexes:
- `teamId` (key index)
- `type` (key index)
- `isPrivate` (key index)
- `lastMessageAt` (key index)

---

## 4. Create `chat_messages` Collection

### Collection Settings:
- **Collection ID:** `chat_messages`
- **Collection Name:** Chat Messages

### Attributes:
```
1. channelId (String, 50 chars, Required)
2. teamId (String, 50 chars, Required)
3. userId (String, 50 chars, Required)
4. userName (String, 100 chars, Required)
5. userAvatar (String, 255 chars, Optional)
6. content (String, 2000 chars, Required)
7. type (String, 20 chars, Required, Default: "text")
8. attachments (String, 1000 chars, Optional)
9. replyToId (String, 50 chars, Optional)
10. isEdited (Boolean, Required, Default: false)
11. editedAt (DateTime, Optional)
12. createdAt (DateTime, Required)
```

### Indexes:
- `channelId` (key index)
- `teamId` (key index)
- `userId` (key index)
- `createdAt` (key index)
- `replyToId` (key index)
- `channelId_createdAt` (composite index for pagination)

---

## Quick Setup Steps:

1. **Go to your Appwrite Console**
2. **Navigate to Databases → [Your Database]**
3. **Click "Create Collection"**
4. **For each collection above:**
   - Set the Collection ID and Name
   - Add all attributes with exact types and settings
   - Create the specified indexes
   - Set permissions (for now, allow all authenticated users)

## Test Setup:

After creating collections, test with this simple script in your browser console:

```javascript
// Test if collections exist
const testCollections = async () => {
  try {
    console.log('Testing collections...');
    
    // This will fail if collections don't exist
    await databases.listDocuments('YOUR_DATABASE_ID', 'teams', []);
    await databases.listDocuments('YOUR_DATABASE_ID', 'team_members', []);
    await databases.listDocuments('YOUR_DATABASE_ID', 'chat_channels', []);
    await databases.listDocuments('YOUR_DATABASE_ID', 'chat_messages', []);
    
    console.log('✅ All collections exist!');
  } catch (error) {
    console.error('❌ Missing collection:', error.message);
  }
};

testCollections();
```

## Common Issues:

1. **"Invalid document structure"** → Collection or attribute doesn't exist
2. **"Missing required attribute"** → Attribute not marked as required
3. **"Permission denied"** → Check collection permissions
4. **"Collection not found"** → Wrong collection ID or not created

Once you create these collections, your team creation should work perfectly!