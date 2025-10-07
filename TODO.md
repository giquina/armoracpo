# ArmoraCPO - Project TODO List

**Last Updated:** October 7, 2025 10:30 UTC
**Google Play Store Target:** Q4 2025
**Overall Completion:** 70%

---

## 🎯 Critical Path to Deployment

### 1. Authentication & User Management
- [x] Initial Supabase setup
- [x] Mock authentication service (temporary)
- [ ] **Replace mock auth with real Supabase Auth** (HIGH PRIORITY)
  - File: `src/contexts/AuthContext.tsx`
  - Switch from `mockAuthService` to real `authService`
  - Agent: `/agent-supabase`
  - Blocker: None
- [ ] **Test Supabase auth flow (signup, login, logout)**
  - Verify email/password auth
  - Test session persistence
  - Test token refresh
- [ ] **Add phone number authentication** (OPTIONAL)
  - Supabase supports SMS auth
  - May require Twilio integration

**Status:** 60% Complete
**Assigned To:** Available (recommend `/agent-supabase`)

---

### 2. Push Notifications (Firebase FCM)
- [x] Firebase project created
- [x] FCM config file (currently mocked)
- [ ] **Replace mock Firebase with real implementation** (HIGH PRIORITY)
  - File: `src/lib/firebase.ts`
  - Restore from: `src/lib/firebase.ts.cpo-backup`
  - Agent: `/agent-firebase`
  - Blocker: None
- [ ] **Configure service worker for FCM**
  - File: `public/firebase-messaging-sw.js`
  - Handle background notifications
- [ ] **Test notification delivery**
  - Test foreground notifications
  - Test background notifications
  - Test notification actions (accept job, view incident)
- [ ] **Store FCM tokens in Supabase**
  - Create `fcm_tokens` table
  - Link to user profiles

**Status:** 40% Complete
**Assigned To:** Available (recommend `/agent-firebase`)

---

### 3. Database & Storage
- [x] Basic Supabase tables created
- [ ] **Create Supabase storage buckets** (MEDIUM PRIORITY)
  - Bucket: `profile-photos` (public)
  - Bucket: `cpo-documents` (private)
  - Bucket: `incident-photos` (private)
  - Agent: `/agent-supabase`
- [ ] **Add Row Level Security (RLS) policies for storage**
  - Public read for profile photos
  - User-only access for documents
  - CPO-only access for incident photos
- [ ] **Migrate remaining tables**
  - `incidents` table (full schema)
  - `earnings` table
  - `compliance_documents` table
  - `notifications` table
- [ ] **Add database indexes for performance**
  - Index on `protection_assignments.cpo_id`
  - Index on `messages.recipient_id`
  - Index on `incidents.assignment_id`

**Status:** 70% Complete
**Assigned To:** Available (recommend `/agent-supabase`)

---

### 4. Security & Compliance
- [ ] **Full security audit** (CRITICAL BEFORE DEPLOYMENT)
  - Scan for hardcoded secrets
  - Validate all environment variables
  - Test authentication edge cases
  - Agent: `/agent-security`
- [ ] **GDPR compliance review**
  - Add privacy policy
  - Add terms of service
  - Implement data export feature
  - Implement data deletion feature
- [ ] **Add rate limiting**
  - Protect API endpoints
  - Prevent spam/abuse
- [ ] **Enable HTTPS everywhere**
  - Verify Vercel SSL
  - Check for mixed content warnings

**Status:** 30% Complete
**Assigned To:** Available (recommend `/agent-security`)

---

### 5. Performance Optimization
- [ ] **Reduce bundle size**
  - Current: Unknown (run `npm run build` to check)
  - Target: < 2MB
  - Code splitting by route
  - Lazy load heavy components
- [ ] **Optimize images**
  - Convert to WebP
  - Add responsive image sizes
  - Implement lazy loading
- [ ] **Add service worker for offline support**
  - Cache API responses
  - Offline mode indicator
  - Queue failed requests
- [ ] **Performance audit**
  - Lighthouse score > 90
  - First Contentful Paint < 1.5s
  - Time to Interactive < 3s

**Status:** 20% Complete
**Assigned To:** Available (recommend `/agent-deployment`)

---

