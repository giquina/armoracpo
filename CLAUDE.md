# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Armora CPO** is a professional Close Protection Officer (CPO) operations platform - a mobile-first Progressive Web App (PWA) for SIA-licensed security professionals in the UK. This is the operator-side application that connects to an existing production backend shared with the Armora client app.

**CRITICAL:** This is a professional security platform, NOT a taxi/rideshare app. Always use correct SIA terminology:
- CPO/Close Protection Officer (NOT "driver")
- Principal (NOT "passenger")
- Assignment/Detail (NOT "ride")
- Operational/Stand Down (NOT "online/offline")
- Security Operations (NOT "transportation")

## Architecture

### Tech Stack
- **Frontend:** React 19.2.0 + TypeScript 4.9.5
- **Routing:** React Router v7
- **State:** Zustand for global state
- **Data Fetching:** React Query (@tanstack/react-query)
- **Backend:** Supabase (PostgreSQL) + Firebase (FCM)
- **Payments:** Stripe Connect
- **Maps:** Leaflet + React Leaflet
- **Deployment:** Vercel
- **Analytics:** Vercel Analytics

### Backend Infrastructure (Shared)
The app connects to **existing production infrastructure**:
- **Supabase URL:** `https://jmzvrqwjmlnvxojculee.supabase.co`
- **Firebase Project:** `armora-protection`
- **Sender ID:** `1010601153585`
- **Status:** Both are fully operational with 3 CPOs already registered

**DO NOT create new backend infrastructure.** All database tables, auth, and services already exist.

### Key Database Tables
- `protection_officers` - CPO profiles with SIA licenses, specializations, ratings
- `protection_assignments` - Job assignments with threat levels, status workflow
- `payment_records` - Payment transactions
- `incident_reports` - Security incident documentation
- Full schema defined in `src/lib/supabase.ts`

### Project Structure
```
src/
├── lib/               # Core integrations (supabase.ts, firebase.ts)
├── services/          # Business logic (authService, assignmentService)
├── screens/           # Full-page views (Dashboard, Jobs, Profile, etc.)
├── components/        # Reusable UI components
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── styles/            # Global CSS
└── assets/            # Static assets
```

## Common Commands

### Development
```bash
# Start development server (http://localhost:3000)
npm start

# Run tests in watch mode
npm test

# Run tests with coverage
npm test -- --coverage

# Build for production
npm run build

# Serve production build locally
npx serve -s build
```

### Testing
```bash
# Run all tests
npm test

# Run specific test file
npm test -- Dashboard.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="login"

# Update snapshots
npm test -- -u
```

### Code Quality
```bash
# TypeScript type checking
npx tsc --noEmit

# Check for TypeScript errors in specific file
npx tsc --noEmit src/screens/Dashboard/Dashboard.tsx
```

## Development Guidelines

### Authentication Flow
1. User logs in via `authService.login(email, password)`
2. System fetches CPO profile from `protection_officers` table
3. Checks `verification_status` (must be 'verified')
4. Requests FCM token for push notifications
5. Returns `{ user, cpo }` object
6. Protected routes use `ProtectedRoute` wrapper component

**CPO Verification:** Only verified CPOs (`verification_status: 'verified'`) can access the app. Unverified accounts are signed out with an error message.

### Real-time Features
The app uses Supabase real-time subscriptions for live updates:

```typescript
// Subscribe to assignment updates (see assignmentService.ts)
const unsubscribe = assignmentService.subscribeToAssignments(
  cpoId,
  (assignment) => {
    // Handle real-time assignment update
  }
);

// Clean up on unmount
return () => unsubscribe();
```

### Assignment Status Workflow
```
pending → assigned → en_route → active → completed
                         ↓
                    cancelled
```

- `pending` - Unassigned, available for CPOs to accept
- `assigned` - CPO accepted, preparing to start
- `en_route` - CPO traveling to pickup location
- `active` - Protection detail in progress
- `completed` - Assignment finished successfully
- `cancelled` - Assignment cancelled by either party

### Push Notifications (Firebase)
- Service worker config in `public/service-worker.js`
- Notification service in `src/services/notificationService.ts`
- VAPID key stored in env: `REACT_APP_FIREBASE_VAPID_KEY`
- FCM token saved to `protection_officers.fcm_token`
- Auto-initialized on successful authentication (see App.tsx)
- Gracefully handles unsupported browsers (null checks in place)

