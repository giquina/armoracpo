# Firebase VAPID Key Setup Guide - ArmoraCPO

## What is a VAPID Key?

**VAPID** (Voluntary Application Server Identification) is a security protocol for web push notifications. The VAPID key is a public/private key pair that:

- Authenticates your server to Firebase Cloud Messaging (FCM)
- Allows browsers to verify push notification sources
- Required for sending push notifications to web browsers
- Must be configured for the ArmoraCPO app to send notifications to CPOs

**Without the VAPID key**: Push notifications will NOT work.

---

## Why Do You Need It?

The ArmoraCPO app sends push notifications for:
- 🚨 New job assignments
- 💬 New messages from clients
- ⚠️ Assignment updates
- ⏰ Compliance reminders (SIA license expiry, etc.)
- 🆘 Emergency alerts

These notifications are delivered via **Firebase Cloud Messaging (FCM)**, which requires a VAPID key for browser-based apps.

---

## How to Get Your VAPID Key

### Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Sign in with your Google account
3. Select your Firebase project: **armora-protection**

> **Don't have a Firebase project?** See the [FCM Setup Guide](/workspaces/armoracpo/FCM_SETUP_GUIDE.md) for full Firebase configuration.

### Step 2: Navigate to Cloud Messaging Settings

1. In the Firebase Console, click the **gear icon** ⚙️ (top left)
2. Select **Project Settings**
3. Go to the **Cloud Messaging** tab

### Step 3: Generate VAPID Key Pair

Scroll down to the **Web Push certificates** section.

**If you already have a key pair:**
- You'll see a key that starts with `B...` (Base64 encoded)
- Copy this key (click the copy icon)
- Skip to Step 4

**If you DON'T have a key pair:**
1. Click **Generate key pair**
2. Firebase will create a new VAPID key
3. Copy the generated key (starts with `B...`)

**Example VAPID Key Format:**
```
BCnJx1g7bP9vW5nJw-example-YourActualKeyWillBeMuchLonger-kY6dGHJk8FGH
```

> **Note**: The VAPID key is public and safe to expose in client-side code.

### Step 4: Save the VAPID Key

⚠️ **IMPORTANT**: Save this key somewhere safe. You'll need it for the next steps.

---

## Configure VAPID Key in Your App

### For Local Development

Add to your `.env` file (located in the project root):

```bash
# Firebase VAPID Key for Push Notifications
REACT_APP_FIREBASE_VAPID_KEY=YOUR_VAPID_KEY_HERE
```

**Example:**
```bash
REACT_APP_FIREBASE_VAPID_KEY=BCnJx1g7bP9vW5nJw-example-YourActualKeyWillBeMuchLonger
```

⚠️ **DO NOT commit `.env` to Git!** It's already in `.gitignore`.

### For Vercel Production Deployment

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **ArmoraCPO** project
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar
5. Click **Add New** button
6. Fill in:
   - **Name**: `REACT_APP_FIREBASE_VAPID_KEY`
   - **Value**: Paste your VAPID key (from Step 3)
   - **Environments**: Check all (Production, Preview, Development)
7. Click **Save**

### Trigger a New Deployment

After adding the environment variable:

```bash
# Option 1: Trigger via Vercel CLI
vercel --prod

# Option 2: Push to main branch (if auto-deploy enabled)
git push origin main

# Option 3: Trigger manual deployment in Vercel Dashboard
```

---

## Verify VAPID Key is Working

### 1. Check Environment Variable is Loaded

After deployment, open your app in a browser:

1. Open **DevTools** (F12)
2. Go to **Console** tab
3. Type:
```javascript
console.log(process.env.REACT_APP_FIREBASE_VAPID_KEY);
```
4. You should see your VAPID key printed

**If it shows `undefined`:**
- Redeploy the app (environment variables are applied at build time)
- Check the variable name is exactly `REACT_APP_FIREBASE_VAPID_KEY`

### 2. Test Notification Permission Request

1. Log in to the app
2. Navigate to the Dashboard
3. You should see a browser notification permission prompt
4. Click **Allow**

**Check the console for:**
```
[Notifications] Requesting notification permission...
[Notifications] FCM token obtained: ...
[Firebase] FCM token saved to database
```

**If you see errors:**
- `Messaging: Please use getToken() with a valid VAPID key` → VAPID key is missing or incorrect
- `Messaging: A problem occurred while subscribing` → Firebase project settings issue

### 3. Test Sending Notifications

#### Via Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select **armora-protection** project
3. Click **Cloud Messaging** in the left menu
4. Click **Send your first message** (or **New campaign**)
5. Fill in:
   - **Notification title**: "Test Notification"
   - **Notification text**: "This is a test push notification"
6. Click **Send test message**
7. Paste your FCM token from browser console:
   ```javascript
   // In browser console
   console.log(localStorage.getItem('fcmToken'));
   ```
8. Click **Test**

You should receive the notification!

#### Via Code (For Developers)

```javascript
// Send test notification from browser console
const token = localStorage.getItem('fcmToken');

fetch('https://fcm.googleapis.com/fcm/send', {
  method: 'POST',
  headers: {
    'Authorization': 'key=YOUR_SERVER_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: token,
    notification: {
      title: 'Test Notification',
      body: 'Hello from ArmoraCPO!',
    },
  }),
});
```