### 6. UI/UX Polish
- [x] Splash screen redesign
- [x] Welcome/onboarding redesign
- [x] Login screen redesign
- [x] DevPanel for navigation
- [ ] **Accessibility improvements**
  - WCAG 2.1 Level AA compliance
  - Screen reader testing
  - Keyboard navigation
  - Color contrast ratios
- [ ] **Animation polish**
  - Smooth page transitions
  - Loading states
  - Skeleton screens
- [ ] **Mobile responsiveness testing**
  - Test on various screen sizes
  - Test on iOS Safari
  - Test on Android Chrome

**Status:** 75% Complete
**Assigned To:** Available (recommend `/agent-mobile-ui`)

---

### 7. Testing
- [ ] **Unit tests**
  - Test coverage > 60%
  - Critical path coverage > 80%
- [ ] **Integration tests**
  - Auth flow
  - Job acceptance flow
  - Incident reporting flow
- [ ] **E2E tests**
  - Cypress or Playwright setup
  - Test user journeys
- [ ] **Manual QA checklist**
  - Test on real devices
  - Test with real users (beta testers)

**Status:** 10% Complete
**Assigned To:** Not assigned

---

### 8. Deployment & DevOps
- [x] Vercel deployment working
- [ ] **Set up staging environment**
  - Separate Supabase project
  - Separate Firebase project
  - Test deployments here first
- [ ] **Configure environment variables**
  - Production: Vercel dashboard
  - Staging: Vercel dashboard
  - Document all required vars
- [ ] **Set up CI/CD pipeline**
  - GitHub Actions for tests
  - Auto-deploy to staging on merge
  - Manual deploy to production
- [ ] **Monitoring & error tracking**
  - Sentry for error tracking
  - Analytics (Google Analytics or Mixpanel)
  - Performance monitoring (Web Vitals)

**Status:** 50% Complete
**Assigned To:** Available (recommend `/agent-deployment`)

---

### 9. Google Play Store Submission
- [ ] **Create Google Play developer account** ($25 one-time fee)
- [ ] **Build Android APK/AAB**
  - Use Capacitor to convert React app to Android
  - Sign with production keystore
- [ ] **Create app store assets**
  - App icon (512x512)
  - Feature graphic (1024x500)
  - Screenshots (at least 4)
  - App description (short & long)
- [ ] **Privacy policy URL**
  - Host on website or GitHub Pages
  - Link in Play Store listing
- [ ] **Complete Play Store listing**
  - Category: Business
  - Content rating questionnaire
  - Target audience: Adults
- [ ] **Submit for review**
  - Review time: 1-7 days
  - Monitor for feedback

**Status:** 0% Complete
**Assigned To:** Not started (recommend `/agent-deployment`)

---

## 🔄 Instance Coordination

### Instance 1 (Main Claude) - Current Focus
- ✅ DevPanel component extraction
- 🔄 Agent coordination files (agents.md, todo.md, suggestions.md)
- ⏸️ Standing by for next task

### Instance 2 (Other Claude) - Suggested Tasks
- 🎯 Run `/fix-auth` - Replace mock authentication
- 🎯 Run `/firebase-fix` - Implement real FCM
- 🎯 Run `/storage-setup` - Create Supabase storage buckets

---

## 📊 Completion Breakdown

| Category | Completion |
|----------|------------|
| Authentication | 60% |
| Push Notifications | 40% |
| Database & Storage | 70% |
| Security | 30% |
| Performance | 20% |
| UI/UX | 75% |
| Testing | 10% |
| Deployment | 50% |
| Play Store | 0% |
| **OVERALL** | **70%** |

---

## 🚨 Blockers

**None currently** ✅

---

## 📞 Next Actions

1. **User decides:** Which agent to invoke first?
   - `/agent-supabase` for auth/database work
   - `/agent-firebase` for FCM implementation
   - `/agent-security` for security audit

2. **Run custom slash commands:**
   - `/fix-auth` - Replace mock authentication
   - `/firebase-fix` - Set up real FCM
   - `/storage-setup` - Create storage buckets
   - `/deploy-check` - Pre-deployment checklist

3. **Coordinate between instances:**
   - Check `AGENT_WORK_LOG.md` before starting work
   - Update this file after completing tasks
   - Prevent duplicate work

---

**Note:** This TODO is shared between both Claude Code instances. Always sync before starting new work.
