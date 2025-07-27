# Appwrite Database Collections for User Analytics

## Collection Setup Commands

Run these commands in your terminal with Appwrite CLI:

```bash
# 1. User Sessions Collection
appwrite databases createCollection \
  --databaseId="default" \
  --collectionId="user_sessions" \
  --name="User Sessions" \
  --permissions='["read(\"role:admin\")", "write(\"role:admin\")"]'

# Add attributes to user_sessions
appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="user_sessions" \
  --key="userId" \
  --size=255 \
  --required=true

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="user_sessions" \
  --key="sessionId" \
  --size=255 \
  --required=true

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="user_sessions" \
  --key="userAgent" \
  --size=500 \
  --required=false

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="user_sessions" \
  --key="ipAddress" \
  --size=45 \
  --required=false

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="user_sessions" \
  --key="location" \
  --size=255 \
  --required=false

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="user_sessions" \
  --key="device" \
  --size=100 \
  --required=false

appwrite databases createDatetimeAttribute \
  --databaseId="default" \
  --collectionId="user_sessions" \
  --key="startTime" \
  --required=true

appwrite databases createDatetimeAttribute \
  --databaseId="default" \
  --collectionId="user_sessions" \
  --key="endTime" \
  --required=false

appwrite databases createIntegerAttribute \
  --databaseId="default" \
  --collectionId="user_sessions" \
  --key="duration" \
  --required=false

# 2. User Activities Collection
appwrite databases createCollection \
  --databaseId="default" \
  --collectionId="user_activities" \
  --name="User Activities" \
  --permissions='["read(\"role:admin\")", "write(\"users\")"]'

# Add attributes to user_activities
appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="user_activities" \
  --key="userId" \
  --size=255 \
  --required=true

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="user_activities" \
  --key="sessionId" \
  --size=255 \
  --required=true

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="user_activities" \
  --key="action" \
  --size=100 \
  --required=true

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="user_activities" \
  --key="category" \
  --size=50 \
  --required=true

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="user_activities" \
  --key="page" \
  --size=255 \
  --required=true

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="user_activities" \
  --key="metadata" \
  --size=1000 \
  --required=false

appwrite databases createDatetimeAttribute \
  --databaseId="default" \
  --collectionId="user_activities" \
  --key="timestamp" \
  --required=true

appwrite databases createIntegerAttribute \
  --databaseId="default" \
  --collectionId="user_activities" \
  --key="timeSpent" \
  --required=false

# 3. Page Views Collection
appwrite databases createCollection \
  --databaseId="default" \
  --collectionId="page_views" \
  --name="Page Views" \
  --permissions='["read(\"role:admin\")", "write(\"users\")"]'

# Add attributes to page_views
appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="page_views" \
  --key="userId" \
  --size=255 \
  --required=true

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="page_views" \
  --key="sessionId" \
  --size=255 \
  --required=true

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="page_views" \
  --key="path" \
  --size=500 \
  --required=true

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="page_views" \
  --key="title" \
  --size=255 \
  --required=false

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="page_views" \
  --key="referrer" \
  --size=500 \
  --required=false

appwrite databases createDatetimeAttribute \
  --databaseId="default" \
  --collectionId="page_views" \
  --key="timestamp" \
  --required=true

appwrite databases createIntegerAttribute \
  --databaseId="default" \
  --collectionId="page_views" \
  --key="duration" \
  --required=false

# 4. Performance Metrics Collection
appwrite databases createCollection \
  --databaseId="default" \
  --collectionId="performance_metrics" \
  --name="Performance Metrics" \
  --permissions='["read(\"role:admin\")", "write(\"users\")"]'

# Add attributes to performance_metrics
appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="performance_metrics" \
  --key="userId" \
  --size=255 \
  --required=true

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="performance_metrics" \
  --key="sessionId" \
  --size=255 \
  --required=true

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="performance_metrics" \
  --key="page" \
  --size=255 \
  --required=true

appwrite databases createFloatAttribute \
  --databaseId="default" \
  --collectionId="performance_metrics" \
  --key="loadTime" \
  --required=true

appwrite databases createFloatAttribute \
  --databaseId="default" \
  --collectionId="performance_metrics" \
  --key="renderTime" \
  --required=false

appwrite databases createFloatAttribute \
  --databaseId="default" \
  --collectionId="performance_metrics" \
  --key="networkTime" \
  --required=false

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="performance_metrics" \
  --key="connectionType" \
  --size=50 \
  --required=false

appwrite databases createDatetimeAttribute \
  --databaseId="default" \
  --collectionId="performance_metrics" \
  --key="timestamp" \
  --required=true

# 5. Error Logs Collection
appwrite databases createCollection \
  --databaseId="default" \
  --collectionId="error_logs" \
  --name="Error Logs" \
  --permissions='["read(\"role:admin\")", "write(\"users\")"]'

# Add attributes to error_logs
appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="error_logs" \
  --key="userId" \
  --size=255 \
  --required=false

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="error_logs" \
  --key="sessionId" \
  --size=255 \
  --required=false

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="error_logs" \
  --key="errorType" \
  --size=100 \
  --required=true

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="error_logs" \
  --key="errorMessage" \
  --size=1000 \
  --required=true

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="error_logs" \
  --key="stack" \
  --size=2000 \
  --required=false

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="error_logs" \
  --key="page" \
  --size=255 \
  --required=true

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="error_logs" \
  --key="userAgent" \
  --size=500 \
  --required=false

appwrite databases createDatetimeAttribute \
  --databaseId="default" \
  --collectionId="error_logs" \
  --key="timestamp" \
  --required=true

# 6. Feature Usage Collection
appwrite databases createCollection \
  --databaseId="default" \
  --collectionId="feature_usage" \
  --name="Feature Usage" \
  --permissions='["read(\"role:admin\")", "write(\"users\")"]'

# Add attributes to feature_usage
appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="feature_usage" \
  --key="userId" \
  --size=255 \
  --required=true

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="feature_usage" \
  --key="sessionId" \
  --size=255 \
  --required=true

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="feature_usage" \
  --key="feature" \
  --size=100 \
  --required=true

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="feature_usage" \
  --key="action" \
  --size=100 \
  --required=true

appwrite databases createIntegerAttribute \
  --databaseId="default" \
  --collectionId="feature_usage" \
  --key="count" \
  --required=false \
  --default=1

appwrite databases createStringAttribute \
  --databaseId="default" \
  --collectionId="feature_usage" \
  --key="metadata" \
  --size=1000 \
  --required=false

appwrite databases createDatetimeAttribute \
  --databaseId="default" \
  --collectionId="feature_usage" \
  --key="timestamp" \
  --required=true

# Create Indexes for Better Performance
appwrite databases createIndex \
  --databaseId="default" \
  --collectionId="user_sessions" \
  --key="userId_index" \
  --type="key" \
  --attributes='["userId"]'

appwrite databases createIndex \
  --databaseId="default" \
  --collectionId="user_activities" \
  --key="userId_timestamp_index" \
  --type="key" \
  --attributes='["userId", "timestamp"]'

appwrite databases createIndex \
  --databaseId="default" \
  --collectionId="page_views" \
  --key="path_timestamp_index" \
  --type="key" \
  --attributes='["path", "timestamp"]'

appwrite databases createIndex \
  --databaseId="default" \
  --collectionId="feature_usage" \
  --key="feature_timestamp_index" \
  --type="key" \
  --attributes='["feature", "timestamp"]'
```

## User Roles Setup

```bash
# Create admin role if not exists
appwrite teams create \
  --teamId="admin" \
  --name="Administrators"

# Add admin permissions for analytics
# Note: Replace USER_ID with actual admin user ID
appwrite teams createMembership \
  --teamId="admin" \
  --userId="USER_ID" \
  --roles='["admin"]'
```