import { getDatabases } from './appwrite';
import { ID, Query } from 'appwrite';

const databases = getDatabases();

// Use your specific database ID
export const DATABASE_ID = '67d6b079002144822b5e';

// Collection IDs for Analytics
export const ANALYTICS_COLLECTIONS = {
  USER_SESSIONS: 'user_sessions',
  USER_ACTIVITIES: 'user_activities',
  PAGE_VIEWS: 'page_views',
  PERFORMANCE_METRICS: 'performance_metrics',
  ERROR_LOGS: 'error_logs',
  FEATURE_USAGE: 'feature_usage'
} as const;

// Session Management
export async function createUserSession(sessionData: {
  userId: string;
  sessionId: string;
  userAgent?: string;
  ipAddress?: string;
  location?: string;
  device?: string;
}) {
  try {
    const session = await databases.createDocument(
      DATABASE_ID,
      ANALYTICS_COLLECTIONS.USER_SESSIONS,
      ID.unique(),
      {
        ...sessionData,
        startTime: new Date().toISOString(),
        duration: 0
      }
    );
    console.log('📊 [Analytics] Session created:', session.$id);
    return session;
  } catch (error) {
    console.error('❌ [Analytics] Error creating session:', error);
    throw error;
  }
}

export async function updateSessionDuration(sessionId: string, duration: number) {
  try {
    const sessions = await databases.listDocuments(
      DATABASE_ID,
      ANALYTICS_COLLECTIONS.USER_SESSIONS,
      [Query.equal('sessionId', sessionId)]
    );

    if (sessions.documents.length > 0) {
      await databases.updateDocument(
        DATABASE_ID,
        ANALYTICS_COLLECTIONS.USER_SESSIONS,
        sessions.documents[0].$id,
        {
          duration,
          endTime: new Date().toISOString()
        }
      );
    }
  } catch (error) {
    console.error('❌ [Analytics] Error updating session duration:', error);
  }
}

// Activity Tracking
export async function trackUserActivity(activityData: {
  userId: string;
  sessionId: string;
  action: string;
  category: string;
  page: string;
  metadata?: string;
  timeSpent?: number;
}) {
  try {
    const activity = await databases.createDocument(
      DATABASE_ID,
      ANALYTICS_COLLECTIONS.USER_ACTIVITIES,
      ID.unique(),
      {
        ...activityData,
        timestamp: new Date().toISOString()
      }
    );
    return activity;
  } catch (error) {
    console.error('❌ [Analytics] Error tracking activity:', error);
    throw error;
  }
}

// Page View Tracking
export async function trackPageView(pageData: {
  userId: string;
  sessionId: string;
  path: string;
  title?: string;
  referrer?: string;
  duration?: number;
}) {
  try {
    const pageView = await databases.createDocument(
      DATABASE_ID,
      ANALYTICS_COLLECTIONS.PAGE_VIEWS,
      ID.unique(),
      {
        ...pageData,
        timestamp: new Date().toISOString()
      }
    );
    return pageView;
  } catch (error) {
    console.error('❌ [Analytics] Error tracking page view:', error);
    throw error;
  }
}

// Performance Tracking
export async function trackPerformance(performanceData: {
  userId: string;
  sessionId: string;
  page: string;
  loadTime: number;
  renderTime?: number;
  networkTime?: number;
  connectionType?: string;
}) {
  try {
    const performance = await databases.createDocument(
      DATABASE_ID,
      ANALYTICS_COLLECTIONS.PERFORMANCE_METRICS,
      ID.unique(),
      {
        ...performanceData,
        timestamp: new Date().toISOString()
      }
    );
    return performance;
  } catch (error) {
    console.error('❌ [Analytics] Error tracking performance:', error);
    throw error;
  }
}

// Error Logging
export async function logError(errorData: {
  userId?: string;
  sessionId?: string;
  errorType: string;
  errorMessage: string;
  stack?: string;
  page: string;
  userAgent?: string;
}) {
  try {
    const errorLog = await databases.createDocument(
      DATABASE_ID,
      ANALYTICS_COLLECTIONS.ERROR_LOGS,
      ID.unique(),
      {
        ...errorData,
        timestamp: new Date().toISOString()
      }
    );
    return errorLog;
  } catch (error) {
    console.error('❌ [Analytics] Error logging error:', error);
    throw error;
  }
}

// Feature Usage Tracking
export async function trackFeatureUsage(featureData: {
  userId: string;
  sessionId: string;
  feature: string;
  action: string;
  count?: number;
  metadata?: string;
}) {
  try {
    const featureUsage = await databases.createDocument(
      DATABASE_ID,
      ANALYTICS_COLLECTIONS.FEATURE_USAGE,
      ID.unique(),
      {
        ...featureData,
        count: featureData.count || 1,
        timestamp: new Date().toISOString()
      }
    );
    return featureUsage;
  } catch (error) {
    console.error('❌ [Analytics] Error tracking feature usage:', error);
    throw error;
  }
}

