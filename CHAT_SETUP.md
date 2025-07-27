# Team Chat Setup Guide

## 📦 Appwrite Database Setup

To enable team chat functionality, you need to create a `messages` collection in your Appwrite database.

### 1. Create Messages Collection

In your Appwrite Console:
1. Go to **Database** → **Collections**
2. Click **Create Collection**
3. Name: `messages`
4. Collection ID: `messages`

### 2. Add Attributes

Add these attributes to the `messages` collection:

```javascript
// Required attributes
teamId: string (required, size: 255)
userId: string (required, size: 255) 
content: string (required, size: 2000)
createdAt: string (required, size: 255)
updatedAt: string (required, size: 255)
```

### 3. Set Permissions

Set these permissions for the `messages` collection:

**Read Access:**
- `users` (any authenticated user can read messages from teams they're members of)

**Write Access:**
- `users` (any authenticated user can create messages)

**Update Access:**
- `users` (users can update their own messages)

**Delete Access:**
- `users` (users can delete their own messages)

### 4. Create Indexes (Optional but Recommended)

For better performance, create these indexes:

1. **teamId_index**
   - Type: Key
   - Attribute: `teamId`
   - Order: ASC

2. **createdAt_index**
   - Type: Key  
   - Attribute: `createdAt`
   - Order: DESC

## 🚀 Features

### ✅ Real-time Chat
- Send and receive messages in team channels
- Automatic scrolling to latest messages
- Message timestamps and sender information

### ✅ Member Management
- Add members to teams by email
- View team member list with roles
- Owner-only member management

### ✅ Database Integration
- Messages saved to Appwrite database
- Proper access control and permissions
- Error handling for missing collections

## 📋 Usage

### Team Chat Component

```tsx
import TeamChat from '@/components/TeamChat';

// In your team page
<TeamChat teamId={teamId} />
```

### Member Management Functions

```typescript
import { addTeamMember, getTeamMessages, sendTeamMessage } from '@/lib/teams-simple';

// Add a member
await addTeamMember(teamId, ownerId, 'user@example.com');

// Get messages  
const messages = await getTeamMessages(teamId, userId);

// Send message
await sendTeamMessage(teamId, userId, 'Hello team!');
```

## 🔧 Next Steps

1. **Create the `messages` collection** in your Appwrite database
2. **Add the chat component** to your team pages
3. **Test the functionality** by sending messages
4. **Customize the UI** to match your design

The chat system is now ready to use with proper cloud storage and real-time messaging capabilities!