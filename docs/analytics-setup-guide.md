# 📊 Advanced User Analytics System Setup Guide

This guide will help you set up the sophisticated user analytics system for your Grade Tracker application.

## 🎯 Overview

The analytics system provides:
- **Real-time user behavior tracking**
- **Performance monitoring** 
- **Error logging and analysis**
- **Feature usage statistics**
- **Admin-only dashboard** with comprehensive insights
- **Automatic data collection** with privacy compliance

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Actions  │ -> │   Analytics Hook │ -> │  Appwrite DB    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                v
                       ┌──────────────────┐
                       │   Admin Panel    │
                       └──────────────────┘
```

## 🗃️ Database Collections

### 1. `user_sessions`
Tracks user login sessions and duration.

**Attributes:**
- `userId` (string) - User identifier
- `sessionId` (string) - Unique session ID
- `userAgent` (string) - Browser information
- `ipAddress` (string) - IP address (optional)
- `device` (string) - Device type (mobile/tablet/desktop)
- `startTime` (datetime) - Session start
- `endTime` (datetime) - Session end
- `duration` (integer) - Session duration in seconds

### 2. `user_activities` 
Records all user actions and interactions.

**Attributes:**
- `userId` (string) - User identifier
- `sessionId` (string) - Session reference
- `action` (string) - Action performed
- `category` (string) - Action category
- `page` (string) - Current page/route
- `metadata` (string) - Additional data (JSON)
- `timestamp` (datetime) - When action occurred

### 3. `page_views`
Tracks page navigation and time spent.

**Attributes:**
- `userId` (string) - User identifier
- `sessionId` (string) - Session reference
- `path` (string) - Page URL/route
- `title` (string) - Page title
- `referrer` (string) - Previous page
- `duration` (integer) - Time spent on page
- `timestamp` (datetime) - Page view time

### 4. `performance_metrics`
Monitors application performance.

**Attributes:**
- `userId` (string) - User identifier
- `sessionId` (string) - Session reference
- `page` (string) - Page measured
- `loadTime` (float) - Page load time
- `renderTime` (float) - Render time
- `networkTime` (float) - Network time
- `connectionType` (string) - Connection type
- `timestamp` (datetime) - Measurement time

### 5. `error_logs`
Captures JavaScript errors and crashes.

**Attributes:**
- `userId` (string) - User identifier (optional)
- `sessionId` (string) - Session reference (optional)
- `errorType` (string) - Type of error
- `errorMessage` (string) - Error description
- `stack` (string) - Error stack trace
- `page` (string) - Page where error occurred
- `userAgent` (string) - Browser information
- `timestamp` (datetime) - Error time

### 6. `feature_usage`
Tracks specific feature adoption and usage.

**Attributes:**
- `userId` (string) - User identifier
- `sessionId` (string) - Session reference
- `feature` (string) - Feature name
- `action` (string) - Action taken
- `count` (integer) - Usage count
- `metadata` (string) - Additional data
- `timestamp` (datetime) - Usage time

## 🚀 Setup Instructions

### Step 1: Create Database Collections

Run the Appwrite CLI commands from `docs/analytics-database-setup.md`:

```bash
# Navigate to your project directory
cd grade-tracker-v2

# Run the database setup commands
# (Copy commands from analytics-database-setup.md)
```

### Step 2: Configure Admin Access

Add admin role to your user account:

```bash
# In Appwrite Console:
# 1. Go to Auth -> Teams
# 2. Create "admin" team if it doesn't exist
# 3. Add your user to the admin team with "admin" role
# 4. OR add "admin" to your user's labels
```

### Step 3: Integrate Analytics Provider

Add the analytics provider to your app layout:

```tsx
// In app/layout.tsx
import { AnalyticsProvider } from '@/components/AnalyticsProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Step 4: Use Analytics in Components

```tsx
// In any component
import { useAppAnalytics } from '@/components/AnalyticsProvider';

function MyComponent() {
  const { trackGradeAction, trackSubjectAction } = useAppAnalytics();

  const handleGradeAdd = (grade) => {
    // Your grade logic
    trackGradeAction('grade_added', { value: grade.value, subject: grade.subject });
  };

  // Component code...
}
```

## 🎛️ Admin Dashboard Access

### Routes
- `/admin` - Overview dashboard
- `/admin/analytics` - Detailed analytics
- `/admin/users` - User management (coming soon)
- `/admin/settings` - System settings (coming soon)

### Features
- **Real-time metrics** - Live user count, active sessions
- **Time-range filtering** - 1h, 24h, 7d, 30d, 90d
- **Data export** - CSV and JSON formats
- **Performance monitoring** - Load times, error rates
- **User behavior analysis** - Page views, feature usage
- **Device and browser stats** - Mobile vs desktop usage

## 📈 Tracked Events

