# ArmoraCPO - Google Play Store Deployment Roadmap

**Last Updated:** October 7, 2025
**Project Status:** 🟡 Pre-Production (70% Complete)
**Target Launch:** Q4 2025

---

## 📊 Executive Summary

The ArmoraCPO platform is a **Progressive Web App (PWA)** for Close Protection Officers to find verified security assignments. The app features comprehensive Supabase backend integration, real-time messaging, Firebase push notifications, and a professional onboarding flow.

**Current State:**
- ✅ **Frontend:** Complete with Splash, Welcome, Auth, and Dashboard flows
- ✅ **Backend:** Supabase database with comprehensive schema and RLS policies
- ⚠️ **Firebase:** Configured but currently in mock mode (needs activation)
- ⚠️ **Storage:** Not configured (needs bucket setup)
- ❌ **Android Build:** Not started (needs TWA/Capacitor setup)

---

## 🚀 Deployment Strategy

### Option 1: Trusted Web Activity (TWA) - Recommended
**Pros:**
- Lightweight wrapper around PWA
- Uses Chrome Custom Tabs (native browser)
- Smaller APK size (~500KB)
- Automatic updates via web
- Simpler maintenance

**Cons:**
- Requires HTTPS and TWA validation
- Limited access to native APIs
- Requires Digital Asset Links verification

### Option 2: Capacitor (Ionic)
**Pros:**
- Full native API access
- Better offline support
- Native plugins available
- More control over app lifecycle

**Cons:**
- Larger APK size (~15-20MB)
- Manual updates required
- More complex setup

**Decision:** **TWA** is recommended for ArmoraCPO as the PWA is already production-ready and TWA provides faster time-to-market.

---

## 📋 Phase 1: Backend Readiness (Week 1)

### 🎯 Critical Tasks

#### 1. Activate Firebase Cloud Messaging
**Status:** ❌ Blocked
**Priority:** CRITICAL
**Estimated Time:** 2-4 hours

**Steps:**
1. Replace `/src/lib/firebase.ts` with `/src/lib/firebase.ts.cpo-backup`
2. Set environment variables in Vercel:
   ```env
   REACT_APP_FIREBASE_API_KEY=<from_console>
   REACT_APP_FIREBASE_AUTH_DOMAIN=armora-protection.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=armora-protection
   REACT_APP_FIREBASE_STORAGE_BUCKET=armora-protection.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1010601153585
   REACT_APP_FIREBASE_APP_ID=<from_console>
   REACT_APP_FIREBASE_VAPID_KEY=<from_console>
   ```
3. Test notification permission flow
4. Send test notification
5. Verify FCM token storage in `protection_officers.fcm_token`

**Slash Command:** `/firebase-fix`

#### 2. Configure Supabase Storage Buckets
**Status:** ❌ Blocked
**Priority:** CRITICAL
**Estimated Time:** 2-3 hours

**Steps:**
1. Create migration file for storage buckets:
   ```sql
   -- 20251007_create_storage_buckets.sql
   INSERT INTO storage.buckets (id, name, public) VALUES
     ('profile-photos', 'profile-photos', true),
     ('cpo-documents', 'cpo-documents', false);

   -- RLS policies for storage
   CREATE POLICY "Public avatar access" ON storage.objects
     FOR SELECT USING (bucket_id = 'profile-photos');

   CREATE POLICY "User uploads own avatar" ON storage.objects
     FOR INSERT WITH CHECK (
       bucket_id = 'profile-photos' AND
       (storage.foldername(name))[1] = auth.uid()::text
     );
   ```
2. Apply migration to production Supabase
3. Test avatar upload in `AvatarUpload.tsx`
4. Test document upload in `DocumentsSection.tsx`

**Slash Command:** `/storage-setup`

#### 3. Replace Mock Auth with Real Supabase Auth
**Status:** ⚠️ Needs Work
**Priority:** HIGH
**Estimated Time:** 4-6 hours

**Steps:**
1. Update `src/contexts/AuthContext.tsx` to use `src/services/authService.ts`
2. Remove mock services (keep for testing, disable in production)
3. Test authentication flows:
   - Sign up new CPO
   - Sign in existing CPO
   - Password reset
   - Profile updates
   - Session persistence

**Slash Command:** `/fix-auth`