### Mobile-First Approach
- **Baseline:** Design for 320px width minimum (iPhone SE)
- **Touch Targets:** Minimum 44px for all interactive elements
- **Performance:** Target <3s load time on 3G networks
- **PWA:** Installable via `manifest.json` with service worker

## Environment Variables

Required variables (see `.env.example`):
```bash
# Supabase (shared with client app)
REACT_APP_SUPABASE_URL=https://jmzvrqwjmlnvxojculee.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<from_client_app>

# Firebase (shared with client app)
REACT_APP_FIREBASE_API_KEY=<from_armora-protection>
REACT_APP_FIREBASE_AUTH_DOMAIN=armora-protection.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=armora-protection
REACT_APP_FIREBASE_STORAGE_BUCKET=armora-protection.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1010601153585
REACT_APP_FIREBASE_APP_ID=<from_armora-protection>
REACT_APP_FIREBASE_VAPID_KEY=<for_push_notifications>
```

**To get missing values:** Check the Armora client app repository or Firebase/Supabase dashboards.

## Important Patterns

### Type Safety with Supabase
All database types are defined in `src/lib/supabase.ts`:
- `ProtectionOfficer` - CPO profile
- `ProtectionAssignment` - Job assignment
- `PaymentRecord` - Payment transaction
- `IncidentReport` - Security incident
- `Database` - Full database schema type

Use these types consistently throughout the app.

### Service Layer Pattern
Business logic lives in `src/services/`:
- `auth.service.ts` - **NEW (Jan 2025)** Comprehensive authentication service with signup/signin/signout, profile management, password reset
- `authService` - Legacy authentication service (being phased out in favor of auth.service.ts)
- `assignmentService` - Assignment CRUD, status updates, subscriptions
- `notificationService` - FCM push notifications, token management

**IMPORTANT:** Use the new `auth.service.ts` for all authentication operations. It provides:
- Complete signup flow with CPO profile auto-creation
- Signin/signout with session management
- Profile retrieval (user profile + CPO profile)
- Profile updates
- Password reset/update
- Auth state change listener

Always use services for data operations, not direct Supabase calls in components.

### Error Handling
```typescript
try {
  const result = await authService.login(email, password);
  // Handle success
} catch (error: any) {
  // Services throw Error objects with descriptive messages
  showError(error.message);
}
```

Services throw descriptive errors - catch and display to users appropriately.

### Protected Routes
All authenticated routes must be wrapped:
```tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <AppLayout>
        <Dashboard />
      </AppLayout>
    </ProtectedRoute>
  }
/>
```

`ProtectedRoute` checks auth status and redirects to login if needed.

### Bottom Navigation
Authenticated pages include `<BottomNav />` via `AppLayout` wrapper. The navigation is automatically included - don't add it to individual screens.

### Dev Panel for Navigation (Development Only)
The Login screen includes a hidden dev panel for quick navigation:
- **Access:** Click the "▲ DEV PANEL" button at bottom of login screen
- **Visibility:** Only shown in `NODE_ENV=development`
- **Purpose:** Bypass authentication to test screens during development
- **Screens:** Dashboard, Jobs, Active, History, Messages, Profile, Earnings, Compliance, Settings
- **Location:** `src/screens/Auth/Login.tsx` (DevPanel component)

## SIA Compliance Requirements

The UK Security Industry Authority (SIA) requires:
- Valid SIA license (tracked in `sia_license_number`, `sia_license_type`, `sia_license_expiry`)
- DBS check verification
- Professional indemnity insurance
- Training certifications
- Compliance scoring

All CPO features must support SIA regulatory requirements. See `docs/suggestions.md` for detailed compliance features.

## Deployment

### Vercel Configuration
The app deploys to Vercel automatically on push to `main` branch:
- Build: `npm run build`
- Output: `build/` directory
- Framework: Create React App (auto-detected)
- SPA routing handled via `vercel.json` rewrites
- Security headers configured in `vercel.json`

### PWA Setup
Progressive Web App features:
- Manifest: `public/manifest.json` (standalone mode, portrait orientation)
- Icons: 192x192 and 512x512 (maskable)
- Service Worker: Register in `src/index.tsx` for offline support
- Theme: `#1a1a1a` (dark theme color)

### Pre-deployment Checklist
1. All tests passing: `npm test`
2. TypeScript compiles: `npx tsc --noEmit`
3. Build succeeds: `npm run build`
4. Environment variables configured in Vercel dashboard
5. Service worker registered and functioning
6. PWA manifest valid (test with Lighthouse)

## Security Considerations

