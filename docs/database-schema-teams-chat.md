# Teams & Realtime Chat - Appwrite Database Schema

## Collections Required

### 1. **teams** Collection
**Collection ID:** `teams`
**Permissions:** 
- Read: `role:member`, `role:admin`
- Write: `role:admin`
- Update: `role:admin`
- Delete: `role:admin`

#### Attributes:
| Attribute | Type | Size | Required | Default | Description |
|-----------|------|------|----------|---------|-------------|
| `name` | String | 100 | ✅ | - | Team name |
| `description` | String | 500 | ❌ | - | Team description |
| `owner` | String | 50 | ✅ | - | Team owner's user ID |
| `isPublic` | Boolean | - | ✅ | false | Whether team is public or private |
| `avatar` | String | 255 | ❌ | - | Team avatar URL |
| `maxMembers` | Integer | - | ✅ | 50 | Maximum team members |
| `memberCount` | Integer | - | ✅ | 1 | Current member count |
| `createdAt` | DateTime | - | ✅ | now() | Creation timestamp |
| `updatedAt` | DateTime | - | ✅ | now() | Last update timestamp |

#### Indexes:
- `owner` (key)
- `isPublic` (key)
- `createdAt` (key)

---

### 2. **team_members** Collection
**Collection ID:** `team_members`
**Permissions:**
- Read: `role:member`
- Write: `role:admin`, `role:owner`
- Update: `role:admin`, `role:owner`
- Delete: `role:admin`, `role:owner`

#### Attributes:
| Attribute | Type | Size | Required | Default | Description |
|-----------|------|------|----------|---------|-------------|
| `teamId` | String | 50 | ✅ | - | Reference to teams collection |
| `userId` | String | 50 | ✅ | - | User ID of the member |
| `userEmail` | String | 255 | ✅ | - | User email (for invitations) |
| `userName` | String | 100 | ✅ | - | User display name |
| `role` | String | 20 | ✅ | member | Role: owner, admin, member |
| `status` | String | 20 | ✅ | pending | Status: pending, active, inactive |
| `invitedBy` | String | 50 | ✅ | - | User ID who sent invitation |
| `joinedAt` | DateTime | - | ❌ | - | When user joined |
| `invitedAt` | DateTime | - | ✅ | now() | When invitation was sent |
| `lastActive` | DateTime | - | ❌ | - | Last activity timestamp |

#### Indexes:
- `teamId` (key)
- `userId` (key)
- `userEmail` (key)
- `status` (key)
- `teamId_userId` (unique composite)

---

### 3. **chat_channels** Collection
**Collection ID:** `chat_channels`
**Permissions:**
- Read: `role:member`
- Write: `role:admin`, `role:owner`
- Update: `role:admin`, `role:owner`
- Delete: `role:admin`, `role:owner`

#### Attributes:
| Attribute | Type | Size | Required | Default | Description |
|-----------|------|------|----------|---------|-------------|
| `teamId` | String | 50 | ✅ | - | Reference to teams collection |
| `name` | String | 50 | ✅ | - | Channel name (e.g., "general") |
| `description` | String | 200 | ❌ | - | Channel description |
| `type` | String | 20 | ✅ | text | Channel type: text, voice, announcement |
| `isPrivate` | Boolean | - | ✅ | false | Private channel or not |
| `createdBy` | String | 50 | ✅ | - | User ID who created channel |
| `messageCount` | Integer | - | ✅ | 0 | Total messages in channel |
| `lastMessageAt` | DateTime | - | ❌ | - | Timestamp of last message |
| `lastMessageId` | String | 50 | ❌ | - | ID of last message |
| `createdAt` | DateTime | - | ✅ | now() | Creation timestamp |

#### Indexes:
- `teamId` (key)
- `type` (key)
- `isPrivate` (key)
- `lastMessageAt` (key)

---

### 4. **chat_messages** Collection
**Collection ID:** `chat_messages`
**Permissions:**
- Read: `role:member`
- Write: `role:member`
- Update: `users:{userId}` (own messages only)
- Delete: `role:admin`, `role:owner`, `users:{userId}`