#### 4. Verify Production Database Migrations
**Status:** ⚠️ Needs Verification
**Priority:** HIGH
**Estimated Time:** 1-2 hours

**Steps:**
1. Link to production Supabase:
   ```bash
   npx supabase link --project-ref jmzvrqwjmlnvxojculee
   ```
2. Check migration status:
   ```bash
   npx supabase db diff
   ```
3. Apply missing migrations
4. Verify all 5 tables exist:
   - protection_officers
   - protection_assignments
   - payment_records
   - incident_reports
   - assignment_messages
5. Verify RLS policies are active

**Slash Command:** `/supabase-check`

---

## 📋 Phase 2: PWA Optimization (Week 2)

### 🎯 PWA Requirements

#### 1. Manifest Configuration
**Status:** ✅ Complete
**Location:** `/public/manifest.json`

**Verify:**
- [ ] App name: "ArmoraCPO"
- [ ] Short name: "ArmoraCPO"
- [ ] Description
- [ ] Theme color: `#0A1F44` (navy)
- [ ] Background color: `#0A1F44`
- [ ] Display mode: `standalone`
- [ ] Start URL: `/`
- [ ] Orientation: `portrait`
- [ ] Icons: 192x192, 512x512, maskable

#### 2. Service Worker
**Status:** ✅ Partially Complete
**Location:** `/public/service-worker.js`

**Improvements Needed:**
- [ ] Remove hardcoded Firebase config
- [ ] Update static asset cache list
- [ ] Add runtime caching strategies
- [ ] Implement background sync
- [ ] Add offline fallback page

#### 3. Performance Optimization
**Status:** ⚠️ Needs Testing

**Steps:**
1. Run Lighthouse audit:
   ```bash
   npm run build
   npx lighthouse https://armoracpo.vercel.app --view
   ```
2. Target metrics:
   - Performance: >90
   - Accessibility: >95
   - Best Practices: >95
   - SEO: >90
   - PWA: 100
3. Optimize bundle size (currently ~13MB uncompressed)
4. Lazy load routes and components
5. Optimize images and assets
6. Enable gzip/brotli compression

#### 4. Offline Functionality
**Status:** ⚠️ Partial

**Implement:**
- [ ] Offline page fallback
- [ ] Cache API responses
- [ ] Queue actions for later (assignments, messages)
- [ ] Sync when back online

---

## 📋 Phase 3: Android Build (Week 3)

### 🎯 TWA Setup

#### 1. Install Bubblewrap CLI
```bash
npm install -g @bubblewrap/cli
```

#### 2. Initialize TWA Project
```bash
bubblewrap init --manifest https://armoracpo.vercel.app/manifest.json
```

**Configuration:**
- **Package ID:** `com.armora.cpo`
- **App Name:** ArmoraCPO
- **Host:** `armoracpo.vercel.app`
- **Theme Color:** `#0A1F44`
- **Background Color:** `#0A1F44`
- **Orientation:** `portrait`

#### 3. Digital Asset Links
**Location:** `/.well-known/assetlinks.json` (on domain)

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.armora.cpo",
    "sha256_cert_fingerprints": [
      "<SIGNING_KEY_SHA256>"
    ]
  }
}]
```

**Steps:**
1. Generate signing key:
   ```bash
   keytool -genkey -v -keystore armora-cpo.keystore \
     -alias armora-cpo -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Get SHA-256 fingerprint:
   ```bash
   keytool -list -v -keystore armora-cpo.keystore | grep SHA256
   ```
3. Upload `assetlinks.json` to `https://armoracpo.vercel.app/.well-known/assetlinks.json`
4. Verify at: https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://armoracpo.vercel.app

#### 4. Build APK
```bash
bubblewrap build
```

#### 5. Test APK
```bash
adb install app-release-signed.apk
adb logcat | grep TWA
```

#### 6. Generate App Bundle (AAB) for Play Store
```bash
bubblewrap build --skipPwaValidation
```

**Output:** `app-release-bundle.aab`

---

## 📋 Phase 4: Play Store Submission (Week 4)

### 🎯 Play Console Setup

#### 1. Create App on Play Console
**URL:** https://play.google.com/console

**Steps:**
1. Create new app
2. Fill in app details:
   - **Name:** ArmoraCPO - Security Jobs
   - **Category:** Business
   - **Content Rating:** Everyone
   - **Target Audience:** Professionals 18+
   - **Developer Contact:** support@armora.app

