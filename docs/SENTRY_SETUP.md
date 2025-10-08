# Sentry Error Monitoring Setup Guide - ArmoraCPO

## Overview

ArmoraCPO uses Sentry for production error monitoring, performance tracking, and debugging. This guide walks you through setting up Sentry for the application.

---

## What is Sentry?

Sentry is a real-time error tracking platform that helps you:
- Monitor JavaScript errors in production
- Track performance issues
- Debug production issues with stack traces and breadcrumbs
- Get alerts when critical errors occur
- Understand user impact of errors

**Official Website**: https://sentry.io

---

## Current Implementation

The ArmoraCPO codebase includes Sentry integration via `src/lib/sentry.ts`:

```typescript
// Sentry is already integrated in:
- src/lib/sentry.ts          // Core Sentry configuration
- src/services/*             // Breadcrumb tracking
- src/App.tsx                // Error boundary integration
```

### Features Implemented:
- ✅ Error tracking with source maps
- ✅ Breadcrumb logging for debugging context
- ✅ User identification (CPO ID)
- ✅ Performance monitoring
- ✅ Environment separation (dev/staging/prod)

---

## Setup Instructions

### Step 1: Create Sentry Account

1. Go to https://sentry.io/signup/
2. Sign up for a free account
3. Choose "React" as your platform
4. Create a new project named: **armoracpo**

### Step 2: Get Your DSN

After creating the project, Sentry will show you a **DSN (Data Source Name)**. It looks like:

```
https://1234567890abcdef1234567890abcdef@o123456.ingest.sentry.io/1234567
```

This is your unique project identifier. **Copy this value.**

### Step 3: Configure Environment Variables

#### For Local Development:

Add to your `.env` file (DO NOT commit this file):

```bash
# Sentry Configuration
REACT_APP_SENTRY_DSN=https://YOUR_DSN_HERE@o123456.ingest.sentry.io/1234567
REACT_APP_SENTRY_ENVIRONMENT=development
```

#### For Vercel Production:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your ArmoraCPO project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Name | Value | Environments |
|------|-------|--------------|
| `REACT_APP_SENTRY_DSN` | `https://YOUR_DSN_HERE@...` | Production, Preview, Development |
| `REACT_APP_SENTRY_ENVIRONMENT` | `production` | Production |
| `REACT_APP_SENTRY_ENVIRONMENT` | `preview` | Preview |
| `REACT_APP_SENTRY_ENVIRONMENT` | `development` | Development |

5. Click **Save**
6. Trigger a new deployment

### Step 4: Configure Source Maps (Optional but Recommended)

Source maps help Sentry show readable stack traces instead of minified code.

#### Option A: Upload via Sentry CLI (Recommended)

1. Install Sentry CLI:
```bash
npm install --save-dev @sentry/cli
```

2. Create `.sentryclirc` in project root:
```ini
[defaults]
url=https://sentry.io/
org=your-org-slug
project=armoracpo

[auth]
token=YOUR_AUTH_TOKEN
```

3. Get auth token from: https://sentry.io/settings/account/api/auth-tokens/

4. Add to `package.json`:
```json
{
  "scripts": {
    "build": "react-scripts build && npm run sentry:sourcemaps",
    "sentry:sourcemaps": "sentry-cli sourcemaps upload --release $npm_package_version build/static/js"
  }
}
```

#### Option B: Use Sentry Webpack Plugin

Already configured in `src/lib/sentry.ts` if you're using Create React App.

---

## Sentry Configuration Options

### Current Configuration (src/lib/sentry.ts)

```typescript
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.REACT_APP_SENTRY_ENVIRONMENT || 'development',

  // Performance monitoring
  tracesSampleRate: 1.0, // 100% of transactions (adjust for production)

  // Only track errors in production
  enabled: process.env.NODE_ENV === 'production',

  // Filter out sensitive data
  beforeSend(event) {
    // Remove user passwords, tokens, etc.
    if (event.request?.headers) {
      delete event.request.headers['Authorization'];
      delete event.request.headers['Cookie'];
    }
    return event;
  },
});
```

### Recommended Production Settings:

```typescript
{
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: 'production',

  // Sample 10% of transactions for performance monitoring (reduce costs)
  tracesSampleRate: 0.1,

  // Filter out low-priority errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],

  // Tag all events with release version
  release: process.env.REACT_APP_VERSION,
}
```

---

## Usage in Code

### Track Errors

Sentry automatically captures unhandled errors, but you can also manually report:

```typescript
import * as Sentry from '@sentry/react';

try {
  // Your code
} catch (error) {
  Sentry.captureException(error);
}
```

### Add Breadcrumbs

Breadcrumbs provide context for debugging:

```typescript
import { addBreadcrumb } from '../lib/sentry';

// Add breadcrumb before important operations
addBreadcrumb('User accepted assignment', 'user', {
  assignmentId: assignment.id,
  cpoId: cpo.id,
});
```

### Set User Context

```typescript
import { setUser } from '../lib/sentry';

// After successful login
setUser({
  id: officer.id,
  email: user.email,
  username: `${officer.first_name} ${officer.last_name}`,
});
```

### Track Performance

```typescript
import * as Sentry from '@sentry/react';

const transaction = Sentry.startTransaction({
  name: 'Load Dashboard',
  op: 'navigation',
});

// Your code...

transaction.finish();
```

