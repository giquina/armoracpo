# Vercel Environment Variables Setup Guide - ArmoraCPO

## Overview

This guide provides step-by-step instructions for configuring all required environment variables in Vercel for the ArmoraCPO application.

---

## Why Environment Variables?

Environment variables allow you to:
- Store sensitive configuration (API keys, database URLs) securely
- Use different values for development, preview, and production environments
- Update configuration without changing code
- Keep secrets out of version control

---

## Required Environment Variables

### 1. Supabase Configuration (REQUIRED)

These are **absolutely required** for the app to function:

| Variable Name | Description | Where to Find |
|---------------|-------------|---------------|
| `REACT_APP_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Supabase Dashboard → Settings → API |

**How to Get These Values:**

1. Go to https://app.supabase.com
2. Select your project: **jmzvrqwjmlnvxojculee** (or your project)
3. Click **Settings** (gear icon) → **API**
4. Copy:
   - **Project URL** → Use for `REACT_APP_SUPABASE_URL`
   - **Project API keys** → **anon/public** → Use for `REACT_APP_SUPABASE_ANON_KEY`

**Example Values:**
```bash
REACT_APP_SUPABASE_URL=https://jmzvrqwjmlnvxojculee.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 2. Firebase Cloud Messaging (REQUIRED for Push Notifications)

| Variable Name | Description | Where to Find |
|---------------|-------------|---------------|
| `REACT_APP_FIREBASE_VAPID_KEY` | Web Push certificate for FCM | Firebase Console → Cloud Messaging → Web Push certificates |

**How to Get This Value:**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **armora-protection**
3. Click **gear icon** ⚙️ → **Project Settings**
4. Go to **Cloud Messaging** tab
5. Scroll to **Web Push certificates**
6. If no key exists, click **Generate key pair**
7. Copy the key (starts with `B...`)

**Example Value:**
```bash
REACT_APP_FIREBASE_VAPID_KEY=BCnJx1g7bP9vW5nJw-example-key-YourActualKeyWillBeMuchLonger
```

> **Note**: Without this key, push notifications will NOT work.

See [FIREBASE_VAPID_SETUP.md](./FIREBASE_VAPID_SETUP.md) for detailed instructions.

---

### 3. Firebase Configuration (OPTIONAL - Already in Code)

These are already hardcoded in `src/lib/firebase.ts`, but you can override them via environment variables:

| Variable Name | Current Value | Description |
|---------------|---------------|-------------|
| `REACT_APP_FIREBASE_API_KEY` | `AIzaSyDBpJL8uN2s6HN4qcWnR0vCwZVU5w3g5YE` | Firebase API key |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | `armora-protection.firebaseapp.com` | Firebase auth domain |
| `REACT_APP_FIREBASE_PROJECT_ID` | `armora-protection` | Firebase project ID |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | `armora-protection.firebasestorage.app` | Firebase storage bucket |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | `785567849849` | Firebase messaging sender ID |
| `REACT_APP_FIREBASE_APP_ID` | `1:785567849849:web:1e8a4e3f2e0b9c8d4f5e6a` | Firebase app ID |

**You do NOT need to set these unless you want to override the defaults.**

---

### 4. Sentry Error Monitoring (OPTIONAL but Recommended)

| Variable Name | Description | Where to Find |
|---------------|-------------|---------------|
| `REACT_APP_SENTRY_DSN` | Sentry Data Source Name | Sentry Dashboard → Project Settings |
| `REACT_APP_SENTRY_ENVIRONMENT` | Environment name (production/preview/development) | Set manually |

**How to Get These Values:**

See [SENTRY_SETUP.md](./SENTRY_SETUP.md) for detailed Sentry configuration.

---

## How to Set Environment Variables in Vercel

### Method 1: Via Vercel Dashboard (Recommended)

#### Step 1: Access Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Log in with your account
3. Select your **ArmoraCPO** project

#### Step 2: Navigate to Environment Variables

1. Click the **Settings** tab (top navigation)
2. Click **Environment Variables** in the left sidebar

#### Step 3: Add Each Variable

For each environment variable:

1. Click **Add New** button
2. Fill in the form:
   - **Name**: e.g., `REACT_APP_SUPABASE_URL`
   - **Value**: Paste the actual value
   - **Environments**: Check all boxes (Production, Preview, Development)
     - ✅ **Production** - for `vercel.app` domain
     - ✅ **Preview** - for PR preview deployments
     - ✅ **Development** - for local dev via `vercel dev`
3. Click **Save**

#### Step 4: Repeat for All Variables

Add all required variables:

| Priority | Variable Name | Required? |
|----------|---------------|-----------|
| 🔴 Critical | `REACT_APP_SUPABASE_URL` | YES |
| 🔴 Critical | `REACT_APP_SUPABASE_ANON_KEY` | YES |
| 🟡 Important | `REACT_APP_FIREBASE_VAPID_KEY` | For push notifications |
| 🟢 Optional | `REACT_APP_SENTRY_DSN` | For error monitoring |
| 🟢 Optional | `REACT_APP_SENTRY_ENVIRONMENT` | For error monitoring |

#### Step 5: Trigger a New Deployment

Environment variables are applied at **build time**, so you need to redeploy:

**Option A: Via Vercel Dashboard**
1. Go to **Deployments** tab
2. Click **...** (three dots) on the latest deployment
3. Click **Redeploy**
4. Confirm

**Option B: Via Git Push**
```bash
# Make a small change or trigger empty commit
git commit --allow-empty -m "redeploy: apply env vars"
git push origin main
```

**Option C: Via Vercel CLI**
```bash
vercel --prod
```

---

### Method 2: Via Vercel CLI (For Developers)

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

#### Step 3: Link Your Project

```bash
cd /workspaces/armoracpo
vercel link
```

Select your existing project or create a new one.

#### Step 4: Add Environment Variables

```bash
# Add Supabase URL
vercel env add REACT_APP_SUPABASE_URL
# When prompted:
# - Value: Paste your Supabase URL
# - Environments: Select Production, Preview, Development

# Add Supabase Anon Key
vercel env add REACT_APP_SUPABASE_ANON_KEY
# Paste your anon key when prompted

# Add Firebase VAPID Key
vercel env add REACT_APP_FIREBASE_VAPID_KEY
# Paste your VAPID key when prompted
```

#### Step 5: Pull Environment Variables (For Local Dev)

```bash
vercel env pull .env
```

This creates a `.env` file with all variables from Vercel.

⚠️ **DO NOT commit `.env` to Git!**

---

### Method 3: Via `.env` File (Local Development Only)

For local development, create a `.env` file in the project root:

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://jmzvrqwjmlnvxojculee.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here

# Firebase VAPID Key
REACT_APP_FIREBASE_VAPID_KEY=your_vapid_key_here

# Sentry (Optional)
REACT_APP_SENTRY_DSN=https://your_sentry_dsn_here
REACT_APP_SENTRY_ENVIRONMENT=development
```

⚠️ **NEVER commit `.env` to version control!** It's already in `.gitignore`.

---

## Environment-Specific Variables

### Production Environment

For production deployments (your main `vercel.app` domain):

```bash
REACT_APP_SENTRY_ENVIRONMENT=production
```

### Preview Environment

For pull request preview deployments:

```bash
REACT_APP_SENTRY_ENVIRONMENT=preview
```

### Development Environment

For local development or `vercel dev`:

```bash
REACT_APP_SENTRY_ENVIRONMENT=development
```

---

## Verify Environment Variables

### Check in Vercel Dashboard

1. Go to **Settings** → **Environment Variables**
2. You should see all variables listed
3. Click the eye icon to reveal values (for verification)

### Check in Deployed App

After deployment, open your app and check browser console:

```javascript
// In browser DevTools console
console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('Firebase VAPID:', process.env.REACT_APP_FIREBASE_VAPID_KEY);
console.log('Sentry DSN:', process.env.REACT_APP_SENTRY_DSN);
```

**If they show `undefined`:**
- Variables weren't set correctly
- Deployment happened before variables were added
- Variable names are incorrect (check spelling/case)

**Solution**: Redeploy the app after setting variables.

---

## Security Best Practices

### ✅ Safe to Expose (Client-Side Variables)

These are prefixed with `REACT_APP_` and are **safe to expose** in the browser:

- `REACT_APP_SUPABASE_URL` ✅
- `REACT_APP_SUPABASE_ANON_KEY` ✅
- `REACT_APP_FIREBASE_*` ✅
- `REACT_APP_SENTRY_DSN` ✅

**Why?** They're protected by:
- Supabase Row Level Security (RLS)
- Firebase Security Rules
- Domain restrictions in Firebase/Supabase consoles

### 🔒 NEVER Expose (Server-Side Secrets)

**DO NOT add these to Vercel environment variables** (or keep them secret):

- `SUPABASE_SERVICE_ROLE_KEY` 🔒 (full database access)
- `FIREBASE_PRIVATE_KEY` 🔒 (Firebase Admin SDK)
- `STRIPE_SECRET_KEY` 🔒 (payment processing)
- Any API keys for server-side services

### Variable Naming Convention

- **Client-side** (exposed in browser): `REACT_APP_*`
- **Server-side** (kept secret): No `REACT_APP_` prefix

> **Note**: Create React App only includes variables with `REACT_APP_` prefix in the build.

---

## Troubleshooting

### Issue: Environment variables are `undefined` in the app

**Symptoms**: Console shows `undefined` when logging environment variables

**Solution**:
1. Check variable names are **exact** (case-sensitive)
2. All client-side variables MUST start with `REACT_APP_`
3. Trigger a new deployment (env vars are applied at build time)
4. Clear browser cache and hard reload

### Issue: App works locally but not on Vercel

**Symptoms**: App works with local `.env` but fails in production

**Solution**:
1. Verify all variables in `.env` are also set in Vercel Dashboard
2. Check Vercel build logs for errors
3. Ensure variables are set for **Production** environment
4. Redeploy after setting variables

### Issue: Different values for different environments

**Symptoms**: Need different Supabase URLs for dev vs. production

**Solution**:
1. In Vercel Dashboard, add variable separately for each environment
2. Click **Add New** for same variable name
3. Set different values for Production, Preview, Development
4. Select specific environment when adding

**Example**:
```
REACT_APP_SUPABASE_URL (Production) = https://prod.supabase.co
REACT_APP_SUPABASE_URL (Preview) = https://staging.supabase.co
REACT_APP_SUPABASE_URL (Development) = https://dev.supabase.co
```

### Issue: Build fails with "Missing environment variables"

**Symptoms**: Vercel build fails with error about missing variables

**Solution**:
1. Check Vercel build logs for specific variable names
2. Add the missing variables in Vercel Dashboard
3. Redeploy

### Issue: Can't find Vercel project in CLI

**Symptoms**: `vercel link` doesn't show your project

**Solution**:
```bash
# Verify you're logged in
vercel whoami

