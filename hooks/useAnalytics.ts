'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { 
  createUserSession, 
  updateSessionDuration, 
  trackUserActivity, 
  trackPageView, 
  trackPerformance as trackPerformanceMetrics,
  trackFeatureUsage,
  logError 
} from '@/lib/analytics';

interface UseAnalyticsOptions {
  trackPageViews?: boolean;
  trackPerformance?: boolean;
  trackErrors?: boolean;
  sessionTimeout?: number; // in minutes
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [sessionId] = useState(() => generateSessionId());
  const [isTracking, setIsTracking] = useState(false);
  const sessionStartTime = useRef<Date | null>(null);
  const lastActivityTime = useRef<Date>(new Date());
  const currentPageStartTime = useRef<Date | null>(null);

  const {
    trackPageViews = true,
    trackPerformance = true,
    trackErrors = true,
    sessionTimeout = 30
  } = options;

  // Initialize session
  useEffect(() => {
    if (!user || isTracking) return;

    const initializeSession = async () => {
      try {
        sessionStartTime.current = new Date();
        currentPageStartTime.current = new Date();

        await createUserSession({
          userId: user.$id,
          sessionId,
          userAgent: navigator.userAgent,
          device: getDeviceType(),
          location: await getLocationString()
        });

        setIsTracking(true);
        console.log('📊 [Analytics] Session initialized:', sessionId);
      } catch (error) {
        console.error('❌ [Analytics] Failed to initialize session:', error);
      }
    };

    initializeSession();
  }, [user, sessionId, isTracking]);

  // Track page views
  useEffect(() => {
    if (!user || !isTracking || !trackPageViews) return;

    const trackPage = async () => {
      try {
        if (currentPageStartTime.current) {
          const timeSpent = Date.now() - currentPageStartTime.current.getTime();
          
          await trackPageView({
            userId: user.$id,
            sessionId,
            path: pathname || '/',
            title: document.title,
            referrer: document.referrer,
            duration: Math.round(timeSpent / 1000)
          });
        }

        currentPageStartTime.current = new Date();
        lastActivityTime.current = new Date();

        console.log('📊 [Analytics] Page view tracked:', pathname);
      } catch (error) {
        console.error('❌ [Analytics] Failed to track page view:', error);
      }
    };

    trackPage();
  }, [pathname, user, sessionId, isTracking, trackPageViews]);

  // Track performance metrics
  useEffect(() => {
    if (!user || !isTracking || !trackPerformance || typeof window === 'undefined') return;

    const trackPagePerformance = async () => {
      try {
        if (document.readyState === 'complete') {
          const perfData = getPerformanceData();
          if (perfData) {
            await trackPerformanceMetrics({
              userId: user.$id,
              sessionId,
              page: pathname || '/',
              ...perfData
            });
          }
        } else {
          window.addEventListener('load', () => {
            setTimeout(async () => {
              const perfData = getPerformanceData();
              if (perfData) {
                await trackPerformanceMetrics({
                  userId: user.$id,
                  sessionId,
                  page: pathname || '/',
                  ...perfData
                });
              }
            }, 100);
          });
        }
      } catch (error) {
        console.error('❌ [Analytics] Failed to track performance:', error);
      }
    };

    trackPagePerformance();
  }, [pathname, user, sessionId, isTracking, trackPerformance]);