// Analytics Retrieval Functions (Admin Only)
export async function getUserSessionsAnalytics(timeRange: string = '7d') {
  try {
    const startDate = getStartDateFromRange(timeRange);
    
    const sessions = await databases.listDocuments(
      DATABASE_ID,
      ANALYTICS_COLLECTIONS.USER_SESSIONS,
      [
        Query.greaterThanEqual('startTime', startDate.toISOString()),
        Query.orderDesc('startTime'),
        Query.limit(1000)
      ]
    );

    return {
      totalSessions: sessions.documents.length,
      sessions: sessions.documents,
      averageSessionDuration: calculateAverageSessionDuration(sessions.documents),
      uniqueUsers: getUniqueUsers(sessions.documents),
      topDevices: getTopDevices(sessions.documents)
    };
  } catch (error) {
    console.error('❌ [Analytics] Error fetching session analytics:', error);
    throw error;
  }
}

export async function getUserActivitiesAnalytics(timeRange: string = '7d') {
  try {
    const startDate = getStartDateFromRange(timeRange);
    
    const activities = await databases.listDocuments(
      DATABASE_ID,
      ANALYTICS_COLLECTIONS.USER_ACTIVITIES,
      [
        Query.greaterThanEqual('timestamp', startDate.toISOString()),
        Query.orderDesc('timestamp'),
        Query.limit(1000)
      ]
    );

    return {
      totalActivities: activities.documents.length,
      activities: activities.documents,
      topActions: getTopActions(activities.documents),
      topCategories: getTopCategories(activities.documents),
      activityTrends: getActivityTrends(activities.documents)
    };
  } catch (error) {
    console.error('❌ [Analytics] Error fetching activity analytics:', error);
    throw error;
  }
}

export async function getPageViewsAnalytics(timeRange: string = '7d') {
  try {
    const startDate = getStartDateFromRange(timeRange);
    
    const pageViews = await databases.listDocuments(
      DATABASE_ID,
      ANALYTICS_COLLECTIONS.PAGE_VIEWS,
      [
        Query.greaterThanEqual('timestamp', startDate.toISOString()),
        Query.orderDesc('timestamp'),
        Query.limit(1000)
      ]
    );

    return {
      totalPageViews: pageViews.documents.length,
      pageViews: pageViews.documents,
      topPages: getTopPages(pageViews.documents),
      averageTimeOnPage: calculateAverageTimeOnPage(pageViews.documents),
      bounceRate: calculateBounceRate(pageViews.documents)
    };
  } catch (error) {
    console.error('❌ [Analytics] Error fetching page view analytics:', error);
    throw error;
  }
}

export async function getPerformanceAnalytics(timeRange: string = '7d') {
  try {
    const startDate = getStartDateFromRange(timeRange);
    
    const performance = await databases.listDocuments(
      DATABASE_ID,
      ANALYTICS_COLLECTIONS.PERFORMANCE_METRICS,
      [
        Query.greaterThanEqual('timestamp', startDate.toISOString()),
        Query.orderDesc('timestamp'),
        Query.limit(1000)
      ]
    );

    return {
      totalMetrics: performance.documents.length,
      performance: performance.documents,
      averageLoadTime: calculateAverageLoadTime(performance.documents),
      slowestPages: getSlowestPages(performance.documents),
      performanceTrends: getPerformanceTrends(performance.documents)
    };
  } catch (error) {
    console.error('❌ [Analytics] Error fetching performance analytics:', error);
    throw error;
  }
}

export async function getErrorAnalytics(timeRange: string = '7d') {
  try {
    const startDate = getStartDateFromRange(timeRange);
    
    const errors = await databases.listDocuments(
      DATABASE_ID,
      ANALYTICS_COLLECTIONS.ERROR_LOGS,
      [
        Query.greaterThanEqual('timestamp', startDate.toISOString()),
        Query.orderDesc('timestamp'),
        Query.limit(500)
      ]
    );

    return {
      totalErrors: errors.documents.length,
      errors: errors.documents,
      topErrorTypes: getTopErrorTypes(errors.documents),
      errorTrends: getErrorTrends(errors.documents),
      affectedPages: getAffectedPages(errors.documents)
    };
  } catch (error) {
    console.error('❌ [Analytics] Error fetching error analytics:', error);
    throw error;
  }
}

