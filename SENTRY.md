# Sentry Error Monitoring - ArmoraCPO

## Table of Contents
- [Overview](#overview)
- [Quick Start](#quick-start)
- [Project Details](#project-details)
- [Configuration](#configuration)
- [Features Implemented](#features-implemented)
- [Testing the Integration](#testing-the-integration)
- [Viewing Errors in Sentry Dashboard](#viewing-errors-in-sentry-dashboard)
- [Usage in Code](#usage-in-code)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

---

## Overview

ArmoraCPO uses **Sentry** for real-time error tracking, performance monitoring, and session replay. Sentry helps us:

- Monitor JavaScript errors in production
- Track performance bottlenecks
- Debug production issues with stack traces and breadcrumbs
- Get alerts when critical errors occur
- Understand user impact of errors
- Replay user sessions when errors occur

**Official Documentation**: https://docs.sentry.io/platforms/javascript/guides/react/

---

## Quick Start

### 1. Environment Variables Setup

**For Local Development:**

Create a `.env` file in the project root (DO NOT commit this file):

```bash
# Sentry Configuration
REACT_APP_SENTRY_DSN=https://d0e82d3a63887285586742a51791418600451015212171240.ingest.de.sentry.io/4510152134164560
REACT_APP_SENTRY_ENVIRONMENT=development
REACT_APP_VERSION=0.1.0
```

**For Vercel Production:**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your ArmoraCPO project
3. Navigate to **Settings** → **Environment Variables**
4. Add the following variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `REACT_APP_SENTRY_DSN` | `https://d0e82d3a63887285586742a51791418600451015212171240.ingest.de.sentry.io/4510152134164560` | Production, Preview, Development |
| `REACT_APP_SENTRY_ENVIRONMENT` | `production` | Production Only |
| `REACT_APP_SENTRY_ENVIRONMENT` | `preview` | Preview Only |
| `REACT_APP_VERSION` | `0.1.0` | All Environments |

5. Save and redeploy your application

### 2. Verify Installation

The Sentry SDK is already installed and configured in the codebase:

```bash
npm list @sentry/react
# Should show: @sentry/react@10.18.0
```

### 3. Test the Integration

After deploying, trigger a test error to verify Sentry is capturing events:

```typescript
// Add this temporarily to any component
const testSentry = () => {
  throw new Error('Sentry test error - this is expected!');
};

<button onClick={testSentry}>Test Sentry</button>
```

Check the Sentry dashboard within 1-2 minutes to see the error appear.

---

## Project Details

**Sentry Project Information:**

- **Project Name**: ArmoraCPO
- **DSN**: `https://d0e82d3a63887285586742a51791418600451015212171240.ingest.de.sentry.io/4510152134164560`
- **Region**: EU (Germany - .de domain)
- **Project ID**: `4510152134164560`
- **SDK Version**: @sentry/react v10.18.0
- **Platform**: React 19.2.0 with TypeScript

**Important Notes:**
- The DSN is **safe to expose** in client-side code (it's a public key)
- The DSN can only send events to Sentry, not read data
- Using EU region ensures GDPR compliance for data residency

---

## Configuration

### Current Implementation

Sentry is initialized in **`src/lib/sentry.ts`** and called from **`src/index.tsx`**:

```typescript
// src/index.tsx
import { initSentry } from './lib/sentry';

// Initialize Sentry error tracking
initSentry();
```

### Configuration Details

**Location**: `/workspaces/armoracpo/src/lib/sentry.ts`

Key features configured:

```typescript
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay (with privacy controls)
  replaysSessionSampleRate: 0.1,  // 10% of normal sessions
  replaysOnErrorSampleRate: 1.0,  // 100% of sessions with errors

  // Environment tracking
  environment: process.env.REACT_APP_SENTRY_ENVIRONMENT || process.env.NODE_ENV,

  // Release tracking
  release: process.env.REACT_APP_VERSION || '1.0.0',

  // Integrations
  integrations: [
    new BrowserTracing(),
    Sentry.replayIntegration({
      maskAllText: true,      // Hide all text for privacy
      blockAllMedia: true,    // Block images/videos for privacy
    }),
  ],

  // Filter noise
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'NetworkError',
    'Failed to fetch',
  ],
});
```

---

## Features Implemented

### 1. Error Tracking

**Automatic error capture:**
- Unhandled exceptions
- Promise rejections
- React component errors (via ErrorBoundary)

**Manual error capture:**
```typescript
import { captureError } from '../lib/sentry';

try {
  // risky operation
} catch (error) {
  captureError(error, { context: 'additional info' });
}
```

### 2. User Context Tracking

**Automatic user identification after login:**

Location: `src/services/authService.ts`

```typescript
// Automatically called after successful login
setSentryUser({
  id: authData.user.id,
  email: authData.user.email,
  name: cpoProfile.full_name,
});

// Automatically cleared on logout
clearSentryUser();
```

This allows you to see which users are affected by errors.

### 3. Breadcrumb Logging

**Track user actions leading to errors:**

```typescript
import { addBreadcrumb } from '../lib/sentry';

addBreadcrumb('User accepted assignment', 'user', {
  assignmentId: assignment.id,
  cpoId: cpo.id,
});
```

Breadcrumbs appear in Sentry error reports to help debug issues.

### 4. Performance Monitoring

**Automatic transaction tracking:**
- Page load times
- API call durations
- React component render times

Sample rate: 10% in production, 100% in development.

### 5. Session Replay

**Visual playback of user sessions when errors occur:**
- Text is masked for privacy
- Media is blocked for privacy
- 10% of normal sessions recorded
- 100% of sessions with errors recorded

### 6. Error Boundary Integration

**Location**: `src/components/common/ErrorBoundary.tsx`

Catches React component errors and reports them to Sentry:

```typescript
componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
  Sentry.captureException(error, {
    extra: {
      componentStack: errorInfo.componentStack,
    },
  });
}
```

---

## Testing the Integration

### Test 1: Basic Error Capture

1. Add a test button to any component:

```typescript
const Dashboard = () => {
  const throwTestError = () => {
    throw new Error('Sentry Integration Test - ' + new Date().toISOString());
  };

  return (
    <div>
      {/* ... other content ... */}
      <button onClick={throwTestError}>Test Sentry Error</button>
    </div>
  );
};
```

2. Click the button
3. Check the Sentry dashboard within 1-2 minutes
4. You should see the error with full stack trace

### Test 2: User Context

1. Log in to the application
2. Trigger a test error (using method above)
3. Check the error in Sentry dashboard
4. Verify that user information is attached to the error:
   - User ID
   - Email
   - Name

### Test 3: Breadcrumb Trail

```typescript
import { addBreadcrumb } from '../lib/sentry';

const testBreadcrumbs = () => {
  addBreadcrumb('User navigated to dashboard', 'navigation');
  addBreadcrumb('User clicked test button', 'ui.click');
  addBreadcrumb('About to throw test error', 'debug');

  throw new Error('Test error with breadcrumbs');
};
```

Check the error in Sentry - you should see the breadcrumb trail.

### Test 4: Performance Monitoring

1. Navigate through the app normally
2. Go to Sentry Dashboard → Performance
3. You should see transaction data for page loads and navigation

### Test 5: Session Replay

1. Trigger an error while interacting with the app
2. Go to Sentry Dashboard → Replays
3. You should see a session replay showing what the user did before the error

---

## Viewing Errors in Sentry Dashboard

### Access the Dashboard

**Dashboard URL**: https://sentry.io/

Log in with your Sentry account credentials.

### Navigate to Your Project

1. Click on **Projects** in the sidebar
2. Select **armoracpo**

### Issues Tab

**URL**: https://sentry.io/organizations/[YOUR_ORG]/issues/

**Features:**
- View all captured errors
- Filter by environment (development, production, preview)
- Filter by release version
- Filter by affected users
- Sort by frequency, first seen, last seen
- Group similar errors together

**Issue Details:**
- Full stack trace with source maps
- Breadcrumb trail showing user actions
- User context (ID, email, name)
- Device/browser information
- Environment variables
- Tags and custom context

**Actions:**
- Assign to team member
- Mark as resolved
- Ignore future occurrences
- Create GitHub issue
- Merge duplicate issues

### Performance Tab

**URL**: https://sentry.io/organizations/[YOUR_ORG]/performance/

**Metrics:**
- Page load times (p75, p95, p99)
- API call durations
- Database query performance
- Frontend transaction times

**Transaction Details:**
- Waterfall view of operations
- Slowest transactions
- Transactions by endpoint
- Trends over time

### Replays Tab

**URL**: https://sentry.io/organizations/[YOUR_ORG]/replays/

**Features:**
- Video-like playback of user sessions
- Synchronized with error timeline
- Network activity view
- Console logs
- DOM mutations
- Click/scroll tracking

### Alerts Tab

**Configure notifications for:**
- New issues
- Issue regression (issue comes back after being resolved)
- High error rate spikes
- Performance degradation
- Specific error types

**Notification Channels:**
- Email
- Slack
- PagerDuty
- Discord
- Webhook

### Releases Tab

**Track deployments and their impact:**
- Errors introduced in each release
- Performance changes per release
- Adoption rate of new releases
- Crash-free sessions per release

---

## Usage in Code

### Import Sentry Utilities

```typescript
import {
  captureError,
  captureMessage,
  addBreadcrumb,
  setSentryUser,
  clearSentryUser,
} from '../lib/sentry';
```

### Capture Errors

```typescript
// In try-catch blocks
try {
  await submitIncidentReport(data);
} catch (error) {
  captureError(error, {
    feature: 'incident-reporting',
    reportId: data.id,
  });
  throw error; // Re-throw to show user-facing error
}
```

### Capture Messages

```typescript
// Log important events
captureMessage('CPO accepted high-value assignment', 'info');
captureMessage('Payment processing failed', 'warning');
captureMessage('Critical security incident', 'error');
```

### Add Breadcrumbs

```typescript
// Track user journey
addBreadcrumb('User started incident report', 'user');
addBreadcrumb('Media upload completed', 'process', {
  fileCount: 3,
  totalSize: '5.2MB',
});
addBreadcrumb('Report submitted successfully', 'success');
```

### Set Custom Tags

```typescript
import * as Sentry from '@sentry/react';

// Tag errors by feature area
Sentry.setTag('feature', 'incident-reporting');
Sentry.setTag('user_role', 'cpo');
Sentry.setTag('assignment_type', 'executive_protection');
```

### Add Custom Context

```typescript
import * as Sentry from '@sentry/react';

// Add additional context to errors
Sentry.setContext('assignment', {
  id: assignment.id,
  status: assignment.status,
  principal: assignment.principal_name,
  startTime: assignment.start_time,
});

Sentry.setContext('device', {
  gpsEnabled: navigator.geolocation !== undefined,
  online: navigator.onLine,
  platform: navigator.platform,
});
```

### Measure Performance

```typescript
import * as Sentry from '@sentry/react';

// Start a custom transaction
const transaction = Sentry.startTransaction({
  name: 'Load Active Assignment',
  op: 'data.fetch',
});

try {
  const data = await fetchAssignmentData();
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

---

## Best Practices

### 1. Privacy and Security

**Always filter sensitive data before sending to Sentry:**

```typescript
// Already configured in src/lib/sentry.ts
beforeSend(event) {
  // Remove Authorization headers
  if (event.request?.headers) {
    delete event.request.headers['Authorization'];
    delete event.request.headers['Cookie'];
  }

  // Don't send passwords
  if (event.extra?.password) {
    delete event.extra.password;
  }

  return event;
}
```

**For ArmoraCPO security considerations:**
- Never send SIA license numbers to Sentry
- Redact principal names and addresses
- Filter out incident report media URLs
- Remove payment information

### 2. Environment Separation

**Always separate errors by environment:**

```typescript
// Development
REACT_APP_SENTRY_ENVIRONMENT=development

// Staging
REACT_APP_SENTRY_ENVIRONMENT=staging

// Production
REACT_APP_SENTRY_ENVIRONMENT=production
```

This allows you to:
- Filter production-only issues
- Test in development without noise
- Track environment-specific bugs

### 3. Performance Sampling

**Reduce costs by sampling performance data:**

```typescript
// Production: Sample 10% of transactions
tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
```

For high-traffic applications, 10% sampling is usually sufficient while staying within free tier limits.

### 4. Ignore Known Issues

**Filter out noise from browser extensions and known issues:**

```typescript
ignoreErrors: [
  // Browser extension errors
  'ResizeObserver loop limit exceeded',
  /chrome-extension:\/\//,

  // Network errors (user's connection issues)
  'NetworkError',
  'Failed to fetch',

  // Non-critical errors
  'Non-Error promise rejection captured',
],
```

### 5. Add Context Everywhere

**The more context, the easier debugging:**

```typescript
// Before critical operations
addBreadcrumb('Starting GPS location capture', 'process');
Sentry.setTag('feature', 'location-tracking');
Sentry.setContext('gps', {
  accuracy: position.coords.accuracy,
  altitude: position.coords.altitude,
});

// Then perform operation
try {
  await captureGPSLocation();
} catch (error) {
  captureError(error); // Will include all context above
}
```

### 6. Use Release Tracking

**Track which version introduced bugs:**

```bash
# Set in environment variables
REACT_APP_VERSION=1.2.3

# Or use git commit hash
REACT_APP_VERSION=$(git rev-parse --short HEAD)
```

This helps identify if a new deployment introduced errors.

### 7. Set Up Alerts

**Get notified immediately for critical errors:**

In Sentry Dashboard:
1. Go to **Alerts** → **Create Alert**
2. Set conditions:
   - Error rate > 10 errors/minute
   - New issue created
   - Issue regressed after being resolved
3. Choose notification channel (email, Slack)
4. Save alert

---

## Troubleshooting

### Issue: Sentry is not capturing errors

**Solutions:**

1. **Check DSN is configured:**
```bash
# In your .env file
echo $REACT_APP_SENTRY_DSN
# Should output the DSN
```

2. **Check Sentry is initialized:**
```typescript
// Check console on app start
// You should see Sentry initialization logs in development
```

3. **Check environment:**
```typescript
// Sentry only sends events if DSN is set
if (!process.env.REACT_APP_SENTRY_DSN) {
  console.warn('Sentry DSN not configured');
}
```

4. **Check browser console for errors:**
- Look for Sentry-related errors
- Check if DSN is valid
- Verify network requests to Sentry are not blocked

5. **Verify in Sentry dashboard:**
- Check if events are being received
- Look at "Stats" to see ingestion rate

### Issue: Stack traces are minified/unreadable

**Solutions:**

1. **Enable source maps in production:**
```json
// package.json
{
  "scripts": {
    "build": "GENERATE_SOURCEMAP=true react-scripts build"
  }
}
```

2. **Upload source maps to Sentry:**
```bash
# Install Sentry CLI
npm install --save-dev @sentry/cli

# Create .sentryclirc file
[defaults]
url=https://sentry.io/
org=your-org-slug
project=armoracpo

[auth]
token=YOUR_AUTH_TOKEN

# Upload after build
sentry-cli sourcemaps upload --release $VERSION build/static/js
```

### Issue: Too many events / quota exceeded

**Solutions:**

1. **Reduce sample rates:**
```typescript
// In src/lib/sentry.ts
tracesSampleRate: 0.05,  // Sample only 5% of transactions
replaysSessionSampleRate: 0.05,  // Sample only 5% of sessions
```

2. **Add more filters:**
```typescript
ignoreErrors: [
  // Add patterns for errors to ignore
  /^Non-Error/,
  /ResizeObserver/,
  /chrome-extension/,
],
```

3. **Resolve duplicate issues:**
- Go to Sentry dashboard
- Merge similar issues
- Mark resolved issues as "Resolved"

4. **Upgrade Sentry plan:**
- Free tier: 5,000 errors/month
- Team plan ($26/month): 50,000 errors/month

### Issue: User information not showing in errors

**Solutions:**

1. **Verify user context is set after login:**
```typescript
// In authService.ts
setSentryUser({
  id: user.id,
  email: user.email,
  name: user.name,
});
```

2. **Check that user context persists:**
```typescript
// Verify in browser console
import * as Sentry from '@sentry/react';
console.log(Sentry.getCurrentHub().getScope().getUser());
```

3. **Ensure user context is not cleared prematurely:**
- Only call `clearSentryUser()` on logout
- Check if session is being destroyed unexpectedly

### Issue: Session replays not appearing

**Solutions:**

1. **Check replay sample rates:**
```typescript
replaysSessionSampleRate: 0.1,  // 10% of sessions
replaysOnErrorSampleRate: 1.0,  // 100% of error sessions
```

2. **Verify replay integration is configured:**
```typescript
integrations: [
  Sentry.replayIntegration({
    maskAllText: true,
    blockAllMedia: true,
  }),
],
```

3. **Check quota limits:**
- Free tier has limited replay capacity
- Upgrade if needed

---

## Advanced Configuration

### React Router Integration

Already configured in `src/lib/sentry.ts`:

```typescript
import { BrowserTracing } from '@sentry/tracing';

integrations: [
  new BrowserTracing({
    routingInstrumentation: Sentry.reactRouterV6Instrumentation(
      useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes
    ),
  }),
],
```

This automatically tracks:
- Route changes as transactions
- Navigation timing
- Route-specific errors

### Custom Fingerprinting

Group similar errors together:

```typescript
beforeSend(event, hint) {
  // Group all API timeout errors together
  if (hint.originalException?.message?.includes('timeout')) {
    event.fingerprint = ['api-timeout'];
  }

  // Group by error type + route
  event.fingerprint = [
    event.exception?.values?.[0]?.type || 'unknown',
    event.transaction || 'unknown',
  ];

  return event;
}
```

### Custom Error Boundaries

Create feature-specific error boundaries:

```typescript
import * as Sentry from '@sentry/react';

const IncidentReportErrorBoundary = Sentry.withErrorBoundary(
  IncidentReportForm,
  {
    fallback: <ErrorFallback />,
    showDialog: true,
    dialogOptions: {
      title: 'Incident Report Error',
      subtitle: 'Our team has been notified.',
    },
  }
);
```

### Capture Console Logs

```typescript
integrations: [
  new Sentry.Integrations.CaptureConsole({
    levels: ['error', 'warn'],
  }),
],
```

### Track Custom Metrics

```typescript
import * as Sentry from '@sentry/react';

// Track custom metrics
Sentry.metrics.increment('assignment.accepted');
Sentry.metrics.timing('incident.report.submission', 1234);
Sentry.metrics.gauge('active.assignments', 5);
```

---

## Cost Management

### Sentry Free Tier Limits

- **Errors**: 5,000 events/month
- **Performance**: 10,000 transactions/month
- **Replays**: Limited (check current limits)
- **Users**: 1 user
- **Retention**: 30 days

### Staying Within Free Tier

1. **Sample aggressively in production:**
```typescript
tracesSampleRate: 0.1,        // 10% of transactions
replaysSessionSampleRate: 0.1, // 10% of sessions
```

2. **Filter low-value errors:**
```typescript
ignoreErrors: [/* known non-critical errors */],
```

3. **Resolve issues promptly:**
- Mark resolved issues as "Resolved" to reduce noise
- Merge duplicate issues

4. **Monitor quota usage:**
- Check Sentry dashboard → Settings → Usage & Billing
- Set up alerts when approaching limits

### Paid Plans

**Team Plan ($26/month)**:
- 50,000 errors/month
- 100,000 transactions/month
- Unlimited users
- 90-day retention

**Business Plan ($80/month)**:
- 250,000 errors/month
- 500,000 transactions/month
- Advanced features

---

## Security Considerations

### Safe to Expose

- Sentry DSN (it's a public key)
- Project ID
- Environment names
- Release versions

### Keep Secret

- Sentry Auth Token (for CLI/API access)
- Organization slug (if private)
- Sentry API keys (for backend integrations)

### GDPR Compliance

The project uses Sentry's EU region (`.de` domain):
- Data stored in Germany
- GDPR-compliant data processing
- User consent handled by privacy policy

**Additional privacy measures:**
```typescript
// Mask all text in session replays
replayIntegration({
  maskAllText: true,
  blockAllMedia: true,
})

// Filter sensitive data before sending
beforeSend(event) {
  // Remove PII
  delete event.user?.email;
  delete event.user?.ip_address;
  return event;
}
```

---

## Next Steps

1. Set `REACT_APP_SENTRY_DSN` in Vercel environment variables
2. Deploy the application
3. Test error capture by triggering a test error
4. Configure alerts in Sentry dashboard
5. Set up Slack/email notifications
6. Review captured errors weekly
7. Upload source maps for readable stack traces (optional)
8. Monitor quota usage
9. Adjust sample rates if needed

---

## Support Resources

- **Sentry Documentation**: https://docs.sentry.io/
- **React SDK Docs**: https://docs.sentry.io/platforms/javascript/guides/react/
- **Sentry Dashboard**: https://sentry.io/
- **Community Forum**: https://forum.sentry.io/
- **Status Page**: https://status.sentry.io/
- **ArmoraCPO Sentry Config**: `/workspaces/armoracpo/src/lib/sentry.ts`

---

**Status**: Configured and ready to use
**Last Updated**: 2025-10-08
**Version**: 1.0.0
**Region**: EU (Germany)
