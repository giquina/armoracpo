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
- Service worker config expected in `public/service-worker.js`
- VAPID key stored in env: `REACT_APP_FIREBASE_VAPID_KEY`
- FCM token saved to `protection_officers.fcm_token`
- Permission requested on login via `requestNotificationPermission()`

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
- `authService` - Authentication, user management, availability
- `assignmentService` - Assignment CRUD, status updates, subscriptions

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
- CPOs can ONLY see assignments assigned to them
- No access to other CPOs' information
- No access to client/principal private data

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

## Common Issues

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
- `docs/INFRASTRUCTURE-FINDINGS.md` - Backend architecture details
- `docs/PROJECT-STATUS.md` - Current status and next steps
- `docs/supabase.md` - Complete database schema reference
- `docs/firebase.md` - Push notification setup guide
- `docs/suggestions.md` - SIA compliance features
- `docs/todo.md` - Development task breakdown

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

## Production Status

**Current Phase:** Core features implemented, ready for PWA/TWA setup

**Deployed:** Yes - `armoracpo.vercel.app`

**Next Steps:** Service worker implementation, Google Play TWA packaging, push notification testing

**Infrastructure:** Production Supabase + Firebase fully operational with live data