---

## Testing Sentry Integration

### 1. Test Error Capture (Development)

Add this to any component:

```typescript
const testSentry = () => {
  throw new Error('Sentry test error!');
};

<button onClick={testSentry}>Test Sentry</button>
```

Check Sentry dashboard to see if error appears.

### 2. Test Breadcrumbs

```typescript
import { addBreadcrumb } from '../lib/sentry';

addBreadcrumb('Test breadcrumb', 'debug', {
  testData: 'Hello Sentry!',
});

throw new Error('Test error with breadcrumb');
```

The error in Sentry should show the breadcrumb trail.

### 3. Test User Identification

```typescript
import { setUser } from '../lib/sentry';

setUser({
  id: 'test-user-123',
  email: 'test@example.com',
});

throw new Error('Test error with user context');
```

Check that the error in Sentry shows user information.

---

## Sentry Dashboard Overview

### Issues Tab
- **View**: All captured errors
- **Filter**: By environment, release, user
- **Actions**: Assign, resolve, ignore, merge issues

### Performance Tab
- **View**: Transaction performance metrics
- **Monitor**: Page load times, API call durations
- **Optimize**: Identify slow endpoints

### Releases Tab
- **Track**: Errors per release version
- **Compare**: Performance across versions
- **Rollback**: Identify problematic releases

### Alerts
- **Configure**: Email/Slack notifications
- **Rules**: Alert on error spike, new issues, regression
- **Thresholds**: Set error rate limits

---

## Best Practices

### 1. Environment Separation

Always separate dev/staging/production errors:

```typescript
environment: process.env.REACT_APP_SENTRY_ENVIRONMENT || 'development'
```

### 2. Filter Sensitive Data

Never send passwords, tokens, or PII to Sentry:

```typescript
beforeSend(event) {
  // Remove Authorization headers
  delete event.request?.headers?.['Authorization'];

  // Remove email/phone from user data
  if (event.user) {
    delete event.user.email;
    delete event.user.phone;
  }

  return event;
}
```

### 3. Sample Performance Data

For high-traffic apps, sample transactions to reduce costs:

```typescript
tracesSampleRate: 0.1 // Only track 10% of transactions
```

### 4. Add Context

Use breadcrumbs and tags to make debugging easier:

```typescript
Sentry.setTag('feature', 'incident-reporting');
Sentry.setContext('assignment', {
  id: assignment.id,
  status: assignment.status,
});
```

### 5. Ignore Known Issues

Filter out noise from browser extensions, etc.:

```typescript
ignoreErrors: [
  'ResizeObserver loop limit exceeded',
  'Non-Error promise rejection captured',
  /^chrome-extension:\/\//,
]
```

---

## Troubleshooting

### Issue: "Sentry is not sending errors"

**Solution**:
1. Check `REACT_APP_SENTRY_DSN` is set correctly
2. Verify Sentry is enabled: `enabled: process.env.NODE_ENV === 'production'`
3. Check browser console for Sentry initialization logs
4. Ensure source maps are uploaded (for readable stack traces)

### Issue: "Too many events / quota exceeded"

**Solution**:
1. Reduce `tracesSampleRate` (e.g., `0.1` instead of `1.0`)
2. Add filters to ignore low-priority errors
3. Upgrade Sentry plan if needed

### Issue: "Stack traces are minified"

**Solution**:
1. Upload source maps via Sentry CLI
2. Configure Sentry webpack plugin
3. Check build artifacts include `.map` files

### Issue: "Errors not attributed to users"

**Solution**:
1. Ensure `setUser()` is called after login
2. Check user ID is included in error events
3. Verify RLS policies don't block user data

---

## Cost Management

Sentry's free tier includes:
- **5,000 errors/month**
- **10,000 performance units/month**
- **1 user**
- **30-day data retention**

**Tips to stay within free tier:**
- Sample performance events (`tracesSampleRate: 0.1`)
- Filter out known/low-priority errors
- Resolve duplicate issues promptly
- Monitor quota usage in Sentry dashboard

**Paid plans start at $26/month** for more events and features.

---

## Security Considerations

### ✅ Safe to Expose
- Sentry DSN (public key)
- Project ID
- Environment name

**Why?** The DSN is meant for client-side use. It can only send events to your Sentry project, not read data.

### 🔒 Keep Secret
- Sentry Auth Token (for CLI/API access)
- Organization slug
- Sentry API keys

---

## Next Steps

1. ✅ Create Sentry account and project
2. ✅ Get your DSN from Sentry dashboard
3. ✅ Set `REACT_APP_SENTRY_DSN` in Vercel environment variables
4. ✅ Deploy the app
5. ✅ Test error tracking by triggering a test error
6. ✅ Configure alerts in Sentry dashboard
7. ✅ (Optional) Upload source maps for readable stack traces

---

## Support Resources

- **Sentry Documentation**: https://docs.sentry.io/platforms/javascript/guides/react/
- **Sentry Dashboard**: https://sentry.io/organizations/YOUR_ORG/issues/
- **Community Forum**: https://forum.sentry.io/
- **Status Page**: https://status.sentry.io/

---

**Status**: ✅ Code integration complete (DSN configuration required)
**Last Updated**: 2025-10-08
**Version**: 1.0
