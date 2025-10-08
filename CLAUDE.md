# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Armora CPO** is a React-based mobile-first web application for Close Protection Officers (CPOs) in the UK security industry. It provides SIA-licensed security professionals with tools to manage assignments, submit incident reports, maintain daily occurrence books (DOB), handle compliance documentation, and communicate with clients.

This is a **security industry application** focused on professional close protection services, NOT a ride-sharing app. The terminology and workflows are specific to UK security standards (SIA licensing, BS 8507 guidelines).

## Key Commands

### Development
- `npm start` - Start development server (localhost:3000)
- `npm test` - Run Jest tests in watch mode
- `npm run build` - Production build
- `npm run test:e2e` - Run Playwright end-to-end tests

### Testing
- Run single test file: `npm test -- ComponentName.test.tsx`
- Run tests with coverage: `npm test -- --coverage`

## Architecture Overview

### Technology Stack
- **Frontend**: React 19.2.0 with TypeScript
- **Routing**: React Router v7.9.3
- **State Management**: Zustand (global state), Context API (AppContext, ProtectionAssignmentContext)
- **Backend**: Supabase (PostgreSQL database, authentication, real-time subscriptions)
- **Authentication**: Supabase Auth (email/password, Google OAuth)
- **Notifications**: Firebase Cloud Messaging (FCM)
- **Animations**: Framer Motion
- **Maps**: React Leaflet
- **Forms**: React Hook Form
- **File Uploads**: React Dropzone with image cropping (react-image-crop)
- **PDF Generation**: jsPDF + jsPDF-AutoTable
- **Charts**: Chart.js + react-chartjs-2
- **Payments**: Stripe (react-stripe-js)
- **Analytics**: Vercel Analytics

### Project Structure

```
src/
├── screens/           # Top-level screen components (Dashboard, Jobs, Profile, etc.)
├── components/        # Reusable components organized by domain
│   ├── ui/           # Generic UI components (Button, Card, Modal, etc.)
│   ├── dashboard/    # Dashboard-specific widgets
│   ├── jobs/         # Job browsing and management
│   ├── incidents/    # Incident reporting components
│   ├── compliance/   # Compliance tracking
│   ├── earnings/     # Payment and earnings displays
│   ├── profile/      # Profile management sections
│   ├── messages/     # In-app messaging
│   ├── animations/   # Framer Motion animation wrappers
│   └── common/       # Shared components (Logo, LoadingScreen, etc.)
├── services/         # API integration and business logic
│   ├── authService.ts         # Authentication operations
│   ├── assignmentService.ts   # Assignment CRUD operations
│   ├── incidentService.ts     # Incident report management
│   ├── dobService.ts          # Daily Occurrence Book
│   ├── messageService.ts      # Messaging functionality
│   └── notificationService.ts # Push notifications
├── contexts/         # React Context providers
│   ├── AppContext.tsx                    # Global app state
│   └── ProtectionAssignmentContext.tsx   # Assignment-specific state
├── lib/              # Third-party service configuration
│   ├── supabase.ts   # Supabase client + helper functions
│   └── firebase.ts   # Firebase FCM configuration
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
│   ├── index.ts      # Main types (User, Assignment, IncidentReport, etc.)
│   └── database.types.ts  # Supabase-generated types
├── utils/            # Utility functions
├── data/             # Static data and configuration
└── styles/           # Global CSS and theme constants
```

### State Management Strategy

**Two-tier state management approach:**

1. **Global State (AppContext)**: User authentication, navigation, device capabilities, notifications
   - Located: `src/contexts/AppContext.tsx`
   - Access via: `useApp()` hook
   - Persisted to localStorage for user/questionnaire data

2. **Domain State (Zustand)**: Feature-specific state (currently minimal usage)
   - Context providers used for complex workflows

3. **Local State**: Component-level useState for UI-only state

### Database Schema (Supabase)

**Key Tables:**
- `protection_officers` - CPO profiles (SIA license, contact info, verification status)
- `protection_assignments` - Job assignments with status tracking
- `incident_reports` - Security incident documentation (P0 priority feature)
- `dob_entries` - Daily Occurrence Book entries (auto + manual)
- `payment_records` - Payment transactions
- `assignment_messages` - In-app messaging between CPOs and clients
- `emergency_activations` - Panic button activations

**Assignment Status Flow:**
```
pending → assigned → en_route → active → completed
                                      ↓
                                  cancelled
```

### Authentication & Authorization

