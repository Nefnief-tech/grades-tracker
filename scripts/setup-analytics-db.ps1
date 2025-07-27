# PowerShell script for setting up Analytics Database in Appwrite
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Analytics Database Setup for Appwrite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Database ID
$dbId = "67d6b079002144822b5e"
Write-Host "Database ID: $dbId" -ForegroundColor Green
Write-Host ""

# Check if Appwrite CLI is installed
try {
    $null = appwrite --version 2>$null
    Write-Host "✓ Appwrite CLI found" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Appwrite CLI is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install it first: npm install -g appwrite-cli" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Creating analytics collections and attributes..." -ForegroundColor Yellow
Write-Host ""

try {    # ===== 1. USER SESSIONS COLLECTION =====
    Write-Host "[1/6] Creating User Sessions collection..." -ForegroundColor Blue
    appwrite databases create-collection --database-id $dbId --collection-id user_sessions --name "User Sessions"
    
    Write-Host "  Adding User Sessions attributes..." -ForegroundColor Gray
    appwrite databases create-string-attribute --database-id $dbId --collection-id user_sessions --key userId --size 255 --required true
    appwrite databases create-string-attribute --database-id $dbId --collection-id user_sessions --key sessionId --size 255 --required true
    appwrite databases create-string-attribute --database-id $dbId --collection-id user_sessions --key userAgent --size 500 --required false
    appwrite databases create-string-attribute --database-id $dbId --collection-id user_sessions --key ipAddress --size 45 --required false
    appwrite databases create-string-attribute --database-id $dbId --collection-id user_sessions --key location --size 255 --required false
    appwrite databases create-string-attribute --database-id $dbId --collection-id user_sessions --key device --size 100 --required false
    appwrite databases create-datetime-attribute --database-id $dbId --collection-id user_sessions --key startTime --required true
    appwrite databases create-datetime-attribute --database-id $dbId --collection-id user_sessions --key endTime --required false
    appwrite databases create-integer-attribute --database-id $dbId --collection-id user_sessions --key duration --required false
    
    Write-Host "  ✓ User Sessions collection created" -ForegroundColor Green
    Write-Host ""    # ===== 2. USER ACTIVITIES COLLECTION =====
    Write-Host "[2/6] Creating User Activities collection..." -ForegroundColor Blue
    appwrite databases create-collection --database-id $dbId --collection-id user_activities --name "User Activities"
    
    Write-Host "  Adding User Activities attributes..." -ForegroundColor Gray
    appwrite databases create-string-attribute --database-id $dbId --collection-id user_activities --key userId --size 255 --required true
    appwrite databases create-string-attribute --database-id $dbId --collection-id user_activities --key sessionId --size 255 --required true
    appwrite databases create-string-attribute --database-id $dbId --collection-id user_activities --key action --size 100 --required true
    appwrite databases create-string-attribute --database-id $dbId --collection-id user_activities --key category --size 50 --required true
    appwrite databases create-string-attribute --database-id $dbId --collection-id user_activities --key page --size 255 --required true
    appwrite databases create-string-attribute --database-id $dbId --collection-id user_activities --key metadata --size 1000 --required false
    appwrite databases create-datetime-attribute --database-id $dbId --collection-id user_activities --key timestamp --required true
    appwrite databases create-integer-attribute --database-id $dbId --collection-id user_activities --key timeSpent --required false
    
    Write-Host "  ✓ User Activities collection created" -ForegroundColor Green
    Write-Host ""    # ===== 3. PAGE VIEWS COLLECTION =====
    Write-Host "[3/6] Creating Page Views collection..." -ForegroundColor Blue
    appwrite databases create-collection --database-id $dbId --collection-id page_views --name "Page Views"
    
    Write-Host "  Adding Page Views attributes..." -ForegroundColor Gray
    appwrite databases create-string-attribute --database-id $dbId --collection-id page_views --key userId --size 255 --required true
    appwrite databases create-string-attribute --database-id $dbId --collection-id page_views --key sessionId --size 255 --required true
    appwrite databases create-string-attribute --database-id $dbId --collection-id page_views --key path --size 500 --required true
    appwrite databases create-string-attribute --database-id $dbId --collection-id page_views --key title --size 255 --required false
    appwrite databases create-string-attribute --database-id $dbId --collection-id page_views --key referrer --size 500 --required false
    appwrite databases create-datetime-attribute --database-id $dbId --collection-id page_views --key timestamp --required true
    appwrite databases create-integer-attribute --database-id $dbId --collection-id page_views --key duration --required false

    Write-Host "  ✓ Page Views collection created" -ForegroundColor Green
    Write-Host ""

    # ===== 4. PERFORMANCE METRICS COLLECTION =====
    Write-Host "[4/6] Creating Performance Metrics collection..." -ForegroundColor Blue
    appwrite databases create-collection --database-id $dbId --collection-id performance_metrics --name "Performance Metrics"
    
    Write-Host "  Adding Performance Metrics attributes..." -ForegroundColor Gray
    appwrite databases create-string-attribute --database-id $dbId --collection-id performance_metrics --key userId --size 255 --required true
    appwrite databases create-string-attribute --database-id $dbId --collection-id performance_metrics --key sessionId --size 255 --required true
    appwrite databases create-string-attribute --database-id $dbId --collection-id performance_metrics --key page --size 255 --required true
    appwrite databases create-float-attribute --database-id $dbId --collection-id performance_metrics --key loadTime --required true
    appwrite databases create-float-attribute --database-id $dbId --collection-id performance_metrics --key renderTime --required false
    appwrite databases create-float-attribute --database-id $dbId --collection-id performance_metrics --key networkTime --required false
    appwrite databases create-string-attribute --database-id $dbId --collection-id performance_metrics --key connectionType --size 50 --required false
    appwrite databases create-datetime-attribute --database-id $dbId --collection-id performance_metrics --key timestamp --required true

    Write-Host "  ✓ Performance Metrics collection created" -ForegroundColor Green
    Write-Host ""

    # ===== 5. ERROR LOGS COLLECTION =====
    Write-Host "[5/6] Creating Error Logs collection..." -ForegroundColor Blue
    appwrite databases create-collection --database-id $dbId --collection-id error_logs --name "Error Logs"
    
    Write-Host "  Adding Error Logs attributes..." -ForegroundColor Gray
    appwrite databases create-string-attribute --database-id $dbId --collection-id error_logs --key userId --size 255 --required false
    appwrite databases create-string-attribute --database-id $dbId --collection-id error_logs --key sessionId --size 255 --required false
    appwrite databases create-string-attribute --database-id $dbId --collection-id error_logs --key errorType --size 100 --required true
    appwrite databases create-string-attribute --database-id $dbId --collection-id error_logs --key errorMessage --size 1000 --required true
    appwrite databases create-string-attribute --database-id $dbId --collection-id error_logs --key stack --size 2000 --required false
    appwrite databases create-string-attribute --database-id $dbId --collection-id error_logs --key page --size 255 --required true
    appwrite databases create-string-attribute --database-id $dbId --collection-id error_logs --key userAgent --size 500 --required false
    appwrite databases create-datetime-attribute --database-id $dbId --collection-id error_logs --key timestamp --required true

    Write-Host "  ✓ Error Logs collection created" -ForegroundColor Green
    Write-Host ""

    # ===== 6. FEATURE USAGE COLLECTION =====
    Write-Host "[6/6] Creating Feature Usage collection..." -ForegroundColor Blue
    appwrite databases create-collection --database-id $dbId --collection-id feature_usage --name "Feature Usage"
    
    Write-Host "  Adding Feature Usage attributes..." -ForegroundColor Gray
    appwrite databases create-string-attribute --database-id $dbId --collection-id feature_usage --key userId --size 255 --required true
    appwrite databases create-string-attribute --database-id $dbId --collection-id feature_usage --key sessionId --size 255 --required true
    appwrite databases create-string-attribute --database-id $dbId --collection-id feature_usage --key feature --size 100 --required true
    appwrite databases create-string-attribute --database-id $dbId --collection-id feature_usage --key action --size 100 --required true
    appwrite databases create-integer-attribute --database-id $dbId --collection-id feature_usage --key count --required false --default 1
    appwrite databases create-string-attribute --database-id $dbId --collection-id feature_usage --key metadata --size 1000 --required false
    appwrite databases create-datetime-attribute --database-id $dbId --collection-id feature_usage --key timestamp --required true
    
    Write-Host "  ✓ Feature Usage collection created" -ForegroundColor Green
    Write-Host ""    # ===== CREATE INDEXES FOR PERFORMANCE =====
    Write-Host "Creating performance indexes..." -ForegroundColor Yellow
    appwrite databases create-index --database-id $dbId --collection-id user_sessions --key userId_index --type key --attributes userId
    appwrite databases create-index --database-id $dbId --collection-id user_activities --key userId_timestamp_index --type key --attributes userId,timestamp
    appwrite databases create-index --database-id $dbId --collection-id page_views --key path_timestamp_index --type key --attributes path,timestamp
    appwrite databases create-index --database-id $dbId --collection-id feature_usage --key feature_timestamp_index --type key --attributes feature,timestamp
    
    Write-Host "  ✓ Performance indexes created" -ForegroundColor Green
    Write-Host ""

    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " 🎉 Analytics Database Setup Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "All collections have been created:" -ForegroundColor Green
    Write-Host "  ✓ user_sessions" -ForegroundColor Green
    Write-Host "  ✓ user_activities" -ForegroundColor Green
    Write-Host "  ✓ page_views" -ForegroundColor Green
    Write-Host "  ✓ performance_metrics" -ForegroundColor Green
    Write-Host "  ✓ error_logs" -ForegroundColor Green
    Write-Host "  ✓ feature_usage" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Go to your Appwrite Console" -ForegroundColor White
    Write-Host "2. Add admin role to your user account" -ForegroundColor White
    Write-Host "3. Integrate AnalyticsProvider in your app" -ForegroundColor White
    Write-Host "4. Access admin dashboard at /admin/analytics" -ForegroundColor White
    Write-Host ""
    Write-Host "Database ID used: $dbId" -ForegroundColor Cyan

} catch {
    Write-Host "Error occurred: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check your Appwrite CLI configuration and try again." -ForegroundColor Yellow
} finally {
    Write-Host ""
    Read-Host "Press Enter to exit"
}