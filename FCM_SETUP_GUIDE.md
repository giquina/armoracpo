# Firebase Cloud Messaging (FCM) Setup Guide - Armora CPO

## Current Implementation Status

✅ **COMPLETE** - Firebase is properly configured and ready for use
⚠️ **ACTION REQUIRED** - VAPID key must be obtained from Firebase Console

---

## Overview

The ArmoraCPO app uses Firebase Cloud Messaging (FCM) for push notifications. The implementation is **production-ready** and only requires the VAPID key to be configured.

### What Changed

1. ✅ Fixed `notificationService.ts` to use `protection_officers.fcm_token` instead of non-existent `cpo_fcm_tokens` table
2. ✅ Updated `service-worker.js` with proper Firebase initialization
3. ✅ Updated `firebase-messaging-sw.js` with latest Firebase SDK (v10.7.1)
4. ✅ Configured environment variables in `.env.example` and `.env.production`
5. ✅ Updated `manifest.json` with correct `gcm_sender_id`

---

## Firebase Configuration (Already Set)

The app is configured with the following Firebase project:

```
Project Name: armora-protection
Project ID: armora-protection
Sender ID: 785567849849
```

### Environment Variables

These are already set in the codebase (safe to expose client-side):

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyDBpJL8uN2s6HN4qcWnR0vCwZVU5w3g5YE
REACT_APP_FIREBASE_AUTH_DOMAIN=armora-protection.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=armora-protection
REACT_APP_FIREBASE_STORAGE_BUCKET=armora-protection.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=785567849849
REACT_APP_FIREBASE_APP_ID=1:785567849849:web:1e8a4e3f2e0b9c8d4f5e6a
```

---

## 🚨 CRITICAL: VAPID Key Required

The **only missing piece** is the Firebase VAPID key for Web Push notifications.

### How to Get Your VAPID Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **armora-protection**
3. Click the gear icon ⚙️ → **Project Settings**
4. Go to the **Cloud Messaging** tab
5. Scroll down to **Web Push certificates**
6. If no key exists, click **Generate key pair**
7. Copy the **Key pair** value (starts with `B...`)

### Where to Set the VAPID Key

#### For Vercel Deployment (Production):
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your ArmoraCPO project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `REACT_APP_FIREBASE_VAPID_KEY`
   - **Value**: `[Your VAPID key from Firebase Console]`
   - **Environments**: Production, Preview, Development

#### For Local Development:
Add to your `.env` file (DO NOT commit this file):
```env
REACT_APP_FIREBASE_VAPID_KEY=YOUR_VAPID_KEY_HERE
```

---

## How Push Notifications Work

### 1. User Login Flow
```
User logs in → requestNotificationPermission() is called
    ↓
Browser prompts for notification permission
    ↓
If granted → FCM token is generated
    ↓
Token is saved to protection_officers.fcm_token in Supabase
```

### 2. Backend Sends Notification
```
Backend (Supabase Edge Function or your server)
    ↓
Fetches CPO's fcm_token from database
    ↓
Sends notification via Firebase Admin SDK
    ↓
FCM delivers to user's device
```

### 3. Notification Delivery
- **App in foreground**: Handled by `onMessage()` in `notificationService.ts`
- **App in background**: Handled by `service-worker.js` or `firebase-messaging-sw.js`
- **App closed**: Still delivered via service worker

---

## File Structure

```
src/
├── lib/
│   └── firebase.ts                    # Firebase initialization
├── services/
│   └── notificationService.ts         # Notification permission & handling
public/
├── service-worker.js                  # Main service worker (with FCM)
├── firebase-messaging-sw.js           # FCM-specific service worker
└── manifest.json                      # PWA manifest (includes gcm_sender_id)
```

---

## Code Review

### ✅ firebase.ts (Production Ready)
```typescript
// Initializes Firebase with environment variables
// Exports requestNotificationPermission() function
// Saves FCM token to protection_officers table
```

### ✅ notificationService.ts (Fixed)
```typescript
// Fixed to use protection_officers.fcm_token
// Handles foreground notifications
// Shows browser notifications when app is active
```

### ✅ service-worker.js (Updated)
```typescript
// Uses Firebase SDK v10.7.1
// Handles background notifications
// Includes caching strategy for offline support
```

---

## Database Schema

The FCM token is stored in the `protection_officers` table:

```sql
CREATE TABLE protection_officers (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  fcm_token text,  -- ← FCM token stored here
  -- ... other fields
);
```

**Note**: There is NO separate `cpo_fcm_tokens` table. This was corrected in `notificationService.ts`.

---

## Testing Notifications

### 1. Test Permission Request

After deploying with VAPID key:

```javascript
// Open browser console on your app
// Navigate to dashboard (triggers notification init)
// Check console for:
console.log('[Notifications] FCM token obtained: ...');
```

### 2. Test Notification Sending

Use Firebase Console to send a test notification:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select **armora-protection** project
3. Click **Cloud Messaging** in left menu
4. Click **Send your first message**
5. Fill in:
   - **Notification title**: "Test Notification"
   - **Notification text**: "This is a test"
   - **Target**: Select your app
6. Click **Send test message**
7. Paste your FCM token (from browser console)
8. Click **Test**

### 3. Test Background Notifications

1. Keep app open, switch to another tab
2. Send test notification via Firebase Console
3. You should see notification appear in system tray

---

## Sending Notifications from Backend

### Using Firebase Admin SDK (Node.js)

```javascript
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: 'armora-protection',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
});