#### Attributes:
| Attribute | Type | Size | Required | Default | Description |
|-----------|------|------|----------|---------|-------------|
| `channelId` | String | 50 | ✅ | - | Reference to chat_channels |
| `channelId` | String | 50 | ✅ | - | Reference to teams (for easier queries) |
| `userId` | String | 50 | ✅ | - | Message sender's user ID |
| `userName` | String | 100 | ✅ | - | Sender's display name |
| `userAvatar` | String | 255 | ❌ | - | Sender's avatar URL |
| `content` | String | 2000 | ✅ | - | Message content |
| `type` | String | 20 | ✅ | text | Message type: text, image, file, system |
| `attachments` | String | 1000 | ❌ | - | JSON array of file attachments |
| `replyToId` | String | 50 | ❌ | - | ID of message being replied to |
| `isEdited` | Boolean | - | ✅ | false | Whether message was edited |
| `editedAt` | DateTime | - | ❌ | - | When message was last edited |
| `createdAt` | DateTime | - | ✅ | now() | Message timestamp |

#### Indexes:
- `channelId` (key)
- `teamId` (key)
- `userId` (key)
- `createdAt` (key)
- `replyToId` (key)
- `channelId_createdAt` (composite for pagination)

---

### 5. **team_invitations** Collection
**Collection ID:** `team_invitations`
**Permissions:**
- Read: `users:{invitedUserId}`, `role:admin`
- Write: `role:admin`, `role:owner`
- Update: `users:{invitedUserId}`, `role:admin`
- Delete: `role:admin`, `role:owner`

#### Attributes:
| Attribute | Type | Size | Required | Default | Description |
|-----------|------|------|----------|---------|-------------|
| `teamId` | String | 50 | ✅ | - | Reference to teams collection |
| `teamName` | String | 100 | ✅ | - | Team name (for display) |
| `invitedEmail` | String | 255 | ✅ | - | Email of invited user |
| `invitedUserId` | String | 50 | ❌ | - | User ID if user exists |
| `invitedBy` | String | 50 | ✅ | - | User ID who sent invitation |
| `inviterName` | String | 100 | ✅ | - | Name of person who sent invite |
| `role` | String | 20 | ✅ | member | Proposed role: admin, member |
| `status` | String | 20 | ✅ | pending | Status: pending, accepted, declined, expired |
| `message` | String | 500 | ❌ | - | Optional invitation message |
| `token` | String | 255 | ✅ | - | Unique invitation token |
| `expiresAt` | DateTime | - | ✅ | - | Invitation expiry (7 days) |
| `respondedAt` | DateTime | - | ❌ | - | When invitation was responded to |
| `createdAt` | DateTime | - | ✅ | now() | Creation timestamp |

#### Indexes:
- `teamId` (key)
- `invitedEmail` (key)
- `invitedUserId` (key)
- `token` (unique)
- `status` (key)
- `expiresAt` (key)

---

### 6. **message_reactions** Collection (Optional)
**Collection ID:** `message_reactions`
**Permissions:**
- Read: `role:member`
- Write: `role:member`
- Delete: `users:{userId}`

#### Attributes:
| Attribute | Type | Size | Required | Default | Description |
|-----------|------|------|----------|---------|-------------|
| `messageId` | String | 50 | ✅ | - | Reference to chat_messages |
| `userId` | String | 50 | ✅ | - | User who reacted |
| `emoji` | String | 10 | ✅ | - | Emoji reaction (👍, ❤️, 😂, etc.) |
| `createdAt` | DateTime | - | ✅ | now() | Reaction timestamp |

#### Indexes:
- `messageId` (key)
- `userId` (key)
- `messageId_userId_emoji` (unique composite)

---

## Realtime Configuration

### Subscriptions Setup:
```javascript
// Subscribe to team messages
client.subscribe([
  'databases.{databaseId}.collections.chat_messages.documents',
  'databases.{databaseId}.collections.team_members.documents'
], (response) => {
  // Handle realtime updates
});

// Channel-specific subscription
client.subscribe([
  'databases.{databaseId}.collections.chat_messages.documents'
], (response) => {
  if (response.payload.channelId === currentChannelId) {
    // Update UI with new message
  }
});
```

### Security Rules:
```javascript
// teams collection
// Read: any team member
// Write: team owner/admin only

// chat_messages collection  
// Read: team members only
// Write: team members only
// Update: message author only
// Delete: message author or team admin

// team_members collection
// Read: team members
// Write: team owner/admin
// Update: team owner/admin
// Delete: team owner/admin or self
```

---

## Key Features Enabled:

✅ **Team Management**
- Create/join teams
- Role-based permissions
- Member management

✅ **Realtime Chat**
- Multiple channels per team
- Message history
- File attachments support

✅ **Invitations System**
- Email-based invitations
- Token-based security
- Expiration handling

✅ **User Experience**
- Message reactions
- Reply threading
- Edit/delete messages
- Typing indicators (via realtime)

✅ **Security**
- Team-based permissions
- Role-based access control
- Invitation token security

This schema supports a full-featured team chat application with realtime messaging, proper security, and scalable architecture.