### Row Level Security (RLS)
All Supabase queries must respect RLS policies:
- CPOs can ONLY access their own profile data
- CPOs can ONLY see assignments assigned to them OR pending assignments (for acceptance)
- No access to other CPOs' information
- No access to client/principal private data

**RLS Migration:** Comprehensive RLS policies have been created in `/supabase/migrations/20250103_enable_rls_policies.sql` (944 lines). This migration includes:
- Policies for all core tables (protection_officers, protection_assignments, payments, incidents, messages, reviews, etc.)
- Helper functions for role checking (`is_cpo`, `get_cpo_id`, `is_assignment_principal`, `is_assignment_cpo`)
- Storage bucket policies for secure file access
- Verification views (`rls_status`, `rls_policies`) for monitoring

**Deployment:** See `/docs/RLS_DEPLOYMENT.md` for instructions on deploying RLS policies to Supabase.

### Data Validation
- Validate all form inputs client-side AND server-side
- Never trust user input for security-critical operations
- Use TypeScript types to enforce data shapes
- Sanitize user-generated content before display

### Authentication
- Never store auth tokens in localStorage (Supabase handles this)
- Always check `verification_status` before granting access
- Sign out unverified users immediately
- Request notification permissions AFTER successful auth

## Common Issues & Troubleshooting

### Black Screen on Load
**Symptoms:** Browser shows completely black/blank page
**Common Causes:**
1. **JSX Syntax Error:** Missing closing braces `}` or tags in React components
2. **Corrupted .env file:** Check first line doesn't have extra text before `REACT_APP_`
3. **Import Error:** Component fails to load due to missing dependency

**Debug Steps:**
```bash
# 1. Check TypeScript compilation
npx tsc --noEmit

# 2. Check browser console (F12) for errors
# Look for: "SyntaxError", "Cannot find module", "Unexpected token"

# 3. Restart dev server
# Kill port 3000 and restart: npm start
```

### Corrupted Environment File
If `.env` file gets corrupted (e.g., extra text on first line):
```bash
# Check first line
head -1 .env
# Should start with: REACT_APP_SUPABASE_URL=

# Fix: Edit .env and remove any text before REACT_APP_
```

### Firebase Messaging Not Available
Firebase messaging only works in supported browsers with:
- `Notification` API support
- Service Worker support
- HTTPS connection (or localhost)

The code gracefully handles unsupported environments:
```typescript
if ('Notification' in window && 'serviceWorker' in navigator) {
  messaging = getMessaging(app);
}
```

### Supabase RLS Policy Errors
If queries fail with permission errors:
1. Check that RLS policies exist for the table
2. Verify the policy allows the current user's role
3. Ensure `auth.uid()` matches the logged-in user
4. Test policies in Supabase SQL editor

### Assignment "No Longer Available" Error
When accepting assignments, race conditions can occur:
- Multiple CPOs may attempt to accept the same assignment
- The service includes checks: `.eq('status', 'pending').is('cpo_id', null)`
- If the update returns no rows, the assignment was taken by another CPO
- Handle gracefully with user-friendly error message

## Testing Strategy

### Unit Tests
Test files colocated with components: `Dashboard.test.tsx`
- Test component rendering
- Test user interactions (clicks, form submissions)
- Mock service calls with `jest.mock()`
- Use `@testing-library/react` utilities

### Integration Tests
Test service layers directly:
- Mock Supabase client responses
- Test error handling paths
- Verify correct data transformations
- Test real-time subscription logic

### E2E Testing (Future)
Consider adding Cypress or Playwright for:
- Full authentication flow
- Assignment acceptance workflow
- GPS tracking during active assignments
- Payment/earnings calculations

## Documentation References

Comprehensive docs available in `docs/`:
- `docs/00-START-HERE.md` - Master index and quick start
- `docs/DEPLOYMENT.md` - Complete Vercel + Google Play deployment guide
- `docs/INFRASTRUCTURE-FINDINGS.md` - Backend architecture details
- `docs/PROJECT-STATUS.md` - Current status and next steps (updated Jan 3, 2025)
- `docs/RLS_DEPLOYMENT.md` - **NEW (Jan 2025)** RLS policies deployment guide
- `docs/supabase.md` - Complete database schema reference
- `docs/firebase.md` - Push notification setup guide
- `docs/suggestions.md` - SIA compliance features
- `docs/todo.md` - Development task breakdown (updated Jan 3, 2025)
- `TEST_REPORT.md` - Test coverage and verification report
- `PWA_SETUP_COMPLETE.md` - PWA configuration details

