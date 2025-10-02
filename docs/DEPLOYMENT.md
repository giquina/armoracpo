# Armora CPO - Comprehensive Deployment Guide

Complete deployment documentation for the Armora CPO (Close Protection Officer) Progressive Web App.

**Platform:** Vercel + Google Play (TWA)
**Target:** Production-ready PWA + Native Android App
**Last Updated:** 2025-10-02

---

## Table of Contents

1. [Vercel Deployment](#1-vercel-deployment)
2. [Google Play TWA Deployment](#2-google-play-twa-deployment)
3. [Push Notifications Setup](#3-push-notifications-setup)
4. [Pre-Deployment Checklist](#4-pre-deployment-checklist)
5. [Post-Deployment Verification](#5-post-deployment-verification)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Vercel Deployment

### 1.1 Environment Variables Required

All environment variables must be configured in the Vercel dashboard before deployment.

#### Required Variables

```bash
# Supabase Configuration (Shared with client app)
REACT_APP_SUPABASE_URL=https://jmzvrqwjmlnvxojculee.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<your_supabase_anon_key>

# Firebase Configuration (Shared with client app - armora-protection)
REACT_APP_FIREBASE_API_KEY=<your_firebase_api_key>
REACT_APP_FIREBASE_AUTH_DOMAIN=armora-protection.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=armora-protection
REACT_APP_FIREBASE_STORAGE_BUCKET=armora-protection.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=785567849849
REACT_APP_FIREBASE_APP_ID=<your_firebase_app_id>

# Firebase Cloud Messaging (Push Notifications)
REACT_APP_FIREBASE_VAPID_KEY=BJjy-XYsrQgp-SEMNcwRh_4zTzRryjE-mlb10LsQnlL_oS-BYpGO9-B_x_gbsyHPJmMusybANJu2K5VvRw7mBvI
```

#### Setting Variables in Vercel

**Via Vercel Dashboard:**
1. Navigate to: https://vercel.com/dashboard
2. Select your project: `armoracpo`
3. Go to: Settings → Environment Variables
4. Add each variable:
   - **Key:** Variable name (e.g., `REACT_APP_SUPABASE_URL`)
   - **Value:** Variable value
   - **Environment:** Select all (Production, Preview, Development)
5. Click "Save"
6. Redeploy for changes to take effect

**Via Vercel CLI:**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project (if not already linked)
vercel link

# Add environment variables
vercel env add REACT_APP_SUPABASE_URL production
vercel env add REACT_APP_SUPABASE_ANON_KEY production
vercel env add REACT_APP_FIREBASE_API_KEY production
vercel env add REACT_APP_FIREBASE_AUTH_DOMAIN production
vercel env add REACT_APP_FIREBASE_PROJECT_ID production
vercel env add REACT_APP_FIREBASE_STORAGE_BUCKET production
vercel env add REACT_APP_FIREBASE_MESSAGING_SENDER_ID production
vercel env add REACT_APP_FIREBASE_APP_ID production
vercel env add REACT_APP_FIREBASE_VAPID_KEY production

# Pull environment variables locally for testing
vercel env pull .env.local
```

---

### 1.2 Build Configuration

The project is configured for automatic deployment via `vercel.json`.

#### Current vercel.json Configuration

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "devCommand": "npm start",
  "installCommand": "npm install",
  "framework": "create-react-app",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

#### Build Specifications

| Setting | Value |
|---------|-------|
| **Build Command** | `npm run build` |
| **Output Directory** | `build` |
| **Install Command** | `npm install` |
| **Framework** | Create React App (auto-detected) |
| **Node Version** | Latest LTS (auto-detected) |
| **Package Manager** | npm |

---

### 1.3 Deployment Methods

#### Method 1: Git Push (Recommended)

Vercel automatically deploys when you push to the `main` branch.

```bash
# Make your changes
git add .
git commit -m "feat: your feature description"
git push origin main

# Vercel will automatically:
# 1. Detect the push
# 2. Install dependencies
# 3. Run build
# 4. Deploy to production
# 5. Update DNS
```

**Deployment URL:** https://armoracpo-c4ssbwaoc-giquinas-projects.vercel.app

#### Method 2: Vercel CLI

```bash
# Install CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview (staging)
vercel

# Deploy to production
vercel --prod

# Deploy with custom environment
vercel --prod --token YOUR_VERCEL_TOKEN
```

#### Method 3: Manual Trigger via Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select project: `armoracpo`
3. Go to "Deployments" tab
4. Click "Redeploy" on latest deployment
5. Select "Use existing Build Cache" or "Rebuild"
6. Click "Redeploy"

---

### 1.4 Domain Setup

#### Current Production URL
- **Primary:** https://armoracpo-c4ssbwaoc-giquinas-projects.vercel.app
- **Status:** Active and deployed

#### Adding a Custom Domain (Optional)

**Recommended:** `cpo.armora.app` or `armoracpo.com`

**Step 1: Add Domain in Vercel**
```bash
# Via CLI
vercel domains add cpo.armora.app

# Or via Dashboard:
# Settings → Domains → Add Domain
```

**Step 2: Configure DNS Records**

Add these records in your domain registrar (e.g., Cloudflare, Namecheap):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | cpo.armora.app | 76.76.21.21 | Auto |
| AAAA | cpo.armora.app | 2606:4700:10::6816:1515 | Auto |

Or use CNAME:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | cpo.armora.app | cname.vercel-dns.com | Auto |

**Step 3: SSL Certificate**

Vercel automatically provisions SSL certificates via Let's Encrypt. No action required.

**Step 4: Verification**

Wait 24-48 hours for DNS propagation, then verify:
```bash
# Check DNS
nslookup cpo.armora.app

# Check SSL
curl -I https://cpo.armora.app
```

---

### 1.5 PWA Verification

After deployment, verify PWA functionality:

#### Chrome DevTools Audit

```bash
# 1. Open deployed site in Chrome
# 2. Open DevTools (F12)
# 3. Navigate to "Lighthouse" tab
# 4. Select categories:
#    - Performance
#    - Progressive Web App
#    - Best Practices
#    - Accessibility
#    - SEO
# 5. Click "Generate report"
```

**Target Scores:**
- Performance: >90
- PWA: 100 (installable)
- Best Practices: >95
- Accessibility: >95
- SEO: >90

#### Manual PWA Checks

**Service Worker:**
```bash
# DevTools → Application → Service Workers
# Verify:
# - Status: Activated and running
# - Update on reload: Enabled
# - Offline: Working
```

**Manifest:**
```bash
# DevTools → Application → Manifest
# Verify:
# - Name: "Armora Protection"
# - Short name: "Armora"
# - Display: standalone
# - Icons: 192x192, 512x512 present
# - Theme color: #1a1a1a
# - Start URL: /
```

**Cache Storage:**
```bash
# DevTools → Application → Cache Storage
# Verify caches exist:
# - armora-static-v1
# - armora-dynamic-v1
```

**Installation Test:**
```bash
# Desktop (Chrome):
# - Look for install icon in address bar
# - Click to install
# - Verify app opens in standalone window

# Mobile (Chrome Android):
# - Tap menu → "Add to Home screen"
# - Verify icon appears on home screen
# - Tap to open
# - Verify standalone mode (no browser UI)
```

---

## 2. Google Play TWA Deployment

Trusted Web Activity (TWA) allows packaging the PWA as a native Android app for Google Play Store.

### 2.1 Prerequisites

```bash
# Install Node.js (LTS version)
node --version  # Should be v18+ or v20+

# Install Bubblewrap CLI
npm install -g @bubblewrap/cli

# Install Java Development Kit (JDK 11+)
java -version  # Should be 11.x or higher

# Install Android SDK via Android Studio
# Or download command-line tools from:
# https://developer.android.com/studio#command-tools
```

---

### 2.2 Keystore Management

#### Create Android Keystore

**CRITICAL:** Store this keystore securely. You'll need it for all future app updates.

```bash
# Create keystore directory
mkdir -p ~/android-keystores

# Generate keystore
keytool -genkey -v \
  -keystore ~/android-keystores/armora-cpo.keystore \
  -alias armora-cpo \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# You'll be prompted for:
# - Keystore password (SAVE THIS - you'll need it)
# - Key password (SAVE THIS)
# - Name: Armora CPO
# - Organization: Armora Protection
# - Organization Unit: Engineering
# - City/Locality: London
# - State/Province: England
# - Country Code: GB
```

**Important Notes:**
- **Store keystore file securely** (use password manager or secure vault)
- **Backup keystore** to multiple secure locations
- **Never commit keystore to git**
- **Never share keystore password**
- **Losing keystore means you can't update the app** (must publish as new app)

#### Keystore File Locations

```bash
# Recommended secure storage:
# 1. Password manager (1Password, LastPass)
# 2. Encrypted cloud storage (encrypted Dropbox, Google Drive)
# 3. Hardware security key
# 4. Offline encrypted USB drive

# DO NOT store in:
# - Git repository
# - Unencrypted cloud storage
# - Shared network drives
# - Public servers
```

---

### 2.3 SHA256 Fingerprint Setup

#### Extract SHA256 Fingerprint

```bash
# Extract from keystore
keytool -list -v \
  -keystore ~/android-keystores/armora-cpo.keystore \
  -alias armora-cpo

# Look for "SHA256:" in output
# Example:
# SHA256: AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90

# Copy the SHA256 fingerprint (without spaces or colons)
# Example: ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890
```

#### Update assetlinks.json

Edit `/workspaces/armoracpo/public/.well-known/assetlinks.json`:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.armora.protection",
      "sha256_cert_fingerprints": [
        "YOUR_SHA256_FINGERPRINT_HERE"
      ]
    }
  }
]
```

**Replace:**
- `YOUR_SHA256_FINGERPRINT_HERE` with your actual SHA256 fingerprint (format: `AB:CD:EF:...`)

**Commit and Deploy:**
```bash
git add public/.well-known/assetlinks.json
git commit -m "chore: Update Android assetlinks with production SHA256 fingerprint"
git push origin main

# Wait for Vercel deployment to complete
```

**Verify assetlinks.json is accessible:**
```bash
curl https://armoracpo-c4ssbwaoc-giquinas-projects.vercel.app/.well-known/assetlinks.json

# Should return JSON with your SHA256 fingerprint
```

---

### 2.4 Building APK/AAB with Bubblewrap

#### Initialize TWA Project

```bash
# Create TWA directory
mkdir -p ~/armora-twa
cd ~/armora-twa

# Initialize Bubblewrap project
bubblewrap init --manifest=https://armoracpo-c4ssbwaoc-giquinas-projects.vercel.app/manifest.json

# Bubblewrap will ask:
# Domain being opened in the TWA: armoracpo-c4ssbwaoc-giquinas-projects.vercel.app
# Name of the application: Armora Protection
# Short name for the application: Armora
# Package name: com.armora.protection
# Application version: 1 (1.0.0)
# Application version code: 1
# Display mode: standalone
# Status bar color: #1a1a1a
# Signing key information:
#   - Path to signing key: ~/android-keystores/armora-cpo.keystore
#   - Key alias: armora-cpo
```

#### Update twa-manifest.json

Bubblewrap creates `twa-manifest.json`. Review and update:

```json
{
  "packageId": "com.armora.protection",
  "host": "armoracpo-c4ssbwaoc-giquinas-projects.vercel.app",
  "name": "Armora Protection",
  "launcherName": "Armora",
  "display": "standalone",
  "themeColor": "#1a1a1a",
  "navigationColor": "#1a1a1a",
  "backgroundColor": "#ffffff",
  "startUrl": "/",
  "iconUrl": "https://armoracpo-c4ssbwaoc-giquinas-projects.vercel.app/logo512.png",
  "maskableIconUrl": "https://armoracpo-c4ssbwaoc-giquinas-projects.vercel.app/logo512.png",
  "splashScreenFadeOutDuration": 300,
  "signingKey": {
    "path": "~/android-keystores/armora-cpo.keystore",
    "alias": "armora-cpo"
  },
  "appVersionName": "1.0.0",
  "appVersionCode": 1,
  "shortcuts": [],
  "generatorApp": "bubblewrap-cli",
  "webManifestUrl": "https://armoracpo-c4ssbwaoc-giquinas-projects.vercel.app/manifest.json",
  "fallbackType": "customtabs",
  "enableNotifications": true,
  "enableSiteSettingsShortcut": true,
  "isChromeOSOnly": false,
  "orientation": "portrait",
  "fingerprints": []
}
```

#### Build APK (for testing)

```bash
cd ~/armora-twa

# Build APK
bubblewrap build

# Enter keystore password when prompted
# Enter key password when prompted

# Output:
# - app-release-signed.apk (for testing on devices)
# - Location: ~/armora-twa/app-release-signed.apk
```

#### Build AAB (for Google Play)

```bash
cd ~/armora-twa

# Build Android App Bundle
bubblewrap build --output-format=aab

# Enter keystore password when prompted
# Enter key password when prompted

# Output:
# - app-release-bundle.aab (for Google Play upload)
# - Location: ~/armora-twa/app-release-bundle.aab
```

**File Sizes (approximate):**
- APK: ~2-5 MB
- AAB: ~1-3 MB (Google Play optimizes per device)

---

### 2.5 Play Console Upload Process

#### Create Google Play Developer Account

1. Go to: https://play.google.com/console
2. Sign in with Google account
3. Pay one-time registration fee ($25 USD)
4. Complete account setup (tax info, payment profile)

#### Create New App

**Step 1: App Details**
```
1. Go to Google Play Console
2. Click "Create app"
3. Fill in:
   - App name: Armora Protection
   - Default language: English (United Kingdom)
   - App or game: App
   - Free or paid: Free
4. Accept declarations
5. Click "Create app"
```

**Step 2: Store Listing**
```
Required information:
- App name: Armora Protection
- Short description: Professional security operations platform for SIA-licensed Close Protection Officers
- Full description: [See template below]
- App icon: 512x512 PNG (from public/logo512.png)
- Feature graphic: 1024x500 PNG
- Screenshots: At least 2 phone screenshots (1080x1920 or 1080x2340)
- App category: Business
- Content rating: Everyone
- Contact details: Your email
- Privacy policy URL: Required (host on your domain)
```

**Full Description Template:**
```
Armora Protection CPO is the professional operations platform for SIA-licensed Close Protection Officers in the United Kingdom.

KEY FEATURES:
• Real-time assignment notifications and acceptance
• GPS tracking during active protection details
• SIA license compliance monitoring
• Earnings and payment tracking
• Incident reporting with secure documentation
• Availability management
• Professional security operations workflow

FOR VERIFIED CPOs ONLY:
This application requires SIA (Security Industry Authority) licensing and professional verification. Only registered Close Protection Officers can access the platform.

SECURITY & COMPLIANCE:
• SIA license verification required
• Secure data encryption
• GDPR compliant
• Professional indemnity insurance tracking
• DBS check verification

OPERATIONAL FEATURES:
• Assignment acceptance and management
• Real-time GPS tracking
• Turn-by-turn navigation
• Threat level assessments
• Principal protection protocols
• Secure communication channels
• Shift scheduling and availability

PROFESSIONAL TOOLS:
• Earnings dashboard with real-time calculations
• Payment history and invoicing
• Compliance center for SIA renewals
• Incident reporting with chain of custody
• Performance metrics and ratings

Armora Protection CPO connects professional security officers with principals requiring close protection services in the UK. This is NOT a taxi or rideshare application - it is a professional security operations platform for licensed CPOs only.

Required: Valid SIA license, DBS check, professional indemnity insurance
```

**Step 3: Content Rating**
```
1. Click "Start questionnaire"
2. Category: Business
3. Answer all questions honestly
4. Submit for rating
5. Expected rating: Everyone / PEGI 3
```

**Step 4: App Access**
```
- All functionality is available without restrictions: NO
- Requires login: YES
- Provide test credentials:
  Email: test-cpo@armora.app
  Password: [Create test account in Supabase]
  Notes: "Test account is pre-verified CPO. Real accounts require SIA license verification."
```

**Step 5: App Content**
```
Fill in:
- Privacy policy URL: https://armora.app/privacy (you must create this)
- Target age range: 18+
- Data safety: [Fill out data collection questionnaire]
- Government apps: No
- COVID-19 contact tracing: No
```

**Step 6: Upload AAB**
```
1. Go to "Production" → "Create new release"
2. Upload app bundle: app-release-bundle.aab
3. Release name: 1.0.0 (2025.10.02)
4. Release notes:
   """
   Initial release of Armora Protection CPO.

   Features:
   - SIA-verified CPO authentication
   - Real-time assignment management
   - GPS tracking during protection details
   - Earnings and payment tracking
   - Compliance monitoring
   - Incident reporting

   Requires valid SIA license and professional verification.
   """
5. Click "Next"
```

**Step 7: Countries/Regions**
```
Recommended: United Kingdom only (initially)
Later: Expand to EU if needed
```

**Step 8: Review and Rollout**
```
1. Review all sections (green checkmarks required)
2. Click "Start rollout to Production"
3. Confirm rollout
4. Wait for review (typically 1-3 days)
```

---

### 2.6 App Signing Configuration

Google Play uses **App Signing by Google Play** for enhanced security.

#### Option 1: Let Google Generate Key (Recommended)

```
1. In Play Console → App Signing
2. Choose "Let Google create and manage your app signing key"
3. Accept terms
4. Continue
```

**Advantages:**
- Google securely stores signing key
- You can update upload key if compromised
- Automatic key rotation

#### Option 2: Use Your Own Key

```
1. In Play Console → App Signing
2. Choose "Export and upload a key from a Java keystore"
3. Follow instructions to export PEPK
4. Upload encrypted key
```

**Upload Key vs Signing Key:**
- **Upload key:** The key you use to sign AABs for upload (your keystore)
- **Signing key:** The key Google uses to sign APKs for distribution (managed by Google)

#### Download Certificate (for assetlinks.json)

```
1. Go to Play Console → App Signing
2. Under "App signing key certificate", click "Download certificate"
3. Extract SHA256 fingerprint:
   keytool -printcert -file deployment_cert.der
4. Update assetlinks.json with this SHA256 (production fingerprint)
5. Redeploy web app
```

---

## 3. Push Notifications Setup

Push notifications use Firebase Cloud Messaging (FCM) integrated with the service worker.

### 3.1 Firebase Configuration

#### Current Configuration (Shared with Armora Client App)

```javascript
// Already configured in public/service-worker.js
firebase.initializeApp({
  apiKey: "AIzaSyDBpJL8uN2s6HN4qcWnR0vCwZVU5w3g5YE",
  authDomain: "armora-protection.firebaseapp.com",
  projectId: "armora-protection",
  storageBucket: "armora-protection.firebasestorage.app",
  messagingSenderId: "785567849849",
  appId: "1:785567849849:web:1e8a4e3f2e0b9c8d4f5e6a"
});
```

**No changes needed** - Using existing `armora-protection` Firebase project.

---

### 3.2 VAPID Key Setup

#### Current VAPID Key (Already Configured)

```
VAPID Key: BJjy-XYsrQgp-SEMNcwRh_4zTzRryjE-mlb10LsQnlL_oS-BYpGO9-B_x_gbsyHPJmMusybANJu2K5VvRw7mBvI
```

**Location:**
- Environment variable: `REACT_APP_FIREBASE_VAPID_KEY`
- Used in: `src/services/notificationService.ts`

**Verification:**
```bash
# Verify VAPID key is set in Vercel
vercel env ls

# Should show:
# REACT_APP_FIREBASE_VAPID_KEY | Production, Preview, Development
```

#### Generate New VAPID Key (if needed)

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Generate new VAPID key
firebase apps:sdkconfig web

# Copy the VAPID key from output
# Update environment variable in Vercel
# Update src/services/notificationService.ts
```

---

### 3.3 Service Worker Deployment

#### Current Service Worker

**File:** `public/service-worker.js`

**Features:**
- Firebase Cloud Messaging integration
- Background push notification handling
- Notification click handlers
- Offline caching (cache-first for static, network-first for API)
- Cache management (install, activate, fetch events)

**Verification After Deployment:**

```bash
# 1. Open deployed site
# 2. Open DevTools → Application → Service Workers
# 3. Verify:
#    - Status: Activated and running
#    - Source: /service-worker.js
#    - Updated: Recent timestamp

# 4. Check registration in Console:
# Should see:
# [Service Worker] Installing...
# [Service Worker] Caching static assets
# [Service Worker] Activating...
```

#### Service Worker Headers

Configured in `vercel.json`:

```json
{
  "source": "/service-worker.js",
  "headers": [
    {
      "key": "Cache-Control",
      "value": "public, max-age=0, must-revalidate"
    }
  ]
}
```

**Purpose:** Ensures service worker is always fresh (no caching).

---

### 3.4 Testing Push Notifications

#### Browser Testing

**Step 1: Request Permission**
```bash
# 1. Open deployed app
# 2. Login as verified CPO
# 3. Permission prompt should appear automatically
# 4. Click "Allow"
# 5. Check browser console:
#    [Notifications] FCM token obtained: ey...
```

**Step 2: Verify Token Storage**
```sql
-- In Supabase SQL Editor
SELECT * FROM cpo_fcm_tokens
WHERE cpo_id = '<your_user_id>';

-- Should show:
-- cpo_id | fcm_token | created_at | updated_at
```

**Step 3: Send Test Notification via Firebase Console**
```
1. Go to: https://console.firebase.google.com
2. Select project: armora-protection
3. Navigate to: Cloud Messaging → Send your first message
4. Fill in:
   - Notification title: "New Assignment Available"
   - Notification text: "High-priority protection detail in Central London"
5. Send test message to:
   - Target: Single device
   - FCM registration token: [Paste token from console]
6. Click "Test"
7. Verify notification appears (even if app is closed)
```

**Step 4: Test Notification Click**
```bash
# 1. Send test notification (from above)
# 2. Click on notification
# 3. App should open to relevant page
# 4. Check console for:
#    [Notification Click] Opening URL: /assignments/123
```

#### Android TWA Testing

Push notifications in TWA work automatically if FCM is configured.

**Verification:**
```bash
# 1. Install APK on Android device
# 2. Login as verified CPO
# 3. Grant notification permission
# 4. Send test notification via Firebase Console
# 5. Verify notification appears in system tray
# 6. Tap notification
# 7. Verify app opens to correct screen
```

---

### 3.5 Background Notification Handling

#### Service Worker Handlers

**Background Notification (App Closed/Minimized):**
```javascript
// In public/service-worker.js
self.addEventListener('push', (event) => {
  const data = event.data.json();

  const options = {
    body: data.notification.body,
    icon: '/logo192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.data.url,
      assignmentId: data.data.assignmentId
    },
    actions: [
      { action: 'view', title: 'View Assignment' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    requireInteraction: true,
    tag: 'assignment-notification'
  };

  event.waitUntil(
    self.registration.showNotification(data.notification.title, options)
  );
});
```

**Notification Click Handler:**
```javascript
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    const url = event.notification.data.url || '/';
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});
```

#### Foreground Notification (App Open)

**Handled in:** `src/services/notificationService.ts`

```typescript
// Setup foreground message listener
export function setupForegroundNotifications(callback: (payload: any) => void) {
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log('[Notifications] Foreground message:', payload);

    // Show custom in-app notification
    callback(payload);

    // Or show browser notification
    if (Notification.permission === 'granted') {
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/logo192.png'
      });
    }
  });
}
```

---

### 3.6 FCM Token Management

#### Token Lifecycle

**1. Initial Token Generation:**
```typescript
// On login or first app launch
const token = await requestNotificationPermission();
if (token) {
  await storeFCMToken(userId, token);
}
```

**2. Token Refresh:**
```typescript
// Tokens can refresh periodically
onTokenRefresh(async (messaging) => {
  const newToken = await getToken(messaging, { vapidKey: VAPID_KEY });
  await storeFCMToken(userId, newToken);
});
```

**3. Token Deletion:**
```typescript
// On logout
import { deleteToken } from 'firebase/messaging';