#### 2. Store Listing Assets
**Required:**

**App Icon** (512x512 PNG):
- High-resolution ArmoraCPO shield logo
- No transparency

**Feature Graphic** (1024x500 PNG/JPG):
- ArmoraCPO branding with tagline
- "Professional Close Protection Platform"

**Screenshots** (minimum 2, up to 8):
- Phone: 1080x1920 (portrait)
  1. Splash screen
  2. Welcome carousel
  3. Dashboard with assignments
  4. Job browsing
  5. Active assignment view
  6. Profile page
  7. Messages screen
  8. DOB/Incident reporting

#### 3. Privacy Policy
**Required:** Yes (URL must be publicly accessible)

**Host:** `https://armoracpo.vercel.app/privacy-policy`

**Must Include:**
- Data collection (name, email, location, SIA license)
- Data usage (matching CPOs with jobs)
- Third-party services (Supabase, Firebase, Google Maps)
- User rights (access, delete, export data)
- Contact information

#### 4. Content Rating Questionnaire
**Complete IARC Questionnaire:**
- Violence: None
- Sexual content: None
- Profanity: None
- Drugs/Alcohol: References only (security context)
- User interaction: Yes (chat, real-time)
- Personal info: Yes (profile, location)
- Result: Likely "Everyone" or "Teen"

#### 5. App Content Declaration
**Required Declarations:**
- [ ] Data safety form (what data is collected)
- [ ] Ads: No (no advertising)
- [ ] In-app purchases: No (platform fee handled outside app)
- [ ] Target age: 18+ (professional use)
- [ ] COVID-19 contact tracing: No
- [ ] Data security (encryption in transit & at rest)

#### 6. Production Release
**Steps:**
1. Upload AAB file (`app-release-bundle.aab`)
2. Set release name: "1.0.0 - Initial Release"
3. Add release notes:
   ```
   🎉 ArmoraCPO Launch - v1.0.0

   Welcome to ArmoraCPO, the professional platform for Close Protection Officers.

   Features:
   • Browse verified SIA-licensed security assignments
   • Real-time job notifications
   • Secure messaging with principals
   • Digital Daily Occurrence Book (DOB)
   • Incident reporting
   • Performance tracking & ratings
   • Instant payment tracking

   All CPOs must hold a valid SIA license. Account verification required.
   ```
4. Select countries: United Kingdom (initially)
5. Set pricing: Free
6. Submit for review

---

## 📋 Phase 5: Post-Launch (Week 5+)

### 🎯 Monitoring & Optimization

#### 1. Analytics Setup
- [ ] Google Analytics 4
- [ ] Firebase Analytics
- [ ] Sentry error tracking
- [ ] Performance monitoring

#### 2. User Feedback
- [ ] In-app feedback form
- [ ] Play Store review monitoring
- [ ] User testing sessions
- [ ] A/B testing for onboarding

#### 3. Feature Roadmap
- [ ] Geofencing for assignment zones
- [ ] Shift handover notes
- [ ] Emergency SOS with location sharing
- [ ] In-app video calling for briefings
- [ ] CPO team management
- [ ] Advanced analytics dashboard

---

## 🔒 Security & Compliance

### SIA Compliance
- [ ] SIA license verification system
- [ ] Right-to-work document storage
- [ ] DBS check tracking
- [ ] Insurance certificate management
- [ ] Training certification verification

### Data Protection (GDPR)
- [ ] User consent management
- [ ] Data export functionality
- [ ] Right to erasure (account deletion)
- [ ] Data processing agreements
- [ ] Audit trail for data access

### Security Best Practices
- [ ] Rotate exposed credentials (see SECURITY_AUDIT.md)
- [ ] Enable Supabase Auth email verification
- [ ] Implement rate limiting on auth endpoints
- [ ] Add request validation middleware
- [ ] Enable 2FA for admin accounts

---

## 📊 Testing Checklist

### Functional Testing
- [ ] Sign up flow (new CPO)
- [ ] Sign in flow (existing CPO)
- [ ] Profile completion (SIA license, documents)
- [ ] Browse available jobs
- [ ] Apply for assignment
- [ ] Accept assignment
- [ ] Real-time messaging with principal
- [ ] Status updates (en route, active, completed)
- [ ] Incident reporting
- [ ] DOB entry creation
- [ ] Payment tracking
- [ ] Push notifications (assignment updates, messages)
- [ ] Offline mode (graceful degradation)