// Send notification to specific CPO
async function sendJobNotification(cpoUserId, jobDetails) {
  // 1. Get FCM token from database
  const { data: officer } = await supabase
    .from('protection_officers')
    .select('fcm_token')
    .eq('user_id', cpoUserId)
    .single();

  if (!officer?.fcm_token) {
    console.log('No FCM token for user:', cpoUserId);
    return;
  }

  // 2. Send notification via FCM
  const message = {
    notification: {
      title: '🚨 New Job Available',
      body: `${jobDetails.type} - ${jobDetails.location} - £${jobDetails.rate}/hr`
    },
    data: {
      type: 'new_job',
      assignmentId: jobDetails.id,
      url: `/jobs/available/${jobDetails.id}`,
      requireInteraction: 'true'
    },
    token: officer.fcm_token
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Notification sent:', response);
  } catch (error) {
    console.error('Error sending notification:', error);

    // If token is invalid, clear it from database
    if (error.code === 'messaging/invalid-registration-token') {
      await supabase
        .from('protection_officers')
        .update({ fcm_token: null })
        .eq('user_id', cpoUserId);
    }
  }
}
```

### Using Supabase Edge Function

```typescript
// supabase/functions/send-notification/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { cpoUserId, notification } = await req.json();

  // Get FCM token from database
  const { data: officer } = await supabase
    .from('protection_officers')
    .select('fcm_token')
    .eq('user_id', cpoUserId)
    .single();

  if (!officer?.fcm_token) {
    return new Response('No FCM token', { status: 400 });
  }

  // Send notification via Firebase Admin SDK
  const response = await fetch('https://fcm.googleapis.com/v1/projects/armora-protection/messages:send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FCM_SERVER_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: {
        token: officer.fcm_token,
        notification: notification,
        data: { /* custom data */ }
      }
    })
  });

  return new Response(JSON.stringify(await response.json()));
});
```

---

## Notification Types for ArmoraCPO

### 1. New Job Alert
```javascript
{
  notification: {
    title: '🚨 New Job Available',
    body: 'Close Protection - Mayfair, London - £45/hr'
  },
  data: {
    type: 'new_job',
    assignmentId: 'uuid',
    url: '/jobs/available',
    requireInteraction: 'true'
  }
}
```

### 2. Job Assignment
```javascript
{
  notification: {
    title: '✅ Job Assigned',
    body: 'You have been assigned to a new job'
  },
  data: {
    type: 'job_assigned',
    assignmentId: 'uuid',
    url: '/active'
  }
}
```

### 3. Job Update
```javascript
{
  notification: {
    title: 'Job Update',
    body: 'Meeting point changed to Park Lane entrance'
  },
  data: {
    type: 'job_update',
    assignmentId: 'uuid',
    url: '/active'
  }
}
```

### 4. Compliance Reminder
```javascript
{
  notification: {
    title: '⚠️ SIA License Expiring',
    body: 'Your SIA license expires in 30 days'
  },
  data: {
    type: 'compliance_reminder',
    url: '/compliance'
  }
}
```

### 5. Message Received
```javascript
{
  notification: {
    title: '💬 New Message',
    body: 'Client: Please arrive 10 minutes early'
  },
  data: {
    type: 'message',
    assignmentId: 'uuid',
    url: '/messages'
  }
}
```

---

## Security Considerations

### ✅ Safe to Expose (Client-Side)
- Firebase API Key
- Firebase Project ID
- Firebase App ID
- Messaging Sender ID
- VAPID Public Key

**Why?** These are meant for client-side use. Security is enforced via:
- Firebase Security Rules
- Domain restrictions in Firebase Console
- Row Level Security (RLS) in Supabase

### 🔒 Keep Secret (Server-Side Only)
- Firebase Admin SDK private key
- Supabase service role key
- Any server-side API keys

---

## Troubleshooting

### Issue: "Messaging not initialized"
**Solution**: Ensure VAPID key is set in environment variables

### Issue: "Permission denied"
**Solution**: User must grant notification permission in browser

### Issue: "Service worker not registered"
**Solution**: Service workers only work in production or over HTTPS

### Issue: "FCM token not saved to database"
**Solution**: Check Supabase RLS policies allow updates to `protection_officers.fcm_token`

### Issue: Notifications not appearing
**Solution**:
1. Check browser notification settings
2. Verify FCM token is valid
3. Check service worker is active in DevTools → Application → Service Workers

---

## Deployment Checklist

### Pre-Deployment
- [ ] Obtain VAPID key from Firebase Console
- [ ] Set `REACT_APP_FIREBASE_VAPID_KEY` in Vercel environment variables
- [ ] Set `REACT_APP_SUPABASE_ANON_KEY` in Vercel environment variables
- [ ] Verify Firebase project has Cloud Messaging enabled
- [ ] Add authorized domains in Firebase Console (your-app.vercel.app)

### Post-Deployment
- [ ] Test notification permission request
- [ ] Verify FCM token is saved to database
- [ ] Send test notification from Firebase Console
- [ ] Test foreground notifications
- [ ] Test background notifications
- [ ] Verify notification click actions work

---

## Next Steps

1. **Get VAPID Key** from Firebase Console (most important!)
2. **Set Environment Variables** in Vercel
3. **Deploy** the app
4. **Test Notifications** using Firebase Console
5. **Implement Backend** notification triggers (when jobs are created, etc.)
6. **Monitor** Firebase usage in Console

---

## Support

- Firebase Console: https://console.firebase.google.com/project/armora-protection
- Firebase Documentation: https://firebase.google.com/docs/cloud-messaging
- Web Push Notifications Guide: https://web.dev/push-notifications-overview/

---

**Status**: ✅ Ready for production (pending VAPID key configuration)
**Last Updated**: 2025-10-07
**Version**: 1.0