# Re-login if needed
vercel logout
vercel login

# Link again
vercel link
```

---

## Complete Setup Checklist

Use this checklist to ensure all environment variables are configured:

### Required Variables ✅

- [ ] `REACT_APP_SUPABASE_URL` - Set in Vercel
- [ ] `REACT_APP_SUPABASE_ANON_KEY` - Set in Vercel
- [ ] `REACT_APP_FIREBASE_VAPID_KEY` - Set in Vercel (for push notifications)

### Optional Variables (Recommended)

- [ ] `REACT_APP_SENTRY_DSN` - For error monitoring
- [ ] `REACT_APP_SENTRY_ENVIRONMENT` - Set to `production`, `preview`, or `development`

### Verification Steps

- [ ] Variables visible in Vercel Dashboard → Settings → Environment Variables
- [ ] Triggered new deployment after adding variables
- [ ] Checked browser console - variables are defined (not `undefined`)
- [ ] App successfully connects to Supabase
- [ ] Push notifications work (if VAPID key set)
- [ ] Sentry captures errors (if Sentry configured)

---

## Quick Copy-Paste Template

Use this template to quickly set all required variables:

```bash
# === REQUIRED: Supabase Configuration ===
REACT_APP_SUPABASE_URL=https://jmzvrqwjmlnvxojculee.supabase.co
REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE

# === REQUIRED: Firebase VAPID Key (for push notifications) ===
REACT_APP_FIREBASE_VAPID_KEY=YOUR_FIREBASE_VAPID_KEY_HERE

# === OPTIONAL: Firebase Configuration (already in code) ===
REACT_APP_FIREBASE_API_KEY=AIzaSyDBpJL8uN2s6HN4qcWnR0vCwZVU5w3g5YE
REACT_APP_FIREBASE_AUTH_DOMAIN=armora-protection.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=armora-protection
REACT_APP_FIREBASE_STORAGE_BUCKET=armora-protection.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=785567849849
REACT_APP_FIREBASE_APP_ID=1:785567849849:web:1e8a4e3f2e0b9c8d4f5e6a

# === OPTIONAL: Sentry Error Monitoring ===
REACT_APP_SENTRY_DSN=YOUR_SENTRY_DSN_HERE
REACT_APP_SENTRY_ENVIRONMENT=production
```

---

## Related Documentation

- [Supabase Setup Guide](/workspaces/armoracpo/SUPABASE_SETUP.md)
- [Firebase VAPID Setup Guide](./FIREBASE_VAPID_SETUP.md)
- [Sentry Setup Guide](./SENTRY_SETUP.md)
- [FCM Implementation Report](/workspaces/armoracpo/FCM_IMPLEMENTATION_REPORT.md)
- [Environment Setup](/workspaces/armoracpo/ENVIRONMENT_SETUP.md)

---

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs/concepts/projects/environment-variables
- **Vercel CLI Reference**: https://vercel.com/docs/cli/env
- **Create React App Env Vars**: https://create-react-app.dev/docs/adding-custom-environment-variables/

---

**Status**: ✅ Guide complete - ready for setup
**Last Updated**: 2025-10-08
**Version**: 1.0