### Device Testing
- [ ] Samsung Galaxy S21+ (Android 12)
- [ ] Google Pixel 6 (Android 13)
- [ ] OnePlus 9 (Android 12)
- [ ] Huawei P30 (Android 10)
- [ ] Tablet: Samsung Tab S8 (Android 12)

### Browser Testing (Pre-Install)
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Samsung Internet (latest)
- [ ] Edge (latest)

### Performance Testing
- [ ] Load test: 100 concurrent users
- [ ] Database query optimization
- [ ] Real-time subscription performance
- [ ] Bundle size < 5MB gzipped
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s

---

## 📝 Known Issues & Blockers

### Critical Blockers
1. ❌ **Firebase in mock mode** - Push notifications won't work
2. ❌ **Storage buckets not configured** - Avatar/document uploads will fail
3. ⚠️ **Mock auth in production** - Real user authentication not enabled

### High Priority Issues
4. ⚠️ **Service worker hardcoded config** - Firebase config needs to be dynamic
5. ⚠️ **No server-side notification sending** - Need Supabase Edge Function
6. ⚠️ **TypeScript icon warnings** - React 19 + react-icons compatibility issues

### Medium Priority Issues
7. ℹ️ **No Android build yet** - TWA setup not started
8. ℹ️ **Privacy policy not created** - Required for Play Store
9. ℹ️ **No app screenshots** - Need to capture from live app
10. ℹ️ **Bundle size large** - Optimize with lazy loading and code splitting

---

## 🎯 Success Metrics

### Launch Metrics (First 30 Days)
- **Installs:** 100 CPOs
- **Active Users (DAU):** 50
- **Assignment Applications:** 200+
- **Completed Assignments:** 50+
- **Average Rating:** 4.5+ stars
- **Crash Rate:** < 1%
- **App Store Rating:** 4.0+ stars

### Long-term Metrics (90 Days)
- **Installs:** 500 CPOs
- **DAU/MAU Ratio:** 30%+
- **Retention (7-day):** 40%+
- **Retention (28-day):** 20%+
- **NPS Score:** 40+

---

## 📞 Support & Escalation

### Technical Issues
- **Developer:** Claude AI / Development Team
- **Supabase Support:** support@supabase.com
- **Firebase Support:** firebase-support@google.com
- **Play Console Support:** https://support.google.com/googleplay/android-developer

### Business Issues
- **Product Owner:** Muhammad A. Giquina
- **Email:** giquina@users.noreply.github.com
- **GitHub:** https://github.com/giquina/armoracpo

---

## 🚀 Quick Start Commands

```bash
# Development
npm start                    # Start dev server (localhost:3000)
npm run build               # Production build
npm test                    # Run tests

# Supabase
npx supabase start          # Start local Supabase
npx supabase db diff        # Check migration status
npx supabase db push        # Apply migrations to remote

# Firebase
firebase login              # Auth with Firebase
firebase deploy             # Deploy cloud functions

# Deployment
vercel --prod               # Deploy to Vercel
vercel inspect <url> --logs # Check deployment logs

# Android (TWA)
bubblewrap init             # Initialize TWA
bubblewrap build            # Build APK/AAB
adb install app.apk         # Install on device

# Slash Commands (Claude Code)
/supabase-check             # Audit Supabase integration
/firebase-fix               # Activate Firebase FCM
/storage-setup              # Configure storage buckets
/fix-auth                   # Replace mock auth
/deploy-check               # Pre-deployment checklist
```

---

## 📚 Documentation References

- **Supabase Docs:** https://supabase.com/docs
- **Firebase FCM:** https://firebase.google.com/docs/cloud-messaging
- **TWA Guide:** https://developer.chrome.com/docs/android/trusted-web-activity/
- **Bubblewrap:** https://github.com/GoogleChromeLabs/bubblewrap
- **Play Console:** https://support.google.com/googleplay/android-developer/

---

**Next Steps:** Complete Phase 1 (Backend Readiness) this week, then proceed to PWA optimization and Android build.

**Estimated Time to Launch:** 4-5 weeks (assuming no major blockers)

**Risk Level:** MEDIUM - Core infrastructure solid, but critical integrations (Firebase, Storage) need activation.