  // Track errors
  useEffect(() => {
    if (!trackErrors || typeof window === 'undefined') return;

    const handleError = async (event: ErrorEvent) => {
      try {
        await logError({
          userId: user?.$id,
          sessionId,
          errorType: 'JavaScript Error',
          errorMessage: event.message,
          stack: event.error?.stack,
          page: pathname || '/',
          userAgent: navigator.userAgent
        });
      } catch (error) {
        console.error('❌ [Analytics] Failed to log error:', error);
      }
    };

    const handleUnhandledRejection = async (event: PromiseRejectionEvent) => {
      try {
        await logError({
          userId: user?.$id,
          sessionId,
          errorType: 'Unhandled Promise Rejection',
          errorMessage: event.reason?.toString() || 'Unknown error',
          page: pathname || '/',
          userAgent: navigator.userAgent
        });
      } catch (error) {
        console.error('❌ [Analytics] Failed to log promise rejection:', error);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [user, sessionId, pathname, trackErrors]);

  // Update session duration periodically
  useEffect(() => {
    if (!isTracking || !sessionStartTime.current) return;

    const updateDuration = async () => {
      try {
        const duration = Math.round((Date.now() - sessionStartTime.current!.getTime()) / 1000);
        await updateSessionDuration(sessionId, duration);
      } catch (error) {
        console.error('❌ [Analytics] Failed to update session duration:', error);
      }
    };

    const interval = setInterval(updateDuration, 30000);
    return () => clearInterval(interval);
  }, [isTracking, sessionId]);

  // Session timeout detection
  useEffect(() => {
    if (!isTracking) return;

    const checkSessionTimeout = () => {
      const now = new Date();
      const timeSinceLastActivity = now.getTime() - lastActivityTime.current.getTime();
      const timeoutMs = sessionTimeout * 60 * 1000;

      if (timeSinceLastActivity > timeoutMs) {
        setIsTracking(false);
        console.log('📊 [Analytics] Session timed out');
      }
    };

    const interval = setInterval(checkSessionTimeout, 60000);
    return () => clearInterval(interval);
  }, [isTracking, sessionTimeout]);

  // Activity tracking functions
  const trackActivity = async (action: string, category: string, metadata?: any) => {
    if (!user || !isTracking) return;

    try {
      lastActivityTime.current = new Date();
      
      await trackUserActivity({
        userId: user.$id,
        sessionId,
        action,
        category,
        page: pathname || '/',
        metadata: metadata ? JSON.stringify(metadata) : undefined
      });

      console.log('📊 [Analytics] Activity tracked:', { action, category });
    } catch (error) {
      console.error('❌ [Analytics] Failed to track activity:', error);
    }
  };

  const trackFeature = async (feature: string, action: string, metadata?: any) => {
    if (!user || !isTracking) return;

    try {
      lastActivityTime.current = new Date();
      
      await trackFeatureUsage({
        userId: user.$id,
        sessionId,
        feature,
        action,
        metadata: metadata ? JSON.stringify(metadata) : undefined
      });

      console.log('📊 [Analytics] Feature usage tracked:', { feature, action });
    } catch (error) {
      console.error('❌ [Analytics] Failed to track feature usage:', error);
    }
  };

  const trackCustomEvent = async (eventName: string, eventData?: any) => {
    if (!user || !isTracking) return;

    try {
      lastActivityTime.current = new Date();
      
      await trackUserActivity({
        userId: user.$id,
        sessionId,
        action: eventName,
        category: 'custom',
        page: pathname || '/',
        metadata: eventData ? JSON.stringify(eventData) : undefined
      });

      console.log('📊 [Analytics] Custom event tracked:', eventName);
    } catch (error) {
      console.error('❌ [Analytics] Failed to track custom event:', error);
    }
  };

  return {
    sessionId,
    isTracking,
    trackActivity,
    trackFeature,
    trackCustomEvent
  };
}

// Helper functions
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getDeviceType(): string {
  const userAgent = navigator.userAgent;
  
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
}

async function getLocationString(): Promise<string | undefined> {
  try {
    return 'Unknown';
  } catch (error) {
    return undefined;
  }
}

function getPerformanceData() {
  if (typeof window === 'undefined' || !window.performance) return null;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (!navigation) return null;

  return {
    loadTime: navigation.loadEventEnd - navigation.fetchStart,
    renderTime: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    networkTime: navigation.responseEnd - navigation.requestStart,
    connectionType: (navigator as any).connection?.effectiveType || 'unknown'
  };
}