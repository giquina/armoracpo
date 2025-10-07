# CLAUDE.md

This file provides context and guidance for Claude Code when working on the Armora CPO application. It contains architectural patterns, conventions, and critical information to help Claude understand the codebase structure and make informed decisions.

---

## Project Overview

**Armora CPO** is a Progressive Web Application (PWA) for Close Protection Officers (CPOs) - security professionals licensed by the Security Industry Authority (SIA) in the UK. This is NOT a taxi or ride-sharing app.

**Purpose**: Enable CPOs to:
- Accept and manage protection assignments from principals (clients)
- Track active assignments with GPS location
- Submit incident reports during protection details
- Manage SIA license verification and compliance
- Communicate with dispatch and principals
- Track earnings and payment history

**Critical Terminology**:
- **CPO** (Close Protection Officer) - NOT "driver"
- **Principal** - Client requesting protection (NOT "passenger")
- **Assignment** - Protection job/detail (NOT "ride" or "trip")
- **Protection Detail** - Active assignment in progress
- **SIA License** - UK Security Industry Authority certification

**Codebase Stats**:
- Total Lines of Code: ~13,000 lines
- Test Files: 37 test files
- Primary Language: TypeScript + React
- Target Platform: Mobile-first PWA (Progressive Web App)

---

## Tech Stack

### Core Technologies
- **React**: 19.2.0 (latest)
- **TypeScript**: 5.7.2
- **React Router**: 7.9.3 (for navigation)
- **React Scripts**: 5.0.1 (Create React App)

### Backend & Infrastructure
- **Supabase**: Authentication, PostgreSQL database, real-time subscriptions
  - Client: @supabase/supabase-js ^2.58.0
  - URL: `https://jmzvrqwjmlnvxojculee.supabase.co`
  - Used for: Auth, database queries, real-time updates
- **Firebase**: Cloud Messaging (FCM) ONLY
  - Client: firebase ^12.3.0
  - Project: `armora-protection`
  - Used for: Push notifications ONLY (NOT authentication)
- **Vercel**: Hosting and deployment platform

### Key Libraries
- **State Management**: Zustand (5.0.8) for global state
- **Forms**: React Hook Form (7.63.0)
- **Data Fetching**: TanStack React Query (5.90.2)
- **Maps**: Leaflet (1.9.4) + React Leaflet (5.0.0)
- **Animations**: Framer Motion (12.23.22)
- **Charts**: Chart.js (4.5.0) + React ChartJS 2 (5.3.0)
- **Icons**: React Icons (5.5.0)
- **Dates**: date-fns (4.1.0)
- **PDF Generation**: jsPDF (3.0.3) + jsPDF-AutoTable (5.0.2)
- **Payments**: Stripe (@stripe/stripe-js 8.0.0, @stripe/react-stripe-js 5.0.0)

### Testing
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright (1.48.2)

---

## Project Structure