### Database Migrations
- `supabase/migrations/20250103_enable_rls_policies.sql` - **NEW** Comprehensive RLS policies (944 lines)
- `supabase/migrations/20250103_insert_test_data.sql` - **NEW** Test data for development (783 lines)
- `supabase/migrations/20250103_verify_rls.sql` - RLS verification queries
- `supabase/migrations/20250102000000_create_assignment_messages.sql` - Assignment messaging table

## Quick Reference

### Get Current User
```typescript
const { user, cpo } = await authService.getCurrentUser();
```

### Update CPO Availability
```typescript
await authService.updateAvailability(cpoId, true); // Go operational
await authService.updateAvailability(cpoId, false); // Stand down
```

### Accept Assignment
```typescript
const assignment = await assignmentService.acceptAssignment(assignmentId, cpoId);
```

### Update Location
```typescript
await authService.updateLocation(cpoId, latitude, longitude);
```

### Complete Assignment
```typescript
await assignmentService.completeAssignment(assignmentId);
```

## TWA (Trusted Web Activity) - Android App

### Building for Google Play
The project includes Bubblewrap configuration for packaging as an Android app:

```bash
# Build signed release AAB for Google Play
./gradlew clean bundleRelease

# Output location
app/build/outputs/bundle/release/app-release.aab
```

**Key files:**
- `twa-manifest.json` - TWA configuration (package: com.armora.cpo)
- `armora-cpo.keystore` - Android signing keystore (NEVER commit)
- `public/.well-known/assetlinks.json` - Digital Asset Links verification
- `app/build.gradle` - Android build configuration

**Important:** The keystore password is stored securely. See `docs/DEPLOYMENT.md` for full TWA deployment instructions.

## Production Status

**Current Phase:** ✅ Production-ready with PWA and TWA support

**Deployed:** Yes - `armoracpo.vercel.app`

**TWA Status:** ✅ Signed AAB ready for Google Play Store upload

**Infrastructure:** Production Supabase + Firebase fully operational with live data

## Recent Updates (January 2025)

### Authentication System Overhaul
A comprehensive authentication service has been implemented:
- **New Service:** `/src/services/auth.service.ts` (287 lines)
- **Features:** Complete signup/signin/signout, CPO profile auto-creation, password reset, profile management
- **Integration:** Fully integrated with Supabase Auth and protection_officers table
- **Status:** ✅ Complete and ready for use

### Database Security (RLS Policies)
Comprehensive Row Level Security policies have been created:
- **Migration:** `/supabase/migrations/20250103_enable_rls_policies.sql` (944 lines)
- **Coverage:** All core tables (protection_officers, assignments, payments, incidents, messages, reviews, etc.)
- **Helper Functions:** Role checking functions (is_cpo, get_cpo_id, etc.)
- **Storage Security:** Bucket policies for cpo-profiles, compliance-documents, incident-evidence
- **Status:** ✅ Created, ready for deployment (see `/docs/RLS_DEPLOYMENT.md`)

### Test Data
Development test data has been created:
- **Migration:** `/supabase/migrations/20250103_insert_test_data.sql` (783 lines)
- **Includes:** 5 test CPOs, 8 assignments, 4 payments, 2 incidents, 5 messages
- **Status:** ✅ Created, ready for deployment to dev/staging environments
- **Warning:** ⚠️ Development/testing ONLY - DO NOT run in production

### Environment Configuration
Production Supabase credentials have been configured:
- **File:** `.env` (updated with real credentials)
- **Supabase URL:** https://jmzvrqwjmlnvxojculee.supabase.co
- **Supabase Anon Key:** Configured and ready
- **Status:** ✅ Complete

## Known Issues

The app may have minor TypeScript warnings during builds, but all core CPO features are fully functional. Always use the service layer (`src/services/`) for data operations.

### Core CPO Features (Status)
- ✅ Authentication with new `auth.service.ts` (fully implemented)
- ✅ Assignment management with `assignmentService.ts`
- ✅ Real-time updates via Supabase subscriptions
- ✅ Push notifications via Firebase
- ✅ GPS tracking
- ✅ Earnings calculations
- ✅ Profile management

### Pending Tasks
- [ ] Deploy RLS policies to Supabase (migration ready, needs manual deployment)
- [ ] Deploy test data to dev/staging environment
- [ ] Test complete authentication flow with new auth.service.ts
- [ ] Verify CPO profile creation during signup
