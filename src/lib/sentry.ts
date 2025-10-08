import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

/**
 * Initialize Sentry error tracking and performance monitoring
 *
 * Environment Variables Required:
 * - REACT_APP_SENTRY_DSN: Your Sentry DSN from https://sentry.io
 * - REACT_APP_SENTRY_ENVIRONMENT: e.g., 'production', 'staging', 'development'
 */
export const initSentry = (): void => {
  const sentryDSN = process.env.REACT_APP_SENTRY_DSN;

  // Only initialize Sentry if DSN is provided
  if (!sentryDSN) {
    console.warn('Sentry DSN not configured. Error tracking is disabled.');
    return;
  }

  Sentry.init({
    dsn: sentryDSN,
    integrations: [
      new BrowserTracing(),
      // Capture user interactions
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

    // Environment
    environment: process.env.REACT_APP_SENTRY_ENVIRONMENT || process.env.NODE_ENV,

    // Release tracking (use git commit hash or version)
    release: process.env.REACT_APP_VERSION || '1.0.0',

    // Ignore common errors
    ignoreErrors: [
      // Browser extensions
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      // Network errors
      'NetworkError',
      'Failed to fetch',
    ],

    // Before send hook - add custom logic
    beforeSend(event, hint) {
      // Filter out non-critical errors in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Sentry] Event:', event);
        console.log('[Sentry] Hint:', hint);
      }

      return event;
    },
  });
};

/**
 * Set user context for Sentry
 */
export const setSentryUser = (user: { id: string; email?: string; name?: string }): void => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
  });
};

/**
 * Clear user context on logout
 */
export const clearSentryUser = (): void => {
  Sentry.setUser(null);
};

/**
 * Capture custom error
 */
export const captureError = (error: Error, context?: Record<string, unknown>): void => {
  Sentry.captureException(error, {
    extra: context,
  });
};

/**
 * Capture custom message
 */
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info'): void => {
  Sentry.captureMessage(message, level);
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (message: string, category?: string, data?: Record<string, unknown>): void => {
  Sentry.addBreadcrumb({
    message,
    category: category || 'custom',
    level: 'info',
    data,
  });
};

export default Sentry;