export async function getFeatureUsageAnalytics(timeRange: string = '7d') {
  try {
    const startDate = getStartDateFromRange(timeRange);
    
    const featureUsage = await databases.listDocuments(
      DATABASE_ID,
      ANALYTICS_COLLECTIONS.FEATURE_USAGE,
      [
        Query.greaterThanEqual('timestamp', startDate.toISOString()),
        Query.orderDesc('timestamp'),
        Query.limit(1000)
      ]
    );

    return {
      totalUsage: featureUsage.documents.length,
      featureUsage: featureUsage.documents,
      topFeatures: getTopFeatures(featureUsage.documents),
      featureAdoption: getFeatureAdoption(featureUsage.documents),
      usageTrends: getUsageTrends(featureUsage.documents)
    };
  } catch (error) {
    console.error('❌ [Analytics] Error fetching feature usage analytics:', error);
    throw error;
  }
}

// Comprehensive Dashboard Data
export async function getDashboardAnalytics(timeRange: string = '7d') {
  try {
    const [
      sessions,
      activities,
      pageViews,
      performance,
      errors,
      featureUsage
    ] = await Promise.all([
      getUserSessionsAnalytics(timeRange),
      getUserActivitiesAnalytics(timeRange),
      getPageViewsAnalytics(timeRange),
      getPerformanceAnalytics(timeRange),
      getErrorAnalytics(timeRange),
      getFeatureUsageAnalytics(timeRange)
    ]);

    return {
      overview: {
        totalSessions: sessions.totalSessions,
        uniqueUsers: sessions.uniqueUsers,
        totalPageViews: pageViews.totalPageViews,
        totalErrors: errors.totalErrors,
        averageLoadTime: performance.averageLoadTime,
        bounceRate: pageViews.bounceRate
      },
      sessions,
      activities,
      pageViews,
      performance,
      errors,
      featureUsage,
      realTimeStats: await getRealTimeStats()
    };
  } catch (error) {
    console.error('❌ [Analytics] Error fetching dashboard analytics:', error);
    throw error;
  }
}

// Real-time Analytics
export async function getRealTimeStats() {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const [activeSessions, recentErrors, currentUsers] = await Promise.all([
      databases.listDocuments(
        DATABASE_ID,
        ANALYTICS_COLLECTIONS.USER_SESSIONS,
        [
          Query.greaterThanEqual('startTime', oneHourAgo.toISOString()),
          Query.isNull('endTime')
        ]
      ),
      databases.listDocuments(
        DATABASE_ID,
        ANALYTICS_COLLECTIONS.ERROR_LOGS,
        [
          Query.greaterThanEqual('timestamp', oneHourAgo.toISOString()),
          Query.limit(10)
        ]
      ),
      databases.listDocuments(
        DATABASE_ID,
        ANALYTICS_COLLECTIONS.PAGE_VIEWS,
        [
          Query.greaterThanEqual('timestamp', oneHourAgo.toISOString())
        ]
      )
    ]);

    return {
      activeSessions: activeSessions.documents.length,
      recentErrors: recentErrors.documents.length,
      currentUsers: getUniqueUsers(currentUsers.documents),
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ [Analytics] Error fetching real-time stats:', error);
    return {
      activeSessions: 0,
      recentErrors: 0,
      currentUsers: 0,
      lastUpdated: new Date().toISOString()
    };
  }
}