---

## Troubleshooting

### Issue: "VAPID key not found"

**Symptoms**: Console error: `Messaging: Please use getToken() with a valid VAPID key`

**Solution**:
1. Verify VAPID key is set in `.env` (local) or Vercel (production)
2. Check the environment variable name is exactly: `REACT_APP_FIREBASE_VAPID_KEY`
3. Redeploy the app (env vars are applied at build time)
4. Clear browser cache and hard reload

### Issue: "Notification permission denied"

**Symptoms**: Browser shows notification permission is blocked

**Solution**:
1. Go to browser settings → Site settings → Notifications
2. Find your app domain (e.g., `armoracpo.vercel.app`)
3. Change permission from "Blocked" to "Allow"
4. Reload the app

### Issue: "Service worker registration failed"

**Symptoms**: Console error about service worker

**Solution**:
1. Service workers only work on HTTPS (or `localhost`)
2. Check your app is deployed to a secure domain
3. Verify `public/firebase-messaging-sw.js` exists
4. Check browser console for specific error messages

### Issue: "FCM token not saved to database"

**Symptoms**: Notification permission granted but token not in Supabase

**Solution**:
1. Check Supabase RLS policies allow updates to `protection_officers.fcm_token`
2. Verify `protection_officers` table has `fcm_token` column
3. Check browser console for Supabase errors
4. Ensure user is logged in before requesting notification permission

### Issue: "Notifications not appearing"

**Symptoms**: Token saved, but notifications don't show

**Solution**:
1. Check browser notification settings (not blocked)
2. Verify service worker is active (DevTools → Application → Service Workers)
3. Test with Firebase Console "Send test message" feature
4. Check FCM token is still valid (tokens expire/refresh periodically)

---

## VAPID Key Security

### ✅ Safe to Expose (Public Key)

The VAPID key you use in `REACT_APP_FIREBASE_VAPID_KEY` is the **public key**. It's safe to:
- Include in client-side code
- Commit to version control (via `.env.example`)
- Expose in browser DevTools

**Why?** The public key can only be used to subscribe to notifications, not send them.

### 🔒 Keep Secret (Private Key)

The **private key** (server-side) is automatically managed by Firebase and should never be exposed. It's used by Firebase Admin SDK to send notifications.

---

## What Happens After Setup?

Once VAPID key is configured:

1. ✅ Users can grant notification permission
2. ✅ FCM tokens are generated and saved to Supabase
3. ✅ Your backend can send push notifications to CPOs
4. ✅ Notifications appear even when app is closed (via service worker)

### Notification Flow

```
Backend/Supabase Edge Function
    ↓
Fetches CPO's FCM token from database
    ↓
Sends notification via Firebase Admin SDK
    ↓
Firebase Cloud Messaging (FCM)
    ↓
CPO's browser receives notification
    ↓
Service worker displays notification
```

---

## Advanced Configuration

### Customize Notification Behavior

In `public/firebase-messaging-sw.js`:

```javascript
// Customize notification click action
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Open specific URL when notification is clicked
  event.waitUntil(
    clients.openWindow('/jobs/available')
  );
});
```

### Handle Foreground Notifications

In `src/services/notificationService.ts`:

```typescript
onMessage(messaging, (payload) => {
  console.log('[Notifications] Message received (foreground):', payload);

  // Show custom in-app notification
  showInAppNotification(payload.notification);
});
```

---

## Monitoring VAPID Usage

### Check Firebase Quota

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select **armora-protection** project
3. Go to **Usage** tab
4. Check **Cloud Messaging** quota

**Free Tier Limits:**
- Unlimited messages to valid tokens
- No cost for push notifications (FCM is free!)

### Monitor FCM Token Validity

Invalid tokens (user uninstalled app, cleared cache, etc.) should be removed from database:

```typescript
// In notificationService.ts
if (error.code === 'messaging/invalid-registration-token') {
  await supabase
    .from('protection_officers')
    .update({ fcm_token: null })
    .eq('user_id', userId);
}
```

---

## Related Documentation

- [Firebase Cloud Messaging Setup](/workspaces/armoracpo/FCM_SETUP_GUIDE.md)
- [Vercel Environment Variables](/workspaces/armoracpo/VERCEL_ENV_VARS.md)
- [Push Notification Implementation Report](/workspaces/armoracpo/FCM_IMPLEMENTATION_REPORT.md)

---

## Quick Reference

| Item | Value |
|------|-------|
| **Environment Variable Name** | `REACT_APP_FIREBASE_VAPID_KEY` |
| **Where to Get Key** | Firebase Console → Project Settings → Cloud Messaging → Web Push certificates |
| **Key Format** | Starts with `B...` (Base64 encoded, ~87 characters) |
| **Security** | Public key - safe to expose |
| **Required For** | Web push notifications |

---

## Support

- **Firebase Documentation**: https://firebase.google.com/docs/cloud-messaging/js/client
- **VAPID Spec**: https://tools.ietf.org/html/rfc8292
- **Firebase Console**: https://console.firebase.google.com/project/armora-protection

---

**Status**: ✅ VAPID key configuration required for push notifications
**Last Updated**: 2025-10-08
**Version**: 1.0
