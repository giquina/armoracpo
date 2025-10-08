# ArmoraCPO Production Deployment Checklist

**Last Updated:** October 8, 2025
**Status:** Production Ready
**Version:** 1.0.0

---

## Table of Contents

1. [Pre-Deployment Preparation](#pre-deployment-preparation)
2. [Environment Configuration](#environment-configuration)
3. [Service Setup](#service-setup)
4. [Deployment Execution](#deployment-execution)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Troubleshooting Guide](#troubleshooting-guide)
7. [Rollback Procedure](#rollback-procedure)

---

## Overview

This checklist ensures a smooth, secure production deployment of ArmoraCPO. Complete each section in order, verifying each step before proceeding.

**Estimated Time:** 2-3 hours for first deployment
**Prerequisites:** Admin access to Vercel, Supabase, Firebase, and Sentry

---

## Pre-Deployment Preparation

### 1.1 Code Quality Verification

- [ ] **Run all tests locally**
  ```bash
  npm test -- --watchAll=false
  ```
  - **Expected:** All tests pass
  - **Troubleshooting:** Fix failing tests before proceeding

- [ ] **Build the application locally**
  ```bash
  npm run build
  ```
  - **Expected:** Build succeeds with no errors
  - **Troubleshooting:** Check `CLAUDE.md` for common TypeScript fixes

- [ ] **Verify no TypeScript errors**
  ```bash
  npx tsc --noEmit
  ```
  - **Expected:** Zero errors
  - **Troubleshooting:** Review type definitions in `src/types/index.ts`

- [ ] **Check for linting issues**
  ```bash
  npm run build 2>&1 | grep -i "warning"
  ```
  - **Expected:** No critical warnings
  - **Troubleshooting:** See `CLAUDE.md` → "Code Quality & Linting"

### 1.2 Git Repository Status

- [ ] **Verify all changes are committed**
  ```bash
  git status
  ```
  - **Expected:** Working tree clean
  - **Troubleshooting:** Commit or stash changes

- [ ] **Push to GitHub**
  ```bash
  git push origin main
  ```
  - **Expected:** Successfully pushed
  - **Troubleshooting:** Resolve merge conflicts if any

- [ ] **Tag the release** (optional but recommended)
  ```bash
  git tag -a v1.0.0 -m "Production release v1.0.0"
  git push origin v1.0.0
  ```

### 1.3 Documentation Review

- [ ] **Review environment variable template**
  - File: `.env.production.template`
  - Ensure all required variables are documented

- [ ] **Read deployment documentation**
  - [ ] `docs/VERCEL_ENV_SETUP.md`
  - [ ] `docs/SENTRY_SETUP.md`
  - [ ] `docs/FIREBASE_VAPID_SETUP.md`

---

## Environment Configuration

### 2.1 Supabase Configuration (CRITICAL)

**Priority:** P0 - Application will not work without this

- [ ] **Log into Supabase Dashboard**
  - URL: https://app.supabase.com
  - Project: `jmzvrqwjmlnvxojculee` (or your project ID)

- [ ] **Get Supabase credentials**
  - [ ] Navigate to: Settings → API
  - [ ] Copy **Project URL** → Save as `REACT_APP_SUPABASE_URL`
  - [ ] Copy **anon/public key** → Save as `REACT_APP_SUPABASE_ANON_KEY`

- [ ] **Verify Supabase endpoint**
  ```bash
  curl -I https://[YOUR-PROJECT-ID].supabase.co/rest/v1/
  ```
  - **Expected:** HTTP 200 or 401 (both are OK)
  - **Troubleshooting:** Check project ID is correct

- [ ] **Verify RLS policies are enabled**
  - Go to: Database → Policies
  - **Expected:** RLS enabled on all tables
  - **Troubleshooting:** See `docs/RLS_DEPLOYMENT.md`

**Documentation:** `docs/VERCEL_ENV_SETUP.md` (lines 21-43)

### 2.2 Firebase Cloud Messaging (CRITICAL)

**Priority:** P0 - Push notifications will not work without this

- [ ] **Log into Firebase Console**
  - URL: https://console.firebase.google.com
  - Project: `armora-protection`

- [ ] **Get Firebase VAPID Key**
  - [ ] Click gear icon ⚙️ → Project Settings
  - [ ] Go to **Cloud Messaging** tab
  - [ ] Scroll to **Web Push certificates**
  - [ ] If no key exists, click **Generate key pair**
  - [ ] Copy the key (starts with `B...`) → Save as `REACT_APP_FIREBASE_VAPID_KEY`

- [ ] **Verify Firebase configuration values**
  - These are already in code but should match Firebase Console:
    - `REACT_APP_FIREBASE_API_KEY`
    - `REACT_APP_FIREBASE_PROJECT_ID`
    - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
    - `REACT_APP_FIREBASE_APP_ID`

**Documentation:** `docs/FIREBASE_VAPID_SETUP.md`

### 2.3 Sentry Error Tracking (REQUIRED)

**Priority:** P1 - Highly recommended for production monitoring

- [ ] **Create Sentry account** (if not already done)
  - URL: https://sentry.io/signup/

- [ ] **Create new Sentry project**
  - [ ] Click **Projects** → **Create Project**
  - [ ] Platform: **React**
  - [ ] Project name: `armoracpo-production`
  - [ ] Team: Select your team

- [ ] **Get Sentry DSN**
  - [ ] Navigate to: Settings → Projects → armoracpo-production → Client Keys (DSN)
  - [ ] Copy DSN → Save as `REACT_APP_SENTRY_DSN`
  - **Format:** `https://[KEY]@[HOST]/[PROJECT_ID]`

- [ ] **Configure Sentry environment**
  - Set `REACT_APP_SENTRY_ENVIRONMENT=production`

- [ ] **Set application version**
  - Set `REACT_APP_VERSION=1.0.0` (or current git commit hash)

**Documentation:** `docs/SENTRY_SETUP.md`

### 2.4 Optional Environment Variables

- [ ] **Stripe Payment Processing** (if needed)
  - `REACT_APP_STRIPE_PUBLISHABLE_KEY` (use TEST key for preview environments)

- [ ] **Build Configuration**
  - `TSC_COMPILE_ON_ERROR=true` (already in `.env.production`)
  - `DISABLE_ESLINT_PLUGIN=false` (set to true if build fails due to linting)

---

## Service Setup

### 3.1 Vercel Account Setup

- [ ] **Install Vercel CLI** (if not already installed)
  ```bash
  npm install -g vercel
  ```

- [ ] **Login to Vercel**
  ```bash
  vercel login
  ```
  - **Expected:** Browser opens and login succeeds
  - **Troubleshooting:** Use email authentication if SSO fails

- [ ] **Link project to Vercel** (if not already linked)
  ```bash
  vercel link
  ```
  - Select existing project or create new one
  - **Expected:** `.vercel/project.json` created

### 3.2 Configure Vercel Environment Variables

**Method 1: Via Vercel CLI (Recommended)**

```bash
# Set Supabase variables
vercel env add REACT_APP_SUPABASE_URL production
# Paste: https://[YOUR-PROJECT-ID].supabase.co

vercel env add REACT_APP_SUPABASE_ANON_KEY production
# Paste: [YOUR_ANON_KEY]

# Set Firebase VAPID key
vercel env add REACT_APP_FIREBASE_VAPID_KEY production
# Paste: [YOUR_VAPID_KEY]

# Set Sentry variables
vercel env add REACT_APP_SENTRY_DSN production
# Paste: [YOUR_SENTRY_DSN]

vercel env add REACT_APP_SENTRY_ENVIRONMENT production
# Paste: production

vercel env add REACT_APP_VERSION production
# Paste: 1.0.0
```

**Method 2: Via Vercel Dashboard**

- [ ] **Navigate to Vercel Dashboard**
  - URL: https://vercel.com/dashboard
  - Select project: **armoracpo**

- [ ] **Add environment variables**
  - Go to: Settings → Environment Variables
  - Add each variable for **Production** environment:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `REACT_APP_SUPABASE_URL` | `https://[PROJECT-ID].supabase.co` | Production |
| `REACT_APP_SUPABASE_ANON_KEY` | `[YOUR_ANON_KEY]` | Production |
| `REACT_APP_FIREBASE_VAPID_KEY` | `[YOUR_VAPID_KEY]` | Production |
| `REACT_APP_SENTRY_DSN` | `https://[KEY]@[HOST]/[ID]` | Production |
| `REACT_APP_SENTRY_ENVIRONMENT` | `production` | Production |
| `REACT_APP_VERSION` | `1.0.0` | Production |

- [ ] **Verify all variables are set**
  ```bash
  vercel env ls
  ```
  - **Expected:** All required variables listed
  - **Troubleshooting:** Re-add missing variables

### 3.3 Configure Preview Environment (Optional)

- [ ] **Add variables for Preview environment**
  - Use same Supabase project or separate staging project
  - Set `REACT_APP_SENTRY_ENVIRONMENT=preview`
  - Use Stripe TEST keys if applicable

### 3.4 Configure Development Environment (Optional)

- [ ] **Pull environment variables locally**
  ```bash
  vercel env pull .env.local
  ```
  - **Expected:** `.env.local` created with Vercel values
  - **Troubleshooting:** Ensure you're logged in to Vercel CLI

---

## Deployment Execution

### 4.1 Deploy to Vercel

- [ ] **Deploy to production**
  ```bash
  vercel --prod
  ```
  - **Expected:** Deployment succeeds and URL is provided
  - **Troubleshooting:** Check build logs for errors

- [ ] **Verify deployment URL**
  - Example: `https://armoracpo.vercel.app`
  - **Expected:** URL opens and shows app

- [ ] **Check deployment status**
  ```bash
  vercel inspect
  ```
  - **Expected:** Status is "READY"

### 4.2 Monitor Deployment

- [ ] **Watch build logs**
  - In Vercel Dashboard: Deployments → [Latest] → Build Logs
  - **Expected:** Build completes successfully
  - **Troubleshooting:** Look for error messages in logs

- [ ] **Check deployment runtime logs**
  - In Vercel Dashboard: Deployments → [Latest] → Runtime Logs
  - **Expected:** No errors on initial load
  - **Troubleshooting:** Check for missing environment variables

---

## Post-Deployment Verification

### 5.1 Automated Verification Script

- [ ] **Run verification script**
  ```bash
  ./scripts/verify-deployment.sh https://armoracpo.vercel.app
  ```
  - **Expected:** All critical checks pass
  - **Troubleshooting:** Review script output and fix issues

### 5.2 Manual Smoke Tests

#### Basic Functionality

- [ ] **Test homepage loads**
  - Visit: `https://[YOUR-DOMAIN].vercel.app`
  - **Expected:** Page loads with Armora branding
  - **Troubleshooting:** Check browser console for errors

- [ ] **Test welcome page**
  - Visit: `/welcome`
  - **Expected:** Welcome screen with login/signup buttons
  - **Troubleshooting:** Check routing configuration

- [ ] **Test authentication pages**
  - [ ] Visit `/login` - Login form appears
  - [ ] Visit `/signup` - Signup form appears
  - **Troubleshooting:** Check Supabase connection

#### Authentication Flow

- [ ] **Test user login**
  - [ ] Enter credentials and submit
  - [ ] **Expected:** Redirects to dashboard
  - [ ] **Troubleshooting:** Check Supabase Auth logs

- [ ] **Test dashboard loads**
  - [ ] User profile displays correctly
  - [ ] Assignment cards render
  - **Expected:** No console errors
  - **Troubleshooting:** Check Supabase RLS policies

#### Real-Time Features

- [ ] **Test push notification registration**
  - [ ] Open browser console
  - [ ] Grant notification permission when prompted
  - [ ] Look for "FCM token registered" message
  - **Expected:** Token registration succeeds
  - **Troubleshooting:** Check `REACT_APP_FIREBASE_VAPID_KEY` is set

- [ ] **Test service worker registration**
  - [ ] Open DevTools → Application → Service Workers
  - [ ] **Expected:** Service worker active
  - **Troubleshooting:** Check `/service-worker.js` exists

### 5.3 Error Tracking Verification

- [ ] **Test Sentry integration**
  - [ ] Trigger a test error in the app
  - [ ] Check Sentry dashboard: https://sentry.io
  - [ ] **Expected:** Error appears in Sentry within 1 minute
  - [ ] **Troubleshooting:** Check `REACT_APP_SENTRY_DSN` is correct

- [ ] **Verify user context in Sentry**
  - [ ] Login to app
  - [ ] Trigger error
  - [ ] Check Sentry event has user email/ID
  - **Expected:** User context attached to error
  - **Troubleshooting:** Check `setSentryUser()` is called on login

### 5.4 Performance Checks

- [ ] **Run Lighthouse audit**
  - [ ] Open DevTools → Lighthouse
  - [ ] Run audit for Mobile/Desktop
  - [ ] **Expected:**
    - Performance: >80
    - Accessibility: >90
    - Best Practices: >80
    - SEO: >80
  - **Troubleshooting:** Review Lighthouse suggestions

- [ ] **Test on mobile device**
  - [ ] iOS Safari
  - [ ] Android Chrome
  - **Expected:** Responsive design works correctly
  - **Troubleshooting:** Check viewport meta tags

### 5.5 Security Verification

- [ ] **Verify HTTPS is enforced**
  - [ ] Try to access `http://[domain]`
  - [ ] **Expected:** Redirects to `https://[domain]`

- [ ] **Check CSP headers**
  - [ ] Open DevTools → Network → Select document
  - [ ] Check Response Headers for Content-Security-Policy
  - **Expected:** CSP header present
  - **Troubleshooting:** Configure in Vercel settings

- [ ] **Test RLS policies**
  - [ ] Try to access another user's data via API
  - [ ] **Expected:** 403 Forbidden or empty results
  - **Troubleshooting:** Review `docs/RLS_DEPLOYMENT.md`

### 5.6 Critical User Journeys

- [ ] **Job Acceptance Flow**
  - [ ] Browse available jobs
  - [ ] Accept an assignment
  - [ ] **Expected:** Status changes to "assigned"
  - **Troubleshooting:** Check assignment service logs

- [ ] **Incident Reporting** (P0 Feature)
  - [ ] Create new incident report
  - [ ] Upload GPS-tagged photo
  - [ ] Add signature
  - [ ] Submit report
  - [ ] **Expected:** Report saved and PDF generated
  - **Troubleshooting:** Check Supabase Storage permissions

- [ ] **Messaging**
  - [ ] Send message in assignment chat
  - [ ] **Expected:** Message appears in real-time
  - **Troubleshooting:** Check Supabase real-time subscriptions

- [ ] **Daily Occurrence Book**
  - [ ] Start assignment → Check DOB entry created
  - [ ] Complete assignment → Check DOB entry created
  - [ ] **Expected:** Auto-logging works
  - **Troubleshooting:** Check `useDOBAutoLogging` hook

---

## Troubleshooting Guide

### Common Issues

#### Issue: White/Blank Screen After Deployment

**Symptoms:** Page loads but shows nothing
**Causes:**
- Missing environment variables
- JavaScript errors preventing render
- Service worker caching old version

**Solutions:**
1. Check browser console for errors
2. Verify all environment variables are set in Vercel
3. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. Clear browser cache and service workers
5. Check Vercel deployment logs for build errors

#### Issue: Push Notifications Not Working

**Symptoms:** No notification permission prompt or token registration fails
**Causes:**
- `REACT_APP_FIREBASE_VAPID_KEY` not set
- Firebase project misconfigured
- Browser blocking notifications
- HTTPS not enforced

**Solutions:**
1. Verify `REACT_APP_FIREBASE_VAPID_KEY` in Vercel
2. Check Firebase Console → Cloud Messaging → Web Push certificates
3. Test in incognito mode (no extensions)
4. Ensure deployment uses HTTPS
5. Check browser console for Firebase errors
6. See: `docs/FIREBASE_VAPID_SETUP.md`

#### Issue: Sentry Not Receiving Errors

**Symptoms:** Errors occur but don't appear in Sentry
**Causes:**
- `REACT_APP_SENTRY_DSN` incorrect or missing
- Sentry project deleted or disabled
- Network blocking Sentry endpoints
- Environment filter in Sentry

**Solutions:**
1. Verify DSN format: `https://[KEY]@[HOST]/[PROJECT_ID]`
2. Test DSN by triggering manual error
3. Check Sentry project settings → Inbound Filters
4. Verify environment name matches Sentry filter
5. Check browser console for Sentry init messages
6. See: `docs/SENTRY_SETUP.md`

#### Issue: Database Queries Failing (403/401 Errors)

**Symptoms:** "Permission denied" or empty results
**Causes:**
- RLS policies not deployed
- User not authenticated properly
- Wrong Supabase project/key
- RLS policies too restrictive

**Solutions:**
1. Check Supabase Dashboard → Database → Policies
2. Verify user is logged in and session is valid
3. Test query in Supabase SQL Editor
4. Review RLS policy logic for the table
5. Check `REACT_APP_SUPABASE_ANON_KEY` is correct
6. See: `docs/RLS_DEPLOYMENT.md`

#### Issue: Build Fails on Vercel

**Symptoms:** Deployment fails during build phase
**Causes:**
- TypeScript errors
- Missing dependencies
- Environment variable used in build
- Memory/timeout limits

**Solutions:**
1. Run `npm run build` locally to reproduce
2. Check Vercel build logs for specific error
3. Ensure `TSC_COMPILE_ON_ERROR=true` is set
4. Verify all dependencies in package.json
5. Check for outdated packages: `npm outdated`
6. Increase Vercel timeout in project settings

#### Issue: Service Worker Not Registering

**Symptoms:** Offline mode doesn't work
**Causes:**
- Service worker file not built
- HTTPS not enforced
- Browser cache
- Development environment

**Solutions:**
1. Check `/service-worker.js` exists in deployment
2. Verify production build (SW disabled in dev)
3. Test on HTTPS domain only (not localhost)
4. Unregister old service workers in DevTools
5. Hard refresh and retry

### Getting Help

1. **Check Logs:**
   - Vercel: Dashboard → Deployments → [Latest] → Logs
   - Sentry: https://sentry.io (error tracking)
   - Supabase: Dashboard → Logs

2. **Review Documentation:**
   - `CLAUDE.md` - Project overview and conventions
   - `docs/VERCEL_ENV_SETUP.md` - Environment setup
   - `docs/SENTRY_SETUP.md` - Error tracking
   - `docs/FIREBASE_VAPID_SETUP.md` - Push notifications

3. **Verification Script:**
   ```bash
   ./scripts/verify-deployment.sh https://[YOUR-DOMAIN].vercel.app
   ```

4. **Contact Support:**
   - Vercel: https://vercel.com/support
   - Supabase: https://supabase.com/support
   - Firebase: https://firebase.google.com/support

---

## Rollback Procedure

If critical issues occur in production, follow this rollback procedure:

### Immediate Rollback (5 minutes)

1. **Revert to previous deployment in Vercel:**
   ```bash
   # List recent deployments
   vercel ls

   # Promote a specific deployment to production
   vercel promote [DEPLOYMENT_URL]
   ```

   **OR via Vercel Dashboard:**
   - Go to: Deployments
   - Find last working deployment
   - Click: "..." → Promote to Production

2. **Verify rollback:**
   - Visit production URL
   - Confirm previous version is live
   - Test critical functionality

### Planned Rollback (15 minutes)

1. **Revert Git commit:**
   ```bash
   # Find the commit to revert to
   git log --oneline

   # Revert to previous commit
   git revert [COMMIT_HASH]

   # Or reset (destructive)
   git reset --hard [COMMIT_HASH]
   git push --force origin main
   ```

2. **Redeploy:**
   ```bash
   vercel --prod
   ```

3. **Document rollback:**
   - Update `DEPLOYMENT_STATUS.md`
   - Create incident report in Sentry
   - Notify team of rollback reason

---

## Post-Deployment Tasks

### Immediate (Day 1)

- [ ] **Monitor Sentry for errors**
  - Check every 2 hours for first 24 hours
  - Create alerts for critical errors

- [ ] **Monitor Vercel analytics**
  - Check traffic patterns
  - Verify no spike in errors

- [ ] **Test critical flows with real users**
  - Have beta users test the app
  - Collect feedback

### Short-term (Week 1)

- [ ] **Review performance metrics**
  - Check Lighthouse scores
  - Monitor load times in Vercel Analytics

- [ ] **Analyze Sentry error trends**
  - Identify common errors
  - Prioritize fixes

- [ ] **Update documentation**
  - Document any deployment issues encountered
  - Update this checklist with learnings

### Long-term (Month 1)

- [ ] **Schedule security audit**
  - Review RLS policies
  - Check for exposed secrets

- [ ] **Plan next release**
  - Review feature requests
  - Schedule updates

- [ ] **Backup and disaster recovery**
  - Test Supabase backup restoration
  - Document recovery procedures

---

## Checklist Summary

Use this quick reference to track overall progress:

### Critical Path (Must Complete)

- [ ] All tests pass locally
- [ ] Code committed and pushed to GitHub
- [ ] Supabase credentials set in Vercel
- [ ] Firebase VAPID key set in Vercel
- [ ] Sentry DSN set in Vercel
- [ ] Deployed to Vercel production
- [ ] Verification script passes
- [ ] Login flow works
- [ ] Push notifications register
- [ ] Sentry receives test error

### Optional (Recommended)

- [ ] Preview environment configured
- [ ] Stripe keys set (if using payments)
- [ ] Lighthouse audit >80 on all metrics
- [ ] Mobile testing completed
- [ ] Performance monitoring set up
- [ ] Documentation updated

---

## Quick Command Reference

```bash
# Pre-deployment
npm test -- --watchAll=false
npm run build
git status
git push origin main

# Vercel setup
vercel login
vercel link
vercel env add [VAR_NAME] production

# Deployment
vercel --prod

# Verification
./scripts/verify-deployment.sh https://[YOUR-DOMAIN].vercel.app

# Rollback
vercel promote [PREVIOUS_DEPLOYMENT_URL]
```

---

## Next Steps After Successful Deployment

1. **Share the URL** with your team and stakeholders
2. **Monitor Sentry** for the first 24 hours
3. **Run full QA test suite** - See `docs/QA_TESTING_CHECKLIST.md`
4. **Set up monitoring alerts** in Sentry and Vercel
5. **Plan next iteration** based on user feedback

---

**Deployment Checklist Version:** 1.0.0
**Last Updated:** October 8, 2025
**Maintained by:** Development Team