export async function deleteFCMToken(): Promise<void> {
  if (!messaging) return;

  try {
    await deleteToken(messaging);
    console.log('[Notifications] Token deleted');
  } catch (error) {
    console.error('[Notifications] Error deleting token:', error);
  }
}
```

#### Database Schema

**Table:** `cpo_fcm_tokens`

```sql
CREATE TABLE cpo_fcm_tokens (
  cpo_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  fcm_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE cpo_fcm_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: CPOs can manage their own tokens
CREATE POLICY "CPOs can manage own FCM tokens"
ON cpo_fcm_tokens FOR ALL
USING (auth.uid() = cpo_id);
```

**Verify Table Exists:**
```sql
SELECT * FROM cpo_fcm_tokens LIMIT 5;
```

If table doesn't exist, create it in Supabase SQL Editor.

---

## 4. Pre-Deployment Checklist

Complete this checklist before deploying to production.

### 4.1 Code Quality

```bash
# TypeScript Compilation (No Errors)
npx tsc --noEmit

# Expected output: No errors (empty output)
# If errors exist, fix them before deploying
```

```bash
# ESLint (Code Quality)
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### 4.2 Tests Passing

```bash
# Run all tests
npm test -- --watchAll=false --coverage

# Expected:
# - All test suites passed
# - Coverage: >80% (ideally)
```

**Key Test Files:**
- `src/screens/Login/Login.test.tsx`
- `src/screens/Dashboard/Dashboard.test.tsx`
- `src/services/authService.test.ts`
- `src/services/assignmentService.test.ts`

### 4.3 Build Verification

```bash
# Clean previous build
rm -rf build

# Create production build
npm run build

# Expected output:
# File sizes after gzip:
#   ~138 kB  build/static/js/main.[hash].js
#   ~2 kB    build/static/css/main.[hash].css
#
# The build folder is ready to be deployed.
```

**Verify Build Contents:**
```bash
ls -lh build/

# Should contain:
# - index.html
# - manifest.json
# - service-worker.js
# - static/ (js, css, media)
# - logo192.png, logo512.png
# - .well-known/ (assetlinks.json, apple-app-site-association)
```

**Test Build Locally:**
```bash
# Serve production build
npx serve -s build -l 3000

# Open browser: http://localhost:3000
# Test:
# - Login flow
# - Dashboard loads
# - Assignments display
# - Navigation works
# - Service worker registers
# - PWA installable
```

### 4.4 Security Headers

Verify security headers configured in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

**Test Headers After Deployment:**
```bash
curl -I https://armoracpo-c4ssbwaoc-giquinas-projects.vercel.app

# Verify headers present:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
```

### 4.5 PWA Manifest Validation

**File:** `public/manifest.json`

**Required Fields:**
```json
{
  "name": "Armora Protection",
  "short_name": "Armora",
  "description": "Professional security operations platform for SIA-licensed Close Protection Officers",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#1a1a1a",
  "gcm_sender_id": "785567849849",
  "icons": [
    {
      "src": "/logo192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/logo512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["business", "productivity", "security"]
}
```

**Validation Tools:**
- Chrome DevTools → Application → Manifest
- https://manifest-validator.appspot.com/
- Lighthouse PWA audit

### 4.6 Environment Variables

**Verify all required variables are set:**

```bash
# Pull environment variables from Vercel
vercel env pull .env.local

# Check .env.local contains:
cat .env.local | grep REACT_APP

# Should show all 8 variables:
# REACT_APP_SUPABASE_URL
# REACT_APP_SUPABASE_ANON_KEY
# REACT_APP_FIREBASE_API_KEY
# REACT_APP_FIREBASE_AUTH_DOMAIN
# REACT_APP_FIREBASE_PROJECT_ID
# REACT_APP_FIREBASE_STORAGE_BUCKET
# REACT_APP_FIREBASE_MESSAGING_SENDER_ID
# REACT_APP_FIREBASE_APP_ID
# REACT_APP_FIREBASE_VAPID_KEY
```

### 4.7 Backend Connectivity

**Test Supabase Connection:**
```bash
# In browser console after deployment:
const { data, error } = await supabase
  .from('protection_officers')
  .select('*')
  .limit(1);

console.log('Supabase test:', data, error);
# Should return data or RLS error (if not authenticated)
# Should NOT return network error
```

**Test Firebase Connection:**
```bash
# In browser console:
console.log('Firebase app:', firebase.apps[0]?.options);
# Should show Firebase config
# Should NOT be undefined
```

### 4.8 Mobile Responsiveness

**Test at minimum width:**
```bash
# Chrome DevTools → Toggle device toolbar (Cmd+Shift+M)
# Device: iPhone SE (375x667) or Custom (320px width)
# Test:
# - All screens render correctly
# - Text is readable
# - Buttons are tappable (minimum 44px)
# - Bottom navigation doesn't overlap content
# - Forms are usable
# - No horizontal scroll
```

### 4.9 SIA Terminology

**Verify correct terminology throughout:**

❌ **WRONG** | ✅ **CORRECT**
---|---
Driver | CPO / Close Protection Officer
Passenger | Principal
Ride | Assignment / Detail / Protection Detail
Online | Operational
Offline | Stand Down
Trip | Assignment
Car | Security Vehicle
Pickup | Extraction Point
Dropoff | Destination / Safe House
Rating | Performance Metrics

**Search for incorrect terms:**
```bash
# Search codebase for forbidden terms
grep -r "driver" src/ --exclude-dir=node_modules
grep -r "passenger" src/ --exclude-dir=node_modules
grep -r "ride" src/ --exclude-dir=node_modules

# Should return no results (or only in comments/docs)
```

### 4.10 Final Checklist

Before deploying:

- [ ] All TypeScript errors resolved (`npx tsc --noEmit`)
- [ ] All tests passing (`npm test`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Build tested locally (`npx serve -s build`)
- [ ] Environment variables configured in Vercel
- [ ] Security headers configured
- [ ] PWA manifest valid
- [ ] Service worker configured
- [ ] SIA terminology verified
- [ ] Mobile responsive (320px minimum)
- [ ] Supabase connection works
- [ ] Firebase connection works
- [ ] assetlinks.json accessible
- [ ] Icons generated (192x192, 512x512)
- [ ] `.env` file NOT committed
- [ ] Git working directory clean
- [ ] No console errors in production build
- [ ] Lighthouse PWA score >90

---

## 5. Post-Deployment Verification

After deployment, complete these verification steps.

### 5.1 Deployment Status

```bash
# Check deployment status via CLI
vercel ls

# Should show:
# Age  Deployment                    Status    Duration
# 1m   armoracpo-[hash]              Ready     45s

# Check latest deployment
vercel inspect

# Verify:
# - State: READY
# - Build Time: ~1-2 minutes
# - Creator: Your account
```

**Via Dashboard:**
1. Go to: https://vercel.com/dashboard
2. Select project: `armoracpo`
3. Check "Deployments" tab
4. Latest deployment should be:
   - Status: Ready ✓
   - Production: Yes
   - Branch: main

### 5.2 Accessibility Tests

```bash
# 1. Open: https://armoracpo-c4ssbwaoc-giquinas-projects.vercel.app
# 2. Chrome DevTools → Lighthouse
# 3. Select "Accessibility"
# 4. Click "Generate report"

# Target: >95 score
# Common issues to fix:
# - Missing alt text on images
# - Low color contrast
# - Missing ARIA labels
# - Non-accessible forms
```

### 5.3 Performance Tests

**Lighthouse Performance Audit:**
```bash
# Chrome DevTools → Lighthouse → Performance
# Target metrics:

# First Contentful Paint (FCP): <1.8s
# Largest Contentful Paint (LCP): <2.5s
# Total Blocking Time (TBT): <200ms
# Cumulative Layout Shift (CLS): <0.1
# Speed Index: <3.4s
```

**Real Device Testing:**
```bash
# Test on:
# - iPhone SE (oldest supported iOS device)
# - Android phone (mid-range, 3G network)
# - Tablet (iPad, Android tablet)

# Verify:
# - Load time <3s on 3G
# - Smooth scrolling
# - Responsive touch targets
# - No layout shifts
# - Readable text size
```

### 5.4 PWA Installation

**Desktop (Chrome):**
```bash
# 1. Visit deployed URL
# 2. Look for install icon in address bar (⊕ icon)
# 3. Click install
# 4. Verify:
#    - App opens in standalone window
#    - No browser UI (address bar, tabs)
#    - Icon in Applications folder (Mac) or Start Menu (Windows)
# 5. Test app works offline:
#    - Open app
#    - Disconnect internet
#    - Navigate to cached pages
#    - Verify content loads from cache
```

**Mobile (Android Chrome):**
```bash
# 1. Visit deployed URL on Android phone
# 2. Tap menu (⋮) → "Add to Home screen"
# 3. Confirm installation
# 4. Verify:
#    - Icon appears on home screen
#    - Tap to open
#    - App opens in fullscreen (no browser UI)
#    - Splash screen displays
#    - Portrait orientation locked
# 5. Test offline:
#    - Enable airplane mode
#    - Open app
#    - Verify cached content loads
```

**Mobile (iOS Safari):**
```bash
# 1. Visit deployed URL on iPhone/iPad
# 2. Tap Share button
# 3. Scroll down → "Add to Home Screen"
# 4. Confirm
# 5. Verify:
#    - Icon appears on home screen
#    - Tap to open
#    - App opens in fullscreen
#    - Splash screen displays (may not work on older iOS)
# 6. Note: iOS has limited PWA support
#    - No background sync
#    - No push notifications (without TWA)
#    - Service worker limitations
```

### 5.5 Push Notification Testing

**Desktop Browser:**
```bash
# 1. Open deployed app in Chrome
# 2. Login as verified CPO
# 3. Allow notification permission when prompted
# 4. Open browser console
# 5. Verify FCM token logged:
#    [Notifications] FCM token obtained: ey...
# 6. Send test notification:
#    - Firebase Console → Cloud Messaging
#    - Send test message to token
# 7. Verify notification appears (even with app closed)
# 8. Click notification
# 9. Verify app opens to correct page
```

**Mobile (Android TWA):**
```bash
# Requires APK/AAB deployment to device
# 1. Install app via APK or Google Play
# 2. Login as verified CPO
# 3. Grant notification permission
# 4. Send test notification via Firebase Console
# 5. Verify notification appears in system tray
# 6. Tap notification
# 7. Verify app opens and navigates correctly
```

### 5.6 Core Functionality Testing

**Authentication Flow:**
```
1. Visit deployed app
2. Should redirect to /login
3. Enter test credentials:
   Email: test-cpo@armora.app
   Password: [Test password]
4. Verify:
   - Login successful
   - Redirects to /dashboard
   - User info displays correctly
   - Bottom navigation appears
5. Test logout:
   - Click profile → Logout
   - Redirects to /login
   - Protected routes redirect back to login
```

**Assignment Workflow:**
```
1. Login as verified CPO
2. Go to /jobs/available
3. Verify:
   - Available assignments load
   - Assignment cards display correctly
   - Details show: location, threat level, rate
4. Accept an assignment
5. Verify:
   - Status changes to "assigned"
   - Redirects to /jobs/active
   - Active assignment displays
6. Complete assignment
7. Verify:
   - Status changes to "completed"
   - Appears in history
   - Earnings updated
```

**Real-time Updates:**
```
1. Open app in two browser windows
2. Login as same CPO in both
3. In Window 1: Accept assignment
4. In Window 2: Verify assignment appears in active jobs
5. In Window 1: Complete assignment
6. In Window 2: Verify assignment moves to history
7. Verify real-time subscriptions working
```

**Offline Functionality:**
```
1. Open app
2. Login
3. Navigate to dashboard, jobs, profile
4. Open DevTools → Network → Offline
5. Verify:
   - Previously visited pages load from cache
   - Static assets (CSS, JS, images) load
   - API calls fail gracefully with error messages
6. Return online
7. Verify:
   - App reconnects
   - Data syncs
   - Real-time updates resume
```

### 5.7 Analytics Verification

```bash
# 1. Go to: https://vercel.com/dashboard → armoracpo → Analytics
# 2. Verify tracking:
#    - Page views incrementing
#    - Unique visitors tracked
#    - Geographic data showing
#    - Device breakdown visible
# 3. Check Web Vitals:
#    - LCP, FID, CLS metrics present
#    - All metrics in "Good" range (green)
```

**Custom Event Tracking (if implemented):**
```typescript
// In code
import { track } from '@vercel/analytics';

track('assignment_accepted', {
  assignmentId: '123',
  threatLevel: 'high'
});

// Verify events in Vercel Analytics dashboard
```

### 5.8 Error Monitoring

**Browser Console:**
```bash
# 1. Open deployed app
# 2. Open browser console (F12)
# 3. Navigate through all pages
# 4. Verify:
#    - No red errors (except expected RLS errors when not authenticated)
#    - No yellow warnings (or only minor ones)
#    - Service worker logs appear:
#      [Service Worker] Installing...
#      [Service Worker] Activated
#    - Firebase/Supabase initialization logs appear
```

**Network Tab:**
```bash
# 1. DevTools → Network
# 2. Navigate through app
# 3. Verify:
#    - All requests succeed (200, 304)
#    - No 404 errors (missing assets)
#    - No 500 errors (server errors)
#    - API requests to Supabase succeed
#    - Firebase requests succeed
#    - Static assets cached (from service worker)
```

**Sentry/Error Tracking (if implemented):**
```bash
# 1. Go to Sentry dashboard (if configured)
# 2. Check for production errors
# 3. Monitor error rate
# 4. Set up alerts for critical errors
```

### 5.9 Security Verification

**HTTPS Enforcement:**
```bash
# Test HTTP → HTTPS redirect
curl -I http://armoracpo-c4ssbwaoc-giquinas-projects.vercel.app

# Should show:
# HTTP/1.1 308 Permanent Redirect
# Location: https://armoracpo-c4ssbwaoc-giquinas-projects.vercel.app
```

**Security Headers:**
```bash
curl -I https://armoracpo-c4ssbwaoc-giquinas-projects.vercel.app

# Verify headers:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Strict-Transport-Security: max-age=... (if configured)
```

**SSL Certificate:**
```bash
# Check SSL certificate validity
openssl s_client -connect armoracpo-c4ssbwaoc-giquinas-projects.vercel.app:443 -servername armoracpo-c4ssbwaoc-giquinas-projects.vercel.app

# Verify:
# - Issuer: Let's Encrypt (or Vercel)
# - Valid from/to dates
# - No certificate errors
```

**Security Scan:**
```bash
# Use online tools:
# - https://securityheaders.com/
# - https://observatory.mozilla.org/
# - https://www.ssllabs.com/ssltest/

# Target:
# - Security Headers: A or A+
# - SSL Labs: A or A+
```

### 5.10 Cross-Browser Testing

Test on multiple browsers to ensure compatibility:

**Desktop:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, macOS only)
- [ ] Edge (latest)

**Mobile:**
- [ ] Chrome (Android)
- [ ] Safari (iOS)
- [ ] Firefox (Android)
- [ ] Samsung Internet (Android)

**Key Tests:**
- Login/logout flow
- Dashboard display
- Assignment browsing and acceptance
- Bottom navigation
- Forms and inputs
- Modals and popups
- Service worker registration
- Push notifications (Chrome/Firefox only)

---

## 6. Troubleshooting

Common deployment issues and solutions.

### 6.1 Build Failures

**Issue: Build fails with TypeScript errors**

```bash
# Error:
# Type error: Property 'xyz' does not exist on type '...'

# Solution:
# Fix TypeScript errors locally first
npx tsc --noEmit

# Address all errors
# Then commit and deploy
```

**Issue: Build fails with dependency errors**

```bash
# Error:
# Cannot find module 'xyz' or its corresponding type declarations

# Solution:
# Install missing dependency
npm install xyz

# Update package.json and package-lock.json
git add package.json package-lock.json
git commit -m "fix: Add missing dependency"
git push origin main
```

**Issue: Build succeeds but deployment fails**

```bash
# Check Vercel logs
vercel logs

# Common causes:
# - Output directory mismatch (should be 'build')
# - Build command incorrect (should be 'npm run build')
# - Missing environment variables

# Solution:
# Verify vercel.json configuration
cat vercel.json

# Update if needed
```

### 6.2 Environment Variable Issues

**Issue: Environment variables not loading**

```bash
# Symptom:
# Supabase or Firebase connection fails
# Console error: "supabaseUrl is required"

# Solution:
# 1. Verify variables set in Vercel dashboard
vercel env ls

# 2. Pull variables locally
vercel env pull .env.local

# 3. Check variable names
cat .env.local

# 4. Ensure variables start with REACT_APP_
# (Create React App requirement)

# 5. Redeploy
vercel --prod --force
```

**Issue: Variables work locally but not in production**

```bash
# Cause:
# Variables not set in Vercel for production environment

# Solution:
# 1. Go to Vercel Dashboard → Settings → Environment Variables
# 2. For each variable, verify "Production" is checked
# 3. Re-save variables
# 4. Redeploy
```

### 6.3 Service Worker Issues

**Issue: Service worker not registering**

```bash
# Symptom:
# No service worker in DevTools → Application → Service Workers
# Console: "Service worker registration failed"

# Solution:
# 1. Verify HTTPS enabled (service workers require HTTPS)
curl -I https://your-domain.com

# 2. Check service-worker.js is accessible
curl https://your-domain.com/service-worker.js

# 3. Verify correct path in index.tsx
# Should be: navigator.serviceWorker.register('/service-worker.js')

# 4. Clear cache and hard reload (Cmd+Shift+R)

# 5. Unregister old service worker
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
```

**Issue: Service worker not updating**

```bash
# Symptom:
# Code changes not reflected in deployed app
# Old version still running

# Solution:
# 1. Update service worker version
# Edit public/service-worker.js:
const CACHE_NAME = 'armora-cpo-v2'; // Increment version

# 2. Force update in browser
# DevTools → Application → Service Workers → Update

# 3. Clear all caches
# DevTools → Application → Storage → Clear site data

# 4. Hard reload (Cmd+Shift+R)
```

### 6.4 Push Notification Issues

**Issue: Notification permission not requested**

```bash
# Symptom:
# No permission prompt appears

# Solution:
# 1. Verify browser supports notifications
console.log('Notification' in window); // Should be true

# 2. Check if permission already denied
console.log(Notification.permission); // Should be "default", "granted", or "denied"

# 3. Reset permission in browser
# Chrome: Settings → Privacy → Site Settings → Notifications
# Find your site → Reset permission

# 4. Clear site data and reload
```

**Issue: FCM token not generated**

```bash
# Symptom:
# Console: "FCM token is null"

# Possible causes:
# 1. VAPID key incorrect
# 2. Firebase config incorrect
# 3. Service worker not registered
# 4. Notification permission denied

# Solution:
# Check each:
console.log('VAPID key:', process.env.REACT_APP_FIREBASE_VAPID_KEY);
console.log('Firebase config:', firebase.apps[0]?.options);
console.log('Service worker:', navigator.serviceWorker.controller);
console.log('Permission:', Notification.permission);

# Fix whichever is incorrect
```

**Issue: Notifications not appearing**

```bash
# Symptom:
# Token generated but notifications don't show

# Solution:
# 1. Test with Firebase Console
#    Cloud Messaging → Send test message → Paste token
# 2. Check browser notification settings
#    Ensure notifications enabled for site
# 3. Verify service worker push handler
#    DevTools → Application → Service Workers → Push event
# 4. Check notification payload format
#    Must include "notification" field
```

### 6.5 PWA Installation Issues

**Issue: Install prompt doesn't appear**

```bash
# Symptom:
# No install button in browser address bar

# Causes:
# 1. Manifest invalid
# 2. Service worker not registered
# 3. Not served over HTTPS
# 4. Already installed

# Solution:
# Run Lighthouse PWA audit
# Chrome DevTools → Lighthouse → Progressive Web App → Generate report

# Fix issues listed in report:
# - Add manifest
# - Register service worker
# - Add icons (192x192, 512x512)
# - Set display: standalone
# - Set start_url
```

**Issue: App not opening in standalone mode**

```bash
# Symptom:
# App opens in browser tab instead of standalone window

# Solution:
# 1. Check manifest.json
#    "display": "standalone" (not "browser")
# 2. Reinstall app
#    Uninstall → Clear cache → Reinstall
# 3. Verify manifest served correctly
curl https://your-domain.com/manifest.json
```

### 6.6 Android TWA Issues

**Issue: APK won't install on device**

```bash
# Symptom:
# "App not installed" error

# Causes:
# 1. Package name mismatch
# 2. Signature verification failed
# 3. Insufficient storage

# Solution:
# 1. Uninstall previous version
adb uninstall com.armora.protection

# 2. Install fresh
adb install app-release-signed.apk

# 3. Check logs
adb logcat | grep PackageInstaller
```

**Issue: Digital asset links verification failed**

```bash
# Symptom:
# App opens with URL bar (not trusted)

# Causes:
# 1. assetlinks.json not accessible
# 2. SHA256 fingerprint mismatch
# 3. Package name mismatch

# Solution:
# 1. Verify assetlinks.json accessible
curl https://your-domain.com/.well-known/assetlinks.json

# 2. Extract SHA256 from APK
keytool -printcert -jarfile app-release-signed.apk

# 3. Verify matches assetlinks.json

# 4. Use Google's verification tool
# https://developers.google.com/digital-asset-links/tools/generator

# 5. Update assetlinks.json if needed
# Commit, deploy, wait for DNS propagation
# Then reinstall APK
```

**Issue: Google Play rejects app**

```bash
# Common rejection reasons:

# 1. Metadata incomplete
# → Fill all required Play Console fields

# 2. Privacy policy missing
# → Add privacy policy URL

# 3. Content rating not completed
# → Complete content rating questionnaire

# 4. Screenshots missing
# → Add at least 2 phone screenshots

# 5. Target API level too low
# → Update targetSdkVersion in twa-manifest.json
# → Rebuild AAB

# 6. Permissions not justified
# → Add permission declarations in Play Console
# → Explain why each permission is needed
```

### 6.7 Performance Issues

**Issue: Slow load times**

```bash
# Symptom:
# Lighthouse performance score <60
# LCP >4s

# Solutions:
# 1. Optimize images
npm install sharp
# Use sharp to compress images

# 2. Code splitting
# Use React.lazy for heavy components
const Dashboard = React.lazy(() => import('./screens/Dashboard'));

# 3. Remove unused dependencies
npm install -g depcheck
depcheck

# 4. Enable Vercel compression
# Already enabled by default

# 5. Lazy load maps
# Only load Leaflet when needed
```

**Issue: Large bundle size**

```bash
# Symptom:
# Main JS bundle >500 KB gzipped

# Analyze bundle:
npm install --save-dev source-map-explorer
npm run build
npx source-map-explorer 'build/static/js/*.js'

# Identify large dependencies
# Replace or lazy load them

# Example: Lazy load Leaflet maps
# Before: import L from 'leaflet';
# After:
const loadLeaflet = async () => {
  const L = await import('leaflet');
  return L.default;
};
```

### 6.8 Database Connection Issues

**Issue: Supabase queries failing**

```bash
# Symptom:
# Error: "Failed to fetch"
# or "JWT expired"

# Solutions:
# 1. Verify Supabase URL and anon key
console.log(process.env.REACT_APP_SUPABASE_URL);
console.log(process.env.REACT_APP_SUPABASE_ANON_KEY?.substring(0, 20));

# 2. Check Row Level Security policies
# RLS may be blocking queries

# 3. Test in Supabase SQL editor
SELECT * FROM protection_officers LIMIT 1;

# 4. Verify auth state
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);

# 5. Refresh session
await supabase.auth.refreshSession();
```

**Issue: Real-time subscriptions not working**

```bash
# Symptom:
# Changes in database don't reflect in app

# Solutions:
# 1. Verify real-time enabled for table
# Supabase Dashboard → Database → Tables → Select table
# → Enable Realtime

# 2. Check subscription code
const subscription = supabase
  .channel('assignments')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'protection_assignments' },
    (payload) => console.log('Change:', payload)
  )
  .subscribe();

# 3. Verify channel status
console.log('Channel state:', subscription.state);
# Should be "joined"

# 4. Check for errors
subscription.on('error', (error) => console.error('Sub error:', error));
```

### 6.9 Vercel Deployment Issues

**Issue: Deployment stuck on "Building"**

```bash
# Symptom:
# Deployment shows "Building..." for >10 minutes

# Solutions:
# 1. Cancel and retry
vercel --prod --force

# 2. Check Vercel status
# https://www.vercel-status.com/

# 3. Clear build cache
# Vercel Dashboard → Project → Settings → General
# → Clear Build Cache

# 4. Check for infinite loops in build
# Review package.json scripts
# Ensure no circular dependencies
```

**Issue: Domain not resolving**

```bash
# Symptom:
# Custom domain shows "This site can't be reached"

# Solutions:
# 1. Wait for DNS propagation (up to 48 hours)
# Check status:
dig your-domain.com

# 2. Verify DNS records
# Should point to Vercel's servers

# 3. Check domain settings in Vercel
# Vercel Dashboard → Project → Settings → Domains
# Verify domain is verified (green checkmark)

# 4. Test with nslookup
nslookup your-domain.com

# 5. Try accessing via Vercel subdomain
# If that works, issue is DNS-related
```

---

## Summary

This comprehensive deployment guide covers:

✅ **Vercel Deployment**
- Environment variables configuration
- Build settings and optimization
- Domain setup (current and custom)
- PWA verification and installation

✅ **Google Play TWA Deployment**
- Keystore creation and management
- SHA256 fingerprint extraction and configuration
- APK/AAB building with Bubblewrap
- Google Play Console setup and submission
- App signing configuration

✅ **Push Notifications Setup**
- Firebase configuration (shared with client app)
- VAPID key setup
- Service worker deployment
- Foreground and background notification handling
- FCM token management
- Testing procedures

✅ **Pre-Deployment Checklist**
- Code quality checks (TypeScript, ESLint)
- Test verification
- Build validation
- Security headers
- PWA manifest validation
- SIA terminology verification

✅ **Post-Deployment Verification**
- Deployment status checks
- Accessibility and performance testing
- PWA installation testing
- Push notification testing
- Core functionality verification
- Analytics and error monitoring

✅ **Troubleshooting Guide**
- Build failures
- Environment variable issues
- Service worker problems
- Push notification issues
- PWA installation problems
- Android TWA issues
- Performance optimization
- Database connection issues
- Vercel-specific problems

---

## Quick Reference

### Production URLs
- **Web App:** https://armoracpo-c4ssbwaoc-giquinas-projects.vercel.app
- **Vercel Dashboard:** https://vercel.com/giquinas-projects/armoracpo
- **GitHub Repo:** https://github.com/giquina/armoracpo

### Key Commands
```bash
# Deploy to production
git push origin main

# Or manually
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Pull environment variables
vercel env pull .env.local

# Build TWA
cd ~/armora-twa && bubblewrap build

# Test locally
npm run build && npx serve -s build
```

### Important Files
- `/public/manifest.json` - PWA manifest
- `/public/service-worker.js` - Service worker with FCM
- `/public/.well-known/assetlinks.json` - Android digital asset links
- `/vercel.json` - Vercel configuration
- `/src/services/notificationService.ts` - Push notification handler

### Support Resources
- **Vercel Docs:** https://vercel.com/docs
- **Firebase Docs:** https://firebase.google.com/docs/cloud-messaging
- **Bubblewrap Docs:** https://github.com/GoogleChromeLabs/bubblewrap
- **Google Play Console:** https://play.google.com/console
- **PWA Docs:** https://web.dev/progressive-web-apps/

---

**Last Updated:** 2025-10-02
**Status:** Production Ready ✅
**Next Steps:** Test on real devices, gather user feedback, iterate