```
/workspaces/armoracpo/
├── src/
│   ├── screens/           # Feature-based screen components
│   │   ├── Auth/          # Login, signup flows
│   │   ├── Dashboard/     # Main CPO dashboard
│   │   ├── Jobs/          # Browse available assignments
│   │   ├── Incidents/     # Incident reporting
│   │   ├── Messages/      # Messaging system
│   │   ├── Profile/       # CPO profile management
│   │   ├── DOB/           # Digital Officer's Book (compliance log)
│   │   ├── Earnings/      # Payment history
│   │   ├── Compliance/    # SIA license verification
│   │   ├── Settings/      # App settings
│   │   ├── Splash/        # App splash screen
│   │   └── Welcome/       # Onboarding welcome screen
│   │
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Shared components (buttons, cards, etc.)
│   │   ├── layout/        # Layout components (navigation, header)
│   │   ├── dashboard/     # Dashboard-specific components
│   │   ├── jobs/          # Job listing components
│   │   ├── incidents/     # Incident form components
│   │   ├── messages/      # Message UI components
│   │   ├── profile/       # Profile form components
│   │   ├── dob/           # DOB log components
│   │   ├── earnings/      # Payment display components
│   │   ├── compliance/    # Verification status components
│   │   ├── settings/      # Settings form components
│   │   ├── ui/            # Base UI primitives
│   │   ├── dev/           # DevPanel (development tools)
│   │   ├── debug/         # Debug utilities
│   │   ├── onboarding/    # Onboarding flow components
│   │   ├── signup/        # Registration components
│   │   └── animations/    # Animation utilities
│   │
│   ├── services/          # Business logic & API layer
│   │   ├── authService.ts          # Authentication logic
│   │   ├── assignmentService.ts    # Assignment CRUD operations
│   │   ├── incidentService.ts      # Incident reporting
│   │   ├── incidentPDFService.ts   # PDF generation for incidents
│   │   ├── messageService.ts       # Messaging operations
│   │   ├── dobService.ts           # DOB log operations
│   │   ├── notificationService.ts  # FCM push notifications
│   │   ├── mockData.ts             # Mock data for development
│   │   └── mock*.service.ts        # Mock service implementations
│   │
│   ├── contexts/          # React Context providers
│   │   ├── AuthContext.tsx                    # User authentication state
│   │   ├── AppContext.tsx                     # Global app state
│   │   └── ProtectionAssignmentContext.tsx    # Assignment booking state
│   │
│   ├── hooks/             # Custom React hooks
│   │   └── useDOBAutoLogging.ts
│   │
│   ├── lib/               # Third-party library configurations
│   │   ├── supabase.ts    # Supabase client + TypeScript types
│   │   └── firebase.ts    # Firebase FCM configuration
│   │
│   ├── types/             # TypeScript type definitions
│   │   ├── index.ts           # Shared types
│   │   ├── database.types.ts  # Generated Supabase types
│   │   └── venue.ts           # Venue-related types
│   │
│   ├── utils/             # Utility functions
│   │   ├── errorMessages.ts       # Error handling
│   │   ├── haptics.ts             # Haptic feedback
│   │   ├── inputSanitization.ts   # Input validation
│   │   └── riskCalculator.ts      # Risk assessment logic
│   │
│   ├── styles/            # Global styles
│   │   └── global.css     # CSS custom properties + base styles
│   │
│   └── data/              # Static data files
│
├── public/                # Static assets
│   ├── manifest.json               # PWA manifest
│   ├── service-worker.js           # Service worker for offline support
│   └── firebase-messaging-sw.js    # FCM service worker
│
├── supabase/              # Supabase migrations & config
│   └── migrations/        # Database migration SQL files
│
└── docs/                  # Documentation
```

---

## Architecture Patterns

### 1. Authentication Flow

**Supabase Auth ONLY** (Firebase is NOT used for authentication)

```typescript
// Authentication handled by AuthContext + authService
// Location: src/contexts/AuthContext.tsx, src/services/authService.ts

Flow:
1. User enters email/password on Login screen
2. AuthService calls supabase.auth.signInWithPassword()
3. Supabase returns user + session
4. AuthService fetches CPO profile from protection_officers table
5. Check verification_status === 'verified' (reject if pending/rejected)
6. Request FCM token for push notifications
7. Update AuthContext with user, session, cpoProfile
8. Redirect to Dashboard
```

**Important**:
- Firebase is ONLY used for FCM tokens (push notifications)
- All auth is handled by Supabase
- CPO profile is stored in `protection_officers` table
- Verification status MUST be 'verified' to login

### 2. Service Layer Pattern

All data operations go through service files (NOT direct Supabase calls in components):

```typescript
// BAD - Direct Supabase call in component
const { data } = await supabase.from('protection_assignments').select('*');

// GOOD - Use service layer
import { assignmentService } from '../services/assignmentService';
const assignments = await assignmentService.getAvailableAssignments();
```

**Service Responsibilities**:
- Handle all Supabase queries
- Error handling and transformation
- Business logic (status transitions, validations)
- Type safety with TypeScript interfaces

### 3. Real-Time Subscriptions

Supabase real-time channels for live updates:

```typescript
// Example: Listen for assignment status changes
const channel = supabase
  .channel('assignment-updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'protection_assignments',
      filter: `cpo_id=eq.${cpoId}`
    },
    (payload) => {
      // Handle assignment update
    }
  )
  .subscribe();
```

**Used For**:
- Assignment status changes (assigned → en_route → active → completed)
- New messages in messaging system
- Incident report updates

### 4. State Management Strategy

**Local State**: useState, useReducer for component-specific state
**Context**: AuthContext, AppContext, ProtectionAssignmentContext for shared state
**Server State**: TanStack React Query for async data fetching/caching
**Global State**: Zustand for complex global state (currently minimal usage)

### 5. Route Protection

Protected routes require authenticated CPO with verified status:

```typescript
// Route structure in App.tsx
// Public Routes
/ → Login
/welcome → Welcome screen
/signup → Registration

// Protected Routes (require authentication)
/dashboard → Main dashboard
/jobs → Job management hub
/jobs/available → Browse available assignments
/active → Active assignment tracking
/history → Completed assignments
/profile → User profile
/earnings → Payment history
/compliance → Document management
/settings → App settings
/messages → Message list
/messages/:assignmentId → Chat view
/incidents → Incident report list
/incidents/new → Create incident report
/incidents/:id → View incident report
/dob → Daily Occurrence Book
```

---

## Database Schema Overview

### Core Tables

#### `protection_officers`
**CPO profiles with SIA license and professional details**

Key fields:
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users)
- `email`, `first_name`, `last_name`, `phone`
- `sia_license_number`, `sia_license_type`, `sia_license_expiry`
- `verification_status` ('pending' | 'verified' | 'rejected')
- `is_available` (boolean)
- `current_latitude`, `current_longitude` (GPS tracking)
- `fcm_token` (Firebase Cloud Messaging token)
- `rating`, `total_assignments` (performance metrics)
- Banking details, emergency contacts, vehicle info

#### `protection_assignments`
**Protection jobs connecting principals with CPOs**

Key fields:
- `id` (uuid, PK)
- `principal_id` (uuid, FK → principals)
- `cpo_id` (uuid, FK → protection_officers, nullable)
- `assignment_type` ('close_protection' | 'event_security' | 'residential_security' | 'executive_protection' | 'transport_security')
- `threat_level` ('low' | 'medium' | 'high' | 'critical')
- `status` ('pending' | 'assigned' | 'en_route' | 'active' | 'completed' | 'cancelled')
- `pickup_location`, `pickup_latitude`, `pickup_longitude`
- `dropoff_location`, `dropoff_latitude`, `dropoff_longitude`
- `scheduled_start_time`, `scheduled_end_time`
- `actual_start_time`, `actual_end_time`
- `base_rate`, `total_cost`
- `principal_name`, `principal_phone` (denormalized)

**Status Workflow**:
```
pending → assigned → en_route → active → completed
                                        → cancelled
```

#### `incident_reports`
**Security incidents logged during assignments**

Key fields:
- `id` (uuid, PK)
- `assignment_id` (uuid, FK → protection_assignments)
- `cpo_id` (uuid, FK → protection_officers)
- `incident_type` ('threat' | 'medical' | 'property_damage' | 'protocol_breach' | 'other')
- `severity` ('low' | 'medium' | 'high' | 'critical')
- `description`, `actions_taken`
- `location_latitude`, `location_longitude`
- `witness_statements`, `photo_urls`, `video_urls`

#### `payment_records`
**Payment tracking for completed assignments**

Key fields:
- `id` (uuid, PK)
- `assignment_id` (uuid, FK)
- `cpo_id` (uuid, FK)
- `amount`, `currency`
- `payment_status` ('pending' | 'processing' | 'completed' | 'failed')
- `stripe_payment_intent_id`

#### `messages` / `assignment_messages`
**In-app messaging between CPOs, principals, and dispatch**

Key fields:
- `id` (uuid, PK)
- `sender_id`, `receiver_id` (uuid)
- `assignment_id` (uuid, FK, optional)
- `content`, `message_type`
- `read_at` (timestamptz)

#### `dob_entries` (Daily Occurrence Book)
**Activity logging and compliance documentation**

Key fields:
- `id` (uuid, PK)
- `cpo_id` (uuid, FK)
- `assignment_id` (uuid, FK, optional)
- `entry_type` (string)
- `description` (text)
- `timestamp` (timestamptz)

### Row Level Security (RLS)

All tables use RLS policies to ensure data isolation:
- CPOs can only read/update their own profile
- CPOs can only see assignments where `cpo_id = their_id` OR `status = 'pending'`
- Incident reports are only visible to the CPO who created them
- Messages are only visible to sender/receiver

---

## Naming Conventions

### Files & Directories
- **Screens**: PascalCase (e.g., `Dashboard.tsx`, `IncidentReports.tsx`)
- **Components**: PascalCase (e.g., `AssignmentCard.tsx`, `BottomNav.tsx`)
- **Services**: camelCase (e.g., `assignmentService.ts`, `authService.ts`)
- **Contexts**: PascalCase + "Context" suffix (e.g., `AuthContext.tsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `useAuth.ts`, `useAssignments.ts`)

### Variables & Functions
- **camelCase** for variables and functions
- **PascalCase** for React components and TypeScript interfaces/types
- **UPPER_SNAKE_CASE** for constants

### Component Organization
```typescript
// 1. Imports (React, libraries, types, components, styles)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { assignmentService } from '../services/assignmentService';
import { ProtectionAssignment } from '../lib/supabase';
import AssignmentCard from '../components/jobs/AssignmentCard';
import './Dashboard.css';

// 2. Type definitions (props, state)
interface DashboardProps {
  // ...
}

// 3. Component definition
const Dashboard: React.FC<DashboardProps> = ({ /* props */ }) => {
  // 4. State & refs
  // 5. Effects
  // 6. Event handlers
  // 7. Render helpers
  // 8. Return JSX
};

// 9. Export
export default Dashboard;
```

---

## Environment Variables

Required in `.env.local` (local) and Vercel (production):

### Supabase (REQUIRED)
```bash
REACT_APP_SUPABASE_URL=https://jmzvrqwjmlnvxojculee.supabase.co
REACT_APP_SUPABASE_ANON_KEY=[get from Supabase dashboard]
```

### Firebase (REQUIRED for push notifications)
```bash
REACT_APP_FIREBASE_API_KEY=AIzaSyDBpJL8uN2s6HN4qcWnR0vCwZVU5w3g5YE
REACT_APP_FIREBASE_AUTH_DOMAIN=armora-protection.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=armora-protection
REACT_APP_FIREBASE_STORAGE_BUCKET=armora-protection.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=785567849849
REACT_APP_FIREBASE_APP_ID=1:785567849849:web:1e8a4e3f2e0b9c8d4f5e6a
REACT_APP_FIREBASE_VAPID_KEY=[get from Firebase console]
```

**Important**:
- All env vars MUST have `REACT_APP_` prefix for Create React App
- Firebase is ONLY for FCM (Cloud Messaging), NOT authentication
- Get Supabase keys from: https://app.supabase.com/project/jmzvrqwjmlnvxojculee/settings/api
- Get Firebase VAPID key from: https://console.firebase.google.com/project/armora-protection/settings/cloudmessaging

---

## Development Workflows

### Start Development Server
```bash
npm start
```
Opens browser at `http://localhost:3000` with hot reload enabled.

### Build for Production
```bash
npm run build
```
Creates optimized production build in `build/` directory.

### Run Unit Tests
```bash
npm test
```
Runs Jest tests in watch mode.

### Run E2E Tests
```bash
npm run test:e2e
```
Runs Playwright end-to-end tests.

### Deployment
Deployed to Vercel with automatic deployments on push to `main` branch.

```bash
# Manual deployment via Vercel CLI
vercel --prod
```

---

## Common Development Tasks

### Adding a New Screen
1. Create folder in `src/screens/FeatureName/`
2. Create `FeatureName.tsx` component
3. Add route in `App.tsx`
4. Add navigation link in `BottomNav.tsx` (if needed)

### Adding a New Service Method
1. Open relevant service file in `src/services/`
2. Add method with TypeScript types
3. Handle errors with try/catch
4. Return typed data or throw error

### Creating an Incident Report
```typescript
import { incidentService } from '../services/incidentService';

const report = await incidentService.createIncident({
  assignment_id: assignmentId,
  cpo_id: cpoId,
  incident_type: 'threat',
  severity: 'high',
  description: 'Suspicious individual approached principal',
  actions_taken: 'Escorted principal to secure location',
  location_latitude: 51.5074,
  location_longitude: -0.1278,
});
```

### Accepting an Assignment
```typescript
import { assignmentService } from '../services/assignmentService';

await assignmentService.acceptAssignment(assignmentId, cpoId);
// This updates status from 'pending' → 'assigned'
```

### Updating Assignment Status
```typescript
// CPO arrives at pickup location
await assignmentService.updateAssignmentStatus(assignmentId, 'en_route');

// CPO starts protection detail
await assignmentService.updateAssignmentStatus(assignmentId, 'active');

// Assignment completed
await assignmentService.updateAssignmentStatus(assignmentId, 'completed');
```

### Working with Supabase Locally
```bash
# Start local Supabase (requires Docker)
npx supabase start

# Create migration
npx supabase migration new {migration_name}

# Apply migrations
npx supabase db push

# Generate types
npx supabase gen types typescript --project-id jmzvrqwjmlnvxojculee > src/types/database.types.ts
```

---

## Key Architectural Decisions

### Why Supabase + Firebase?
- **Supabase**: PostgreSQL with RLS provides secure, relational database with real-time subscriptions
- **Firebase FCM**: Industry-standard for mobile push notifications (FCM ONLY, not full Firebase suite)
- **Separation of concerns**: Auth/data (Supabase) vs notifications (Firebase)

### Why Service Layer Pattern?
- **Centralized logic**: All data operations in one place
- **Type safety**: Services enforce TypeScript interfaces
- **Testability**: Easy to mock services in tests
- **Consistency**: Same patterns across all data operations

### Why Feature-Based Structure?
- **Scalability**: Easy to add new features without touching existing code
- **Co-location**: Related components stay together
- **Clear boundaries**: Each feature is self-contained

### Why PWA instead of Native?
- **Single codebase**: iOS + Android from one codebase
- **Instant updates**: No app store approval required
- **Lower cost**: Web development skills sufficient
- **Offline support**: Service workers enable offline functionality

---

## Styling Conventions

### CSS Custom Properties
Design tokens in `/workspaces/armoracpo/src/styles/global.css`:

```css
--armora-primary: #2c5aa0;
--armora-bg-primary: #ffffff;
--armora-text-primary: #1a1a1a;
--armora-space-sm: 8px;
--armora-space-md: 16px;
--armora-space-lg: 24px;
```

### Styling Approach
- **CSS Custom Properties**: Design tokens for consistency
- **Inline Styles**: Used for component-specific styles
- **No CSS Modules**: Keep styles co-located with components
- **Responsive**: Mobile-first with safe area insets for iOS

---

## Troubleshooting

### "User not authenticated" errors
- Check AuthContext is providing user session
- Verify Supabase URL and anon key in env vars
- Check RLS policies on database tables
- Ensure `verification_status = 'verified'` in `protection_officers` table

### Push notifications not working
- Verify `REACT_APP_FIREBASE_VAPID_KEY` is set
- Check browser console for FCM errors
- Ensure notification permission granted in browser
- Verify FCM token is saved to `protection_officers.fcm_token`
- Service worker only registers in production (`NODE_ENV=production`)

### Real-time subscriptions not updating
- Check Supabase real-time is enabled for table
- Verify RLS policies allow reads on table
- Check channel subscription in browser console
- Ensure proper cleanup on component unmount

### Assignment status not updating
- Verify CPO is assigned to assignment (`cpo_id` matches)
- Check RLS policies allow CPO to update assignment
- Ensure status transition is valid (e.g., can't go from 'pending' → 'active')

### Build failures on Vercel
- Check all environment variables are set in Vercel dashboard
- Verify no TypeScript errors: `npm run build` locally
- Check build logs in Vercel for specific errors
- Ensure `NODE_ENV=production` is set

### Service Worker Issues
- Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
- Unregister service worker in DevTools → Application → Service Workers
- Clear cache and hard reload
- Service worker only works in production builds

---

## Testing Strategy

### Unit Tests (Jest + React Testing Library)
- Test components in isolation
- Mock services and contexts
- Focus on user interactions and state changes
- 37 test files currently in codebase

### E2E Tests (Playwright)
- Test full user flows (login → browse jobs → accept assignment)
- Test on real browser environments
- Verify integrations work end-to-end

### Manual Testing Checklist
- [ ] Login with verified CPO account
- [ ] Browse available assignments
- [ ] Accept an assignment
- [ ] Update assignment status (en_route → active → completed)
- [ ] Submit incident report with photo
- [ ] Send/receive messages
- [ ] View earnings history
- [ ] Update profile information

---

## Production Status

**Live URL**: Deployed on Vercel (check Vercel dashboard for current URL)
**Supabase**: Production database at `https://jmzvrqwjmlnvxojculee.supabase.co`
**Firebase**: Production FCM project `armora-protection`

**Current Status**:
- 3 CPOs registered (1 verified, 2 pending verification)
- Sample assignments in database
- Real-time subscriptions active
- Push notifications configured (VAPID key required in Vercel env vars)

---

## Performance Considerations

### Code Splitting
- Route-based code splitting via React Router
- Lazy loading for heavy components
- Dynamic imports for large libraries

### Bundle Size
- Total bundle: ~2MB (production build)
- Main chunk: ~500KB
- Vendor chunk: ~1.5MB (React, Supabase, Firebase)

### API Optimization
- Use Supabase `select()` to fetch only needed fields
- Implement pagination for large lists
- Cache responses where appropriate

---

## Resources

- **Supabase Dashboard**: https://app.supabase.com/project/jmzvrqwjmlnvxojculee
- **Firebase Console**: https://console.firebase.google.com/project/armora-protection
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Documentation**: `/workspaces/armoracpo/docs/`
- **Database Schema**: `/workspaces/armoracpo/docs/SHARED_SCHEMA.md`
- **Environment Setup**: `/workspaces/armoracpo/VERCEL_ENV_VARS.md`

---

## Development Tools

### DevPanel Component
**Location**: `/workspaces/armoracpo/src/components/dev/DevPanel.tsx`

**Features**:
- Bypass authentication (sessionStorage flag)
- Quick navigation during development
- Available on all screens
- Toggle via dev mode flag

**Usage**:
```typescript
// Enable dev mode
sessionStorage.setItem('devMode', 'true');

// Then refresh the page - DevPanel will appear
```

---

## Logging Conventions

**Pattern**: Prefixed console logs for debugging

```typescript
console.log('[Supabase Auth] Initializing authentication...');
console.error('[Notifications] Error getting token:', error);
```

**Prefixes**:
- `[App]` - Application lifecycle
- `[Supabase Auth]` - Authentication
- `[Notifications]` - FCM notifications
- `[Service]` - Service layer

---

## Security Best Practices

**Environment Variables**:
- **Never commit `.env` files**
- All secrets in Vercel dashboard
- Public keys safe to expose (protected by backend rules)
- `.env.example` template provided

**Content Security Policy**:
- Configured in `/workspaces/armoracpo/vercel.json`
- Restricts script sources
- Allows Supabase, Firebase, Vercel domains

**Authentication**:
- Row Level Security (RLS) in Supabase
- Verification status check before login
- Protected routes require valid session

---

## Final Notes for Claude Code

**When making changes**:
1. Always use the service layer (don't bypass with direct Supabase calls)
2. Follow TypeScript types strictly (defined in `src/lib/supabase.ts`)
3. Use correct terminology (CPO, Principal, Assignment)
4. Test authentication flow after auth-related changes
5. Verify RLS policies are respected
6. Check real-time subscriptions are properly cleaned up
7. Ensure proper error handling in all service methods

**This is a security application** - treat user data, location tracking, and incident reports with appropriate care and follow security best practices.

**For new Claude instances**: Start by reading this file, then explore the service layer (`/src/services/`) to understand the API surface, and finally examine a screen component to see how everything connects.
