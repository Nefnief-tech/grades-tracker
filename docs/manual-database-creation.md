# 🔧 Manual Analytics Database Creation Guide

## 📋 Step-by-Step Manual Setup in Appwrite Console

### Prerequisites
1. Go to [Appwrite Console](https://cloud.appwrite.io/console)
2. Navigate to your project: **Grade Tracker V2**
3. Go to **Databases** → Select database `67d6b079002144822b5e`

---

## 📊 Collection 1: user_sessions

### Basic Settings
- **Collection ID:** `user_sessions`
- **Collection Name:** `User Sessions`
- **Permissions:** 
  - Read: `role:admin`
  - Write: `users`

### Attributes (9 total)

| #  | Key         | Type     | Size | Required | Default | Description |
|----|-------------|----------|------|----------|---------|-------------|
| 1  | userId      | String   | 255  | ✅ Yes   | -       | User identifier |
| 2  | sessionId   | String   | 255  | ✅ Yes   | -       | Unique session ID |
| 3  | userAgent   | String   | 500  | ❌ No    | -       | Browser/device info |
| 4  | ipAddress   | String   | 45   | ❌ No    | -       | User's IP address |
| 5  | location    | String   | 255  | ❌ No    | -       | Geographic location |
| 6  | device      | String   | 100  | ❌ No    | -       | Device type |
| 7  | startTime   | DateTime | -    | ✅ Yes   | -       | Session start time |
| 8  | endTime     | DateTime | -    | ❌ No    | -       | Session end time |
| 9  | duration    | Integer  | -    | ❌ No    | -       | Duration in seconds |

### Indexes
- **Index 1:** 
  - Key: `userId_index`
  - Type: `key`
  - Attributes: `userId`

---

## 📊 Collection 2: user_activities

### Basic Settings
- **Collection ID:** `user_activities`
- **Collection Name:** `User Activities`
- **Permissions:** 
  - Read: `role:admin`
  - Write: `users`

### Attributes (8 total)

| #  | Key         | Type     | Size | Required | Default | Description |
|----|-------------|----------|------|----------|---------|-------------|
| 1  | userId      | String   | 255  | ✅ Yes   | -       | User identifier |
| 2  | sessionId   | String   | 255  | ✅ Yes   | -       | Session reference |
| 3  | action      | String   | 100  | ✅ Yes   | -       | Action performed |
| 4  | category    | String   | 50   | ✅ Yes   | -       | Action category |
| 5  | page        | String   | 255  | ✅ Yes   | -       | Current page |
| 6  | metadata    | String   | 1000 | ❌ No    | -       | Additional data |
| 7  | timestamp   | DateTime | -    | ✅ Yes   | -       | Action time |
| 8  | timeSpent   | Integer  | -    | ❌ No    | -       | Time on action |

### Indexes
- **Index 1:** 
  - Key: `userId_timestamp_index`
  - Type: `key`
  - Attributes: `userId`, `timestamp`

---

## 📊 Collection 3: page_views

### Basic Settings
- **Collection ID:** `page_views`
- **Collection Name:** `Page Views`
- **Permissions:** 
  - Read: `role:admin`
  - Write: `users`

### Attributes (7 total)

| #  | Key         | Type     | Size | Required | Default | Description |
|----|-------------|----------|------|----------|---------|-------------|
| 1  | userId      | String   | 255  | ✅ Yes   | -       | User identifier |
| 2  | sessionId   | String   | 255  | ✅ Yes   | -       | Session reference |
| 3  | path        | String   | 500  | ✅ Yes   | -       | Page URL path |
| 4  | title       | String   | 255  | ❌ No    | -       | Page title |
| 5  | referrer    | String   | 500  | ❌ No    | -       | Previous page |
| 6  | timestamp   | DateTime | -    | ✅ Yes   | -       | Page view time |
| 7  | duration    | Integer  | -    | ❌ No    | -       | Time on page |

### Indexes
- **Index 1:** 
  - Key: `path_timestamp_index`
  - Type: `key`
  - Attributes: `path`, `timestamp`

---

## 📊 Collection 4: performance_metrics

### Basic Settings
- **Collection ID:** `performance_metrics`
- **Collection Name:** `Performance Metrics`
- **Permissions:** 
  - Read: `role:admin`
  - Write: `users`

### Attributes (8 total)

| #  | Key            | Type     | Size | Required | Default | Description |
|----|----------------|----------|------|----------|---------|-------------|
| 1  | userId         | String   | 255  | ✅ Yes   | -       | User identifier |
| 2  | sessionId      | String   | 255  | ✅ Yes   | -       | Session reference |
| 3  | page           | String   | 255  | ✅ Yes   | -       | Page measured |
| 4  | loadTime       | Float    | -    | ✅ Yes   | -       | Page load time |
| 5  | renderTime     | Float    | -    | ❌ No    | -       | Render time |
| 6  | networkTime    | Float    | -    | ❌ No    | -       | Network time |
| 7  | connectionType | String   | 50   | ❌ No    | -       | Connection type |
| 8  | timestamp      | DateTime | -    | ✅ Yes   | -       | Measurement time |

### Indexes
- **No indexes needed** (performance collection)

---

## 📊 Collection 5: error_logs

### Basic Settings
- **Collection ID:** `error_logs`
- **Collection Name:** `Error Logs`
- **Permissions:** 
  - Read: `role:admin`
  - Write: `users`

### Attributes (8 total)

| #  | Key          | Type     | Size | Required | Default | Description |
|----|--------------|----------|------|----------|---------|-------------|
| 1  | userId       | String   | 255  | ❌ No    | -       | User identifier |
| 2  | sessionId    | String   | 255  | ❌ No    | -       | Session reference |
| 3  | errorType    | String   | 100  | ✅ Yes   | -       | Error type |
| 4  | errorMessage | String   | 1000 | ✅ Yes   | -       | Error description |
| 5  | stack        | String   | 2000 | ❌ No    | -       | Error stack trace |
| 6  | page         | String   | 255  | ✅ Yes   | -       | Error location |
| 7  | userAgent    | String   | 500  | ❌ No    | -       | Browser info |
| 8  | timestamp    | DateTime | -    | ✅ Yes   | -       | Error time |

### Indexes
- **No indexes needed** (error collection)

---

## 📊 Collection 6: feature_usage

### Basic Settings
- **Collection ID:** `feature_usage`
- **Collection Name:** `Feature Usage`
- **Permissions:** 
  - Read: `role:admin`
  - Write: `users`

### Attributes (7 total)

| #  | Key         | Type     | Size | Required | Default | Description |
|----|-------------|----------|------|----------|---------|-------------|
| 1  | userId      | String   | 255  | ✅ Yes   | -       | User identifier |
| 2  | sessionId   | String   | 255  | ✅ Yes   | -       | Session reference |
| 3  | feature     | String   | 100  | ✅ Yes   | -       | Feature name |
| 4  | action      | String   | 100  | ✅ Yes   | -       | Action taken |
| 5  | count       | Integer  | -    | ❌ No    | 1       | Usage count |
| 6  | metadata    | String   | 1000 | ❌ No    | -       | Additional data |
| 7  | timestamp   | DateTime | -    | ✅ Yes   | -       | Usage time |

### Indexes
- **Index 1:** 
  - Key: `feature_timestamp_index`
  - Type: `key`
  - Attributes: `feature`, `timestamp`

---

## 🔧 Detailed Creation Steps

### For Each Collection:

#### Step 1: Create Collection
1. Click **"Create Collection"**
2. Enter **Collection ID** (exactly as shown above)
3. Enter **Collection Name**
4. Click **"Create"**

#### Step 2: Set Permissions
1. Go to **Settings** tab
2. Click **"Update Permissions"**
3. Add permissions:
   - **Read:** `role:admin`
   - **Write:** `role:admin` or `users` (as specified)
4. Click **"Update"**

#### Step 3: Add Attributes
1. Go to **Attributes** tab
2. Click **"Create Attribute"**
3. For each attribute:
   - Select **Type** (String/Integer/DateTime/Float)
   - Enter **Key** (exactly as shown)
   - Set **Size** (for strings only)
   - Check **Required** if marked ✅
   - Set **Default** if specified
   - Click **"Create"**

#### Step 4: Add Indexes (if specified)
1. Go to **Indexes** tab
2. Click **"Create Index"**
3. Enter **Key** name
4. Select **Type**: `key`
5. Select **Attributes** (can select multiple)
6. Click **"Create"**

---

## ✅ Verification Checklist

After creating all collections, verify:

- [ ] **6 collections created** with correct IDs
- [ ] **All attributes added** with correct types and sizes
- [ ] **Permissions set correctly** (admin read, users/admin write)
- [ ] **Indexes created** where specified
- [ ] **Required fields marked** as required
- [ ] **Default values set** where specified

---

## 🎯 Collection Summary

| Collection           | Attributes | Indexes | Read Perm   | Write Perm  |
|---------------------|------------|---------|-------------|-------------|
| user_sessions       | 9          | 1       | role:admin  | users       |
| user_activities     | 8          | 1       | role:admin  | users       |
| page_views          | 7          | 1       | role:admin  | users       |
| performance_metrics | 8          | 0       | role:admin  | users       |
| error_logs          | 8          | 0       | role:admin  | users       |
| feature_usage       | 7          | 1       | role:admin  | users       |

**Total:** 47 attributes, 4 indexes across 6 collections

---

## 🕒 Estimated Time

- **Per Collection:** 3-5 minutes
- **Total Time:** 20-30 minutes
- **Verification:** 5 minutes

This manual method gives you full control and immediate visual feedback for each step! 🎯