### Automatic Tracking
- **Page views** - Every route navigation
- **Session duration** - Login to logout time
- **Performance metrics** - Page load times
- **JavaScript errors** - Automatic error capture
- **User interactions** - Button clicks, form submissions

### Manual Tracking
```tsx
const analytics = useAppAnalytics();

// Track specific actions
analytics.trackGradeAction('grade_exported', { format: 'pdf' });
analytics.trackSubjectAction('subject_created', { name: 'Math' });
analytics.trackTeamAction('team_joined', { teamId: 'abc123' });

// Track custom events
analytics.trackCustomEvent('feature_discovered', { feature: 'analytics' });
```

## 🔐 Privacy & Security

### Data Protection
- **User consent** - Only tracks authenticated users
- **Data anonymization** - IP addresses are optional
- **Admin-only access** - Analytics data restricted to admins
- **Secure storage** - All data stored in Appwrite with permissions

### GDPR Compliance
- Users can request data deletion
- Clear data retention policies
- Transparent data collection notice
- User consent mechanisms

## 📊 Available Metrics

### User Engagement
- Active users (daily/weekly/monthly)
- Session duration and frequency
- Page views and navigation patterns
- Feature adoption rates

### Performance
- Average page load times
- Slowest performing pages
- Error rates and types
- Browser and device performance

### Business Intelligence
- Most used features
- User journey analysis
- Conversion funnels
- Retention metrics

## 🛠️ Customization

### Adding New Events
1. Define event in analytics service
2. Add tracking call in component
3. Update admin dashboard if needed

### Custom Dashboards
Create specialized views for specific metrics:

```tsx
// Custom analytics component
import { getDashboardAnalytics } from '@/lib/analytics';

function CustomAnalytics() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    getDashboardAnalytics('7d').then(setData);
  }, []);
  
  // Render custom charts and metrics
}
```

### Extending Data Collection
Add new fields to existing collections or create new collections for specific use cases.

## 🔧 Troubleshooting

### Common Issues

1. **Analytics not tracking**
   - Check user authentication
   - Verify Appwrite permissions
   - Check browser console for errors

2. **Admin access denied**
   - Verify user has admin role/label
   - Check team membership
   - Confirm database permissions

3. **Performance impact**
   - Analytics uses minimal resources
   - Data is batched and sent asynchronously
   - Consider adjusting tracking frequency if needed

### Debug Mode
Enable debug logging in development:

```tsx
// Set in environment variable or config
const DEBUG_ANALYTICS = process.env.NODE_ENV === 'development';
```

## 🚀 Advanced Features

### Real-time Dashboard
- Live user count updates
- Real-time error monitoring
- Performance alerts
- Active session tracking

### Predictive Analytics
- User behavior predictions
- Feature usage forecasting
- Churn risk analysis
- Engagement scoring

### Data Export & Integration
- CSV/JSON export capabilities
- API endpoints for external tools
- Webhook integration support
- Custom report generation

## 📝 Next Steps

1. **Set up the database collections** using provided CLI commands
2. **Configure admin access** for your user account
3. **Integrate the analytics provider** in your app layout
4. **Access the admin dashboard** at `/admin/analytics`
5. **Customize tracking** for your specific use cases

## 💡 Best Practices

- **Track meaningful events** that provide business value
- **Respect user privacy** and implement consent mechanisms
- **Monitor performance impact** of tracking code
- **Regular data cleanup** to manage storage costs
- **Document tracked events** for team understanding

---

Your sophisticated analytics system is now ready to provide deep insights into user behavior and application performance! 🎉

# 📊 Analytics Database Setup Guide

## 🎯 Overview
This guide will help you set up a complete analytics database for your Grade Tracker application. The database will track user sessions, activities, page views, performance metrics, errors, and feature usage.

## 📋 Prerequisites

Before starting, make sure you have:

1. **Appwrite CLI installed**
   ```bash
   npm install -g appwrite-cli
   ```

2. **Logged into Appwrite**
   ```bash
   appwrite login
   ```

3. **Project configured**
   ```bash
   appwrite client setProject 67d6ea990025fa097964
   ```

## 🗄️ Database Structure

Your analytics system will create **6 collections** in database `67d6b079002144822b5e`:

### 1. **user_sessions** (User Login Sessions)
- `userId` - Who logged in
- `sessionId` - Unique session identifier
- `userAgent` - Browser/device info
- `ipAddress` - User's IP address
- `location` - Geographic location
- `device` - Device type (mobile/desktop)
- `startTime` - When session started
- `endTime` - When session ended
- `duration` - Session length in seconds

### 2. **user_activities** (User Actions)
- `userId` - Who performed the action
- `sessionId` - Which session
- `action` - What they did (click, submit, etc.)
- `category` - Type of action (navigation, form, etc.)
- `page` - Which page
- `metadata` - Additional details
- `timestamp` - When it happened
- `timeSpent` - Time spent on action