// Helper Functions
function getStartDateFromRange(range: string): Date {
  const now = new Date();
  switch (range) {
    case '1h': return new Date(now.getTime() - 60 * 60 * 1000);
    case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default: return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
}

function calculateAverageSessionDuration(sessions: any[]): number {
  const validSessions = sessions.filter(s => s.duration && s.duration > 0);
  if (validSessions.length === 0) return 0;
  
  const total = validSessions.reduce((sum, s) => sum + s.duration, 0);
  return Math.round(total / validSessions.length);
}

function getUniqueUsers(documents: any[]): number {
  const uniqueUserIds = new Set(documents.map(d => d.userId).filter(Boolean));
  return uniqueUserIds.size;
}

function getTopDevices(sessions: any[]): Array<{device: string, count: number}> {
  const deviceCounts = sessions.reduce((acc, session) => {
    if (session.device) {
      acc[session.device] = (acc[session.device] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(deviceCounts)
    .map(([device, count]) => ({ device, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function getTopActions(activities: any[]): Array<{action: string, count: number}> {
  const actionCounts = activities.reduce((acc, activity) => {
    acc[activity.action] = (acc[activity.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(actionCounts)
    .map(([action, count]) => ({ action, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function getTopCategories(activities: any[]): Array<{category: string, count: number}> {
  const categoryCounts = activities.reduce((acc, activity) => {
    acc[activity.category] = (acc[activity.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count: count as number }))
    .sort((a, b) => b.count - a.count);
}

function getTopPages(pageViews: any[]): Array<{path: string, views: number, avgDuration: number}> {
  const pageStats = pageViews.reduce((acc, view) => {
    if (!acc[view.path]) {
      acc[view.path] = { views: 0, totalDuration: 0, validDurations: 0 };
    }
    acc[view.path].views++;
    if (view.duration && view.duration > 0) {
      acc[view.path].totalDuration += view.duration;
      acc[view.path].validDurations++;
    }
    return acc;
  }, {} as Record<string, {views: number, totalDuration: number, validDurations: number}>);

  return Object.entries(pageStats)
    .map(([path, stats]) => ({
      path,
      views: stats.views,
      avgDuration: stats.validDurations > 0 
        ? Math.round(stats.totalDuration / stats.validDurations)
        : 0
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
}

function calculateAverageTimeOnPage(pageViews: any[]): number {
  const validViews = pageViews.filter(v => v.duration && v.duration > 0);
  if (validViews.length === 0) return 0;
  
  const total = validViews.reduce((sum, v) => sum + v.duration, 0);
  return Math.round(total / validViews.length);
}

function calculateBounceRate(pageViews: any[]): number {
  const sessionPageCounts = pageViews.reduce((acc, view) => {
    acc[view.sessionId] = (acc[view.sessionId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sessions = Object.values(sessionPageCounts);
  const bouncedSessions = sessions.filter(count => count === 1).length;
  
  return sessions.length > 0 ? Math.round((bouncedSessions / sessions.length) * 100) : 0;
}

function calculateAverageLoadTime(performance: any[]): number {
  if (performance.length === 0) return 0;
  
  const total = performance.reduce((sum, p) => sum + p.loadTime, 0);
  return Math.round((total / performance.length) * 100) / 100; // Round to 2 decimal places
}

function getSlowestPages(performance: any[]): Array<{page: string, avgLoadTime: number}> {
  const pageStats = performance.reduce((acc, perf) => {
    if (!acc[perf.page]) {
      acc[perf.page] = { total: 0, count: 0 };
    }
    acc[perf.page].total += perf.loadTime;
    acc[perf.page].count++;
    return acc;
  }, {} as Record<string, {total: number, count: number}>);

  return Object.entries(pageStats)
    .map(([page, stats]) => ({
      page,
      avgLoadTime: Math.round((stats.total / stats.count) * 100) / 100
    }))
    .sort((a, b) => b.avgLoadTime - a.avgLoadTime)
    .slice(0, 5);
}

function getTopErrorTypes(errors: any[]): Array<{type: string, count: number}> {
  const errorCounts = errors.reduce((acc, error) => {
    acc[error.errorType] = (acc[error.errorType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(errorCounts)
    .map(([type, count]) => ({ type, count: count as number }))
    .sort((a, b) => b.count - a.count);
}

function getAffectedPages(errors: any[]): Array<{page: string, count: number}> {
  const pageCounts = errors.reduce((acc, error) => {
    acc[error.page] = (acc[error.page] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(pageCounts)
    .map(([page, count]) => ({ page, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function getTopFeatures(featureUsage: any[]): Array<{feature: string, usage: number}> {
  const featureCounts = featureUsage.reduce((acc, usage) => {
    acc[usage.feature] = (acc[usage.feature] || 0) + (usage.count || 1);
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(featureCounts)
    .map(([feature, usage]) => ({ feature, usage: usage as number }))
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 10);
}

// Trend calculation helpers
function getActivityTrends(activities: any[]) {
  return calculateDailyTrends(activities, 'timestamp');
}

function getPerformanceTrends(performance: any[]) {
  return calculateDailyTrends(performance, 'timestamp', 'loadTime');
}

function getErrorTrends(errors: any[]) {
  return calculateDailyTrends(errors, 'timestamp');
}

function getUsageTrends(usage: any[]) {
  return calculateDailyTrends(usage, 'timestamp');
}

function getFeatureAdoption(featureUsage: any[]) {
  const uniqueUsers = featureUsage.reduce((acc, usage) => {
    if (!acc[usage.feature]) {
      acc[usage.feature] = new Set();
    }
    acc[usage.feature].add(usage.userId);
    return acc;
  }, {} as Record<string, Set<string>>);

  return Object.entries(uniqueUsers)
    .map(([feature, users]) => ({
      feature,
      users: users.size
    }))
    .sort((a, b) => b.users - a.users);
}

function calculateDailyTrends(data: any[], timeField: string, valueField?: string) {
  const dailyData = data.reduce((acc, item) => {
    const date = new Date(item[timeField]).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { count: 0, total: 0 };
    }
    acc[date].count++;
    if (valueField && item[valueField]) {
      acc[date].total += item[valueField];
    }
    return acc;
  }, {} as Record<string, {count: number, total: number}>);

  return Object.entries(dailyData)
    .map(([date, stats]) => ({
      date,
      count: stats.count,
      average: valueField ? stats.total / stats.count : undefined
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}