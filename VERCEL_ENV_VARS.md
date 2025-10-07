# Vercel Environment Variables - Quick Setup

## Critical Environment Variables for ArmoraCPO

Copy and paste these into your Vercel Dashboard → Settings → Environment Variables

---

## 1. Supabase Configuration

```bash
# Get from: https://app.supabase.com/project/jmzvrqwjmlnvxojculee/settings/api

REACT_APP_SUPABASE_URL=https://jmzvrqwjmlnvxojculee.supabase.co

REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE
```

**Where to find**:
1. Go to https://app.supabase.com
2. Select your project
3. Settings → API
4. Copy "Project URL" and "anon public" key

---

## 2. Firebase Configuration

```bash
# These are already in the code but can be set as env vars for easier updates

REACT_APP_FIREBASE_API_KEY=AIzaSyDBpJL8uN2s6HN4qcWnR0vCwZVU5w3g5YE

REACT_APP_FIREBASE_AUTH_DOMAIN=armora-protection.firebaseapp.com

REACT_APP_FIREBASE_PROJECT_ID=armora-protection

REACT_APP_FIREBASE_STORAGE_BUCKET=armora-protection.firebasestorage.app

REACT_APP_FIREBASE_MESSAGING_SENDER_ID=785567849849

REACT_APP_FIREBASE_APP_ID=1:785567849849:web:1e8a4e3f2e0b9c8d4f5e6a
```

---

## 3. Firebase VAPID Key (CRITICAL - REQUIRED FOR NOTIFICATIONS)

```bash
REACT_APP_FIREBASE_VAPID_KEY=YOUR_VAPID_KEY_HERE
```

**Where to find**:
1. Go to https://console.firebase.google.com/project/armora-protection/settings/cloudmessaging
2. Scroll to "Web Push certificates"
3. If no key exists, click "Generate key pair"
4. Copy the key (starts with "B...")

---

## Vercel Setup Steps

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your ArmoraCPO project
3. Click "Settings" tab
4. Click "Environment Variables" in left sidebar
5. For each variable:
   - Click "Add New"
   - Name: (e.g., `REACT_APP_SUPABASE_URL`)
   - Value: (paste the value)
   - Environments: Check all (Production, Preview, Development)
   - Click "Save"

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Set environment variables
vercel env add REACT_APP_SUPABASE_URL
# Paste value when prompted

vercel env add REACT_APP_SUPABASE_ANON_KEY
# Paste value when prompted

vercel env add REACT_APP_FIREBASE_VAPID_KEY
# Paste value when prompted
```

---

## Verification

After setting environment variables, redeploy your app:

```bash
# Trigger a new deployment
vercel --prod

# Or push to main branch (if auto-deploy is enabled)
git push origin main
```

Then check:
1. Open your deployed app
2. Open browser DevTools → Console
3. Login to the app
4. Look for: `[Notifications] FCM token obtained: ...`
5. If you see this, FCM is working!

---

## Required vs Optional

### REQUIRED (App won't work without these)
- `REACT_APP_SUPABASE_URL` ✅
- `REACT_APP_SUPABASE_ANON_KEY` ✅

### REQUIRED for Push Notifications
- `REACT_APP_FIREBASE_VAPID_KEY` ✅

### OPTIONAL (Already hardcoded in app)
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`

---

## Security Note

All these environment variables are **client-side** variables (notice the `REACT_APP_` prefix). They will be visible in the browser. This is **normal and safe** because:

1. ✅ Supabase anon key is protected by Row Level Security (RLS)
2. ✅ Firebase credentials are protected by Firebase Security Rules
3. ✅ Both services have domain restrictions configured
4. ✅ These are meant for client-side use

**Never expose**:
- Supabase service role key
- Firebase Admin SDK private key
- Any server-side secrets

---

## Troubleshooting

### Environment variables not working?
1. Make sure variable names are **exact** (case-sensitive)
2. Trigger a new deployment after setting variables
3. Check build logs for errors
4. Verify variables are set for the correct environment (Production/Preview/Development)

### How to check if variables are set?
```javascript
// In browser console
console.log(process.env.REACT_APP_SUPABASE_URL);
console.log(process.env.REACT_APP_FIREBASE_VAPID_KEY);
```

If they show `undefined`, redeploy the app.

---

## Quick Copy-Paste Template

```bash
# Vercel Environment Variables for ArmoraCPO

# === SUPABASE (GET FROM DASHBOARD) ===
REACT_APP_SUPABASE_URL=https://jmzvrqwjmlnvxojculee.supabase.co
REACT_APP_SUPABASE_ANON_KEY=

# === FIREBASE (GET VAPID KEY FROM FIREBASE CONSOLE) ===
REACT_APP_FIREBASE_VAPID_KEY=

# === OPTIONAL (ALREADY IN CODE) ===
REACT_APP_FIREBASE_API_KEY=AIzaSyDBpJL8uN2s6HN4qcWnR0vCwZVU5w3g5YE
REACT_APP_FIREBASE_AUTH_DOMAIN=armora-protection.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=armora-protection
REACT_APP_FIREBASE_STORAGE_BUCKET=armora-protection.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=785567849849
REACT_APP_FIREBASE_APP_ID=1:785567849849:web:1e8a4e3f2e0b9c8d4f5e6a
```

---

**Next Step**: Get your Supabase anon key and Firebase VAPID key, set them in Vercel, and deploy! 🚀