### 3. **page_views** (Page Navigation)
- `userId` - Who visited
- `sessionId` - Which session
- `path` - Page URL path
- `title` - Page title
- `referrer` - Previous page
- `timestamp` - When visited
- `duration` - Time spent on page

### 4. **performance_metrics** (App Performance)
- `userId` - User experiencing performance
- `sessionId` - Which session
- `page` - Which page
- `loadTime` - How long page took to load
- `renderTime` - Rendering time
- `networkTime` - Network request time
- `connectionType` - Internet connection type
- `timestamp` - When measured

### 5. **error_logs** (JavaScript Errors)
- `userId` - User who experienced error (optional)
- `sessionId` - Which session (optional)
- `errorType` - Type of error
- `errorMessage` - Error description
- `stack` - Error stack trace
- `page` - Where error occurred
- `userAgent` - Browser info
- `timestamp` - When error happened

### 6. **feature_usage** (Feature Adoption)
- `userId` - Who used the feature
- `sessionId` - Which session
- `feature` - Feature name
- `action` - How they used it
- `count` - Number of times used
- `metadata` - Additional details
- `timestamp` - When used

## 🚀 Setup Methods

### Method 1: Batch Script (Recommended - Fastest)

**Step 1:** Open Command Prompt in your project folder
```cmd
cd f:\grade-tracker-v2
```

**Step 2:** Run the setup script
```cmd
scripts\setup-analytics-db.bat
```

**What happens:**
- ✅ Creates all 6 collections
- ✅ Adds all 47 attributes automatically
- ✅ Sets up performance indexes
- ✅ Takes about 2-3 minutes

### Method 2: Manual via Appwrite Console (Easiest)

**Step 1:** Go to your [Appwrite Console](https://cloud.appwrite.io/console)

**Step 2:** Navigate to Databases → Select database `67d6b079002144822b5e`

**Step 3:** Create each collection manually:
1. Click "Create Collection"
2. Use the collection names and attributes from the structure above
3. Set permissions: Read (admin), Write (users)

**Pros:** Visual interface, immediate feedback
**Cons:** Takes 10-15 minutes to create everything

### Method 3: PowerShell Script (Alternative)

```powershell
cd f:\grade-tracker-v2
.\scripts\setup-analytics-db.ps1
```

## 🔍 Verification

After setup, verify in Appwrite Console:

1. **Go to:** Databases → `67d6b079002144822b5e`
2. **Check:** You should see 6 collections
3. **Verify:** Each collection has the correct attributes

### Expected Collections:
- ✅ user_sessions (9 attributes)
- ✅ user_activities (8 attributes)
- ✅ page_views (7 attributes)
- ✅ performance_metrics (8 attributes)
- ✅ error_logs (8 attributes)
- ✅ feature_usage (7 attributes)

## 🛠️ Troubleshooting

### Problem: "Appwrite CLI not found"
**Solution:**
```bash
npm install -g appwrite-cli
```

### Problem: "Not logged in"
**Solution:**
```bash
appwrite login
```

### Problem: "Database not found"
**Solution:** 
1. Check if database `67d6b079002144822b5e` exists in your console
2. Create it if missing, or update the database ID in scripts

### Problem: "Permission denied"
**Solution:** Make sure you're an admin of the project

### Problem: Script stops halfway
**Solution:** 
1. Check which collection failed
2. Delete any partially created collections
3. Run the script again

## 🎯 Next Steps

After database setup:

1. **Add Admin Role:**
   - Go to Auth → Teams in Appwrite Console
   - Create "admin" team if it doesn't exist
   - Add yourself to the admin team

2. **Integrate Analytics:**
   - The analytics code is already created in your project
   - Add `<AnalyticsProvider>` to your app layout
   - Analytics will start tracking automatically

3. **Access Dashboard:**
   - Visit `/admin/analytics` in your app
   - View real-time analytics data

## 📊 What You'll Track

Once set up, your analytics will automatically track:

- **User Sessions:** Login patterns, session duration
- **Page Views:** Most visited pages, navigation flows
- **User Activities:** Button clicks, form submissions
- **Performance:** Page load times, slow operations
- **Errors:** JavaScript crashes, API failures
- **Features:** Which features are used most

## 🔐 Security & Privacy

- ✅ **Admin Only:** Analytics dashboard only accessible to admins
- ✅ **No PII:** No personal data stored unnecessarily
- ✅ **Secure:** All data encrypted and secured by Appwrite
- ✅ **GDPR Ready:** Easy to delete user data if requested

## 📈 Benefits

With this analytics system, you'll know:

- Which features students use most
- Where users get stuck or confused
- Performance bottlenecks in your app
- Error rates and crash patterns
- User engagement and retention

This data helps you improve the Grade Tracker and provide a better experience for students! 🎓