**Authentication Flow:**
1. User logs in via `authService.login(email, password)`
2. Supabase Auth returns user + session
3. System fetches CPO profile from `protection_officers` table
4. Verification status checked (`verified` required to proceed)
5. FCM token registered for push notifications
6. Session persisted via Supabase Auth's built-in session management

**Protected Routes:**
- All routes except `/`, `/welcome`, `/signup` require authentication
- `ProtectedRoute` wrapper in `App.tsx` handles auth checks
- Dev mode bypass available via `sessionStorage.setItem('devMode', 'true')`

**Row Level Security (RLS):**
- Supabase RLS policies enforce data access control
- CPOs can only access their own assignments, incidents, and messages

### Real-Time Features

**Supabase Real-Time Subscriptions:**
- Assignment updates: `subscribeToAssignmentUpdates(assignmentId, callback)`
- Officer location: `subscribeToOfficerLocation(officerId, callback)`
- New messages: Real-time message sync in MessageChat component

**Firebase Cloud Messaging:**
- Push notifications for new assignments, messages, emergencies
- Token management in `notificationService.ts`
- Notification permission requested after successful login

### Key Workflows

#### 1. Job Assignment Flow
```
Browse Jobs → View Details → Accept Assignment →
En Route → Start Assignment → Complete Assignment
```
- **Service**: `assignmentService.ts`
- **Screens**: `Jobs.tsx`, `AvailableJobs.tsx`, `ActiveJob.tsx`
- **Real-time**: Status updates broadcast via Supabase channels

#### 2. Incident Reporting (P0 Priority)
```
New Incident → Classification & Details → Media Upload (GPS-tagged) →
Witness Statements → Signatures → Submit → PDF Export
```
- **Service**: `incidentService.ts`, `incidentPDFService.ts`
- **Components**: `IncidentReportForm.tsx`, `IncidentMediaUpload.tsx`, `IncidentSignaturePad.tsx`
- **Key Features**:
  - GPS-tagged photo/video uploads with chain of custody
  - Digital signatures (CPO, witnesses, principal)
  - Automatic incident number generation (IR-YYYYMMDD-XXXX)
  - PDF export for legal compliance (7-year retention)
  - GDPR consent tracking

#### 3. Daily Occurrence Book (DOB)
```
Auto-logged events (assignment start/end, location changes) +
Manual entries by CPO → GPS-tagged, immutable logs
```
- **Service**: `dobService.ts`
- **Hook**: `useDOBAutoLogging.ts` - Auto-logs key assignment events
- **Screen**: `DailyOccurrenceBook.tsx`
- **Immutability**: Entries become read-only once submitted

#### 4. Messaging
```
Assignment-based messaging between CPO ↔ Client/Coordinator
```
- **Service**: `messageService.ts`
- **Components**: `Messages.tsx` (list), `MessageChat.tsx` (conversation)
- **Features**: Read receipts, typing indicators, quick reply templates

### Important Conventions

#### Terminology
- **CPO/Protection Officer** - NOT "driver" or "provider"
- **Assignment** - NOT "ride" or "trip"
- **Principal** - The person being protected (NOT "passenger" or "customer")
- **Commencement Point** - Pickup location
- **Secure Destination** - Drop-off location
- **SIA License** - UK Security Industry Authority license (required for all CPOs)

#### Status Badge Colors
```typescript
// components/ui/StatusBadge.tsx
pending: gray
assigned: blue
en_route: yellow
active: green
completed: green
cancelled: red
```

#### Date/Time Handling
- All timestamps stored as ISO 8601 strings
- Use `date-fns` for formatting: `format(new Date(timestamp), 'PPp')`
- Server times in UTC, display in user's local timezone

#### Error Handling
- Use `ErrorDisplay` component for user-facing errors
- Service layer throws errors with descriptive messages
- AppContext captures errors in global state
- Network errors show retry UI (see `PullToRefresh` component)

#### File Uploads
- Images/videos uploaded to Supabase Storage
- GPS metadata extracted and stored separately
- Chain of custody logged for incident media
- File size limits enforced client-side before upload

### Environment Variables

Required variables (see `.env.example`):

```bash
# Supabase
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key

# Firebase (for push notifications)
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
REACT_APP_FIREBASE_VAPID_KEY=...  # Required for FCM
```

**IMPORTANT**: Never commit `.env` files. Set production values in Vercel Dashboard only.

### Development Mode Features

**DevPanel Component:**
- Accessible via sessionStorage flag: `sessionStorage.setItem('devMode', 'true')`
- Allows bypassing authentication during development
- Toggle between different user states
- Located in `src/components/dev/DevPanel.tsx` (if exists)

**Mock Data:**
- Mock services in `src/services/mock*.service.ts` for offline development
- Can be toggled via environment variable or feature flag

### Testing Guidelines

**Unit Tests:**
- Component tests in `__tests__` directories alongside components
- Use `@testing-library/react` for component testing
- Test utilities in `src/setupTests.ts`

**E2E Tests:**
- Playwright config in `playwright.config.ts`
- Focus on critical user journeys (login, accept assignment, incident reporting)

### Known Issues & Fixes

**Black Page Issue (Fixed):**
- Issue: DevPanel import paths caused black screen in production
- Solution: Corrected import paths to remove React Router dependency
- Documentation: See git commits b93b632, 031314f

**React Router v7 Migration:**
- Upgraded from v6 to v7.9.3
- Jest config includes module name mapping for compatibility
- Transform ignore patterns configured for ESM modules

### Security Considerations

**Data Classification:**
- Incident reports marked as `confidential` or `restricted`
- 7-year retention policy for security incidents
- GDPR consent required for principal/witness data
- Media files include SHA-256 hashes for integrity verification

**SIA Compliance:**
- CPO verification status checked on login (`verified` required)
- SIA license numbers validated and stored
- License expiry tracking in compliance dashboard

**Emergency Features:**
- Panic button activates emergency services notification
- GPS location captured and transmitted immediately
- Real-time status updates during emergency situations

### Future Development

**Planned Features (based on types):**
- Venue security contracts (wedding/event protection)
- Multi-stage journey planning
- Booking templates and recurring assignments
- Loyalty points and package subscriptions
- Predictive suggestions based on calendar/weather/patterns
- Seven Ps threat assessment framework (partially implemented in types)

### Common Pitfalls

1. **Assignment vs. Job terminology**: Use "assignment" in code, "job" only in UI where appropriate
2. **Status transitions**: Follow the defined status flow, don't skip states
3. **GPS tagging**: Always capture GPS coordinates for incident reports and DOB entries
4. **Immutability**: DOB entries and submitted incident reports cannot be edited
5. **Real-time subscriptions**: Always clean up Supabase channel subscriptions in useEffect cleanup
6. **Date formatting**: Use `date-fns` consistently, avoid native Date methods for display

### Code Quality & Linting

**ESLint & TypeScript Configuration:**
- TypeScript strict mode is **disabled** (`"strict": false` in tsconfig.json)
- ESLint configured via Create React App
- Run `npm start` to see linting warnings in real-time during development
- Run `npm run build` to catch all TypeScript errors before production

**Common Linting Issues & Solutions:**

1. **Unused Imports/Variables**
   - Remove unused imports immediately
   - If a variable is intentionally unused, prefix with underscore: `_unusedVar`
   - Clean up unused state variables and their setters

2. **React Hook Exhaustive-Deps Warnings**
   - Wrap functions used in useEffect in `useCallback` with proper dependencies
   - Add all external dependencies to the dependency array
   - Example pattern:
   ```typescript
   const loadData = useCallback(async () => {
     // logic using props/state
   }, [prop1, state1]); // Include all used props/state

   useEffect(() => {
     loadData();
   }, [loadData]);
   ```

3. **TypeScript Type Errors**
   - Always check type definitions in `src/types/index.ts` before creating new interfaces
   - Use optional properties (`?`) for legacy/deprecated fields
   - Add `as const` for tuple types to fix type inference issues
   - Example: `ease: [0.4, 0, 0.2, 1] as const` for Framer Motion

4. **Mock Data Type Conformance**
   - Ensure mock data matches actual type definitions exactly
   - Use correct enum values (e.g., 'executive_protection' not 'Executive Protection')
   - Match property names exactly (e.g., `message` not `message_text`)

**Pre-Commit Checklist:**
- [ ] No ESLint warnings in console
- [ ] TypeScript compilation succeeds (`npm run build`)
- [ ] All useEffect hooks have proper dependencies
- [ ] No unused imports or variables
- [ ] Mock data conforms to actual types

### Getting Help

For questions about:
- **Supabase**: Check `src/lib/supabase.ts` for helper functions
- **Types**: See `src/types/index.ts` for comprehensive type definitions
- **Services**: Review `src/services/` for business logic patterns
- **UI Components**: Check `src/components/ui/` for reusable components
