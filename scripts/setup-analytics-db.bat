@echo off
echo ========================================
echo  Analytics Database Setup for Appwrite
echo ========================================
echo Database ID: 67d6b079002144822b5e
echo.

REM Check if Appwrite CLI is installed
appwrite --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Appwrite CLI is not installed or not in PATH
    echo Please install it first: npm install -g appwrite-cli
    pause
    exit /b 1
)

echo Creating analytics collections and attributes...
echo.

REM ===== 1. USER SESSIONS COLLECTION =====
echo [1/6] Creating User Sessions collection...
appwrite databases create-collection --databaseId 67d6b079002144822b5e --collectionId user_sessions --name "User Sessions"

echo   Adding User Sessions attributes...
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId user_sessions --key userId --size 255 --required true
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId user_sessions --key sessionId --size 255 --required true
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId user_sessions --key userAgent --size 500 --required false
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId user_sessions --key ipAddress --size 45 --required false
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId user_sessions --key location --size 255 --required false
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId user_sessions --key device --size 100 --required false
appwrite databases create-datetime-attribute --databaseId 67d6b079002144822b5e --collectionId user_sessions --key startTime --required true
appwrite databases create-datetime-attribute --databaseId 67d6b079002144822b5e --collectionId user_sessions --key endTime --required false
appwrite databases create-integer-attribute --databaseId 67d6b079002144822b5e --collectionId user_sessions --key duration --required false

echo   ✓ User Sessions collection created
echo.

REM ===== 2. USER ACTIVITIES COLLECTION =====
echo [2/6] Creating User Activities collection...
appwrite databases create-collection --databaseId 67d6b079002144822b5e --collectionId user_activities --name "User Activities"

echo   Adding User Activities attributes...
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId user_activities --key userId --size 255 --required true
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId user_activities --key sessionId --size 255 --required true
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId user_activities --key action --size 100 --required true
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId user_activities --key category --size 50 --required true
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId user_activities --key page --size 255 --required true
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId user_activities --key metadata --size 1000 --required false
appwrite databases create-datetime-attribute --databaseId 67d6b079002144822b5e --collectionId user_activities --key timestamp --required true
appwrite databases create-integer-attribute --databaseId 67d6b079002144822b5e --collectionId user_activities --key timeSpent --required false

echo   ✓ User Activities collection created
echo.

REM ===== 3. PAGE VIEWS COLLECTION =====
echo [3/6] Creating Page Views collection...
appwrite databases create-collection --databaseId 67d6b079002144822b5e --collectionId page_views --name "Page Views"

echo   Adding Page Views attributes...
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId page_views --key userId --size 255 --required true
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId page_views --key sessionId --size 255 --required true
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId page_views --key path --size 500 --required true
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId page_views --key title --size 255 --required false
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId page_views --key referrer --size 500 --required false
appwrite databases create-datetime-attribute --databaseId 67d6b079002144822b5e --collectionId page_views --key timestamp --required true
appwrite databases create-integer-attribute --databaseId 67d6b079002144822b5e --collectionId page_views --key duration --required false

echo   ✓ Page Views collection created
echo.

REM ===== 4. PERFORMANCE METRICS COLLECTION =====
echo [4/6] Creating Performance Metrics collection...
appwrite databases create-collection --databaseId 67d6b079002144822b5e --collectionId performance_metrics --name "Performance Metrics"

echo   Adding Performance Metrics attributes...
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId performance_metrics --key userId --size 255 --required true
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId performance_metrics --key sessionId --size 255 --required true
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId performance_metrics --key page --size 255 --required true
appwrite databases create-float-attribute --databaseId 67d6b079002144822b5e --collectionId performance_metrics --key loadTime --required true
appwrite databases create-float-attribute --databaseId 67d6b079002144822b5e --collectionId performance_metrics --key renderTime --required false
appwrite databases create-float-attribute --databaseId 67d6b079002144822b5e --collectionId performance_metrics --key networkTime --required false
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId performance_metrics --key connectionType --size 50 --required false
appwrite databases create-datetime-attribute --databaseId 67d6b079002144822b5e --collectionId performance_metrics --key timestamp --required true

echo   ✓ Performance Metrics collection created
echo.

REM ===== 5. ERROR LOGS COLLECTION =====
echo [5/6] Creating Error Logs collection...
appwrite databases create-collection --databaseId 67d6b079002144822b5e --collectionId error_logs --name "Error Logs"

echo   Adding Error Logs attributes...
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId error_logs --key userId --size 255 --required false
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId error_logs --key sessionId --size 255 --required false
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId error_logs --key errorType --size 100 --required true
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId error_logs --key errorMessage --size 1000 --required true
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId error_logs --key stack --size 2000 --required false
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId error_logs --key page --size 255 --required true
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId error_logs --key userAgent --size 500 --required false
appwrite databases create-datetime-attribute --databaseId 67d6b079002144822b5e --collectionId error_logs --key timestamp --required true

echo   ✓ Error Logs collection created
echo.

REM ===== 6. FEATURE USAGE COLLECTION =====
echo [6/6] Creating Feature Usage collection...
appwrite databases create-collection --databaseId 67d6b079002144822b5e --collectionId feature_usage --name "Feature Usage"

echo   Adding Feature Usage attributes...
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId feature_usage --key userId --size 255 --required true
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId feature_usage --key sessionId --size 255 --required true
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId feature_usage --key feature --size 100 --required true
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId feature_usage --key action --size 100 --required true
appwrite databases create-integer-attribute --databaseId 67d6b079002144822b5e --collectionId feature_usage --key count --required false --default 1
appwrite databases create-string-attribute --databaseId 67d6b079002144822b5e --collectionId feature_usage --key metadata --size 1000 --required false
appwrite databases create-datetime-attribute --databaseId 67d6b079002144822b5e --collectionId feature_usage --key timestamp --required true

echo   ✓ Feature Usage collection created
echo.

REM ===== CREATE INDEXES FOR PERFORMANCE =====
echo Creating performance indexes...
appwrite databases create-index --databaseId 67d6b079002144822b5e --collectionId user_sessions --key userId_index --type key --attributes userId
appwrite databases create-index --databaseId 67d6b079002144822b5e --collectionId user_activities --key userId_timestamp_index --type key --attributes userId,timestamp
appwrite databases create-index --databaseId 67d6b079002144822b5e --collectionId page_views --key path_timestamp_index --type key --attributes path,timestamp
appwrite databases create-index --databaseId 67d6b079002144822b5e --collectionId feature_usage --key feature_timestamp_index --type key --attributes feature,timestamp

echo   ✓ Performance indexes created
echo.

echo ========================================
echo  🎉 Analytics Database Setup Complete!
echo ========================================
echo.
echo All collections have been created:
echo   ✓ user_sessions
echo   ✓ user_activities  
echo   ✓ page_views
echo   ✓ performance_metrics
echo   ✓ error_logs
echo   ✓ feature_usage
echo.
echo Next steps:
echo 1. Go to your Appwrite Console
echo 2. Add admin role to your user account
echo 3. Integrate AnalyticsProvider in your app
echo 4. Access admin dashboard at /admin/analytics
echo.
echo Database ID used: 67d6b079002144822b5e
echo.
pause