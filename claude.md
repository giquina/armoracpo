# 🛡️ Armora CPO Mobile App - Complete Build Instructions

## **CRITICAL CONTEXT: This is NOT a Taxi App**

**Armora CPO** is the operator-side Close Protection Officer application for the Armora Security Transport platform. This is a **SIA-regulated security operations app**, NOT a rideshare or taxi service.

### **Correct Terminology (SIA/Security Industry):**
- ✅ **Assignments** / **Details** (NOT "rides" or "trips")
- ✅ **Principals** (the protected client, NOT "passengers")
- ✅ **CPO** / **Close Protection Officer** (NOT "driver")
- ✅ **Security Operations** (NOT "deliveries" or "transport services")
- ✅ **SIA License** (Security Industry Authority - UK regulatory body)
- ✅ **Threat Assessment** / **Risk Assessment**
- ✅ **Operational Status** (NOT "online/offline")
- ✅ **Deployment** (when accepting an assignment)
- ✅ **Stand Down** (when completing an assignment)
- ✅ **Principal Protection Detail** (the actual security assignment)

---

## 📋 PHASE 1: Armora Client App Analysis (COMPLETED)

### **Client App Tech Stack:**
```
Frontend:
- React 19.1.1 + TypeScript 4.9.5
- CSS Modules for styling
- React Context + useReducer for state management

Backend:
- Firebase (Authentication + Cloud Messaging)
- Supabase (PostgreSQL database)
- Stripe (Payment processing)

Infrastructure:
- Vercel hosting
- PWA with service workers
- Trusted Web Activity (TWA) for Android
- Playwright E2E testing

Design:
- Dark theme: Navy (#1a1a2e) + Gold (#FFD700)
- 8px grid system
- Mobile-first (320px-768px)
- 44px+ touch targets
```

### **Client App Structure:**
```
/armora/
├── /src/
│   ├── /components/      # Reusable UI components
│   ├── /contexts/        # React Context providers
│   ├── /data/           # Static data, constants
│   ├── /hooks/          # Custom React hooks
│   ├── /lib/            # Third-party integrations
│   ├── /services/       # API services, Firebase, Supabase
│   ├── /styles/         # Global CSS, themes
│   ├── /types/          # TypeScript type definitions
│   └── /utils/          # Helper functions
```

### **User Flow (Client App):**
```
Splash Screen
  ↓
Welcome Screen
  ↓
Authentication (Registered/Google/Guest)
  ↓
Security Questionnaire (9 steps)
  ↓
Dashboard
  ↓
Booking Flow
  ↓
Active Protection Detail
```

---

## 🚀 PHASE 2: Armora CPO App Architecture

### **Tech Stack (Match Client App):**
```javascript
{
  "frontend": "React 19.1.1 + TypeScript 4.9.5",
  "stateManagement": "React Context + useReducer",
  "styling": "CSS Modules",
  "backend": {
    "auth": "Firebase Authentication",
    "database": "Supabase (PostgreSQL)",
    "messaging": "Firebase Cloud Messaging",
    "payments": "Stripe Connect (for CPO payouts)"
  },
  "infrastructure": {
    "hosting": "Vercel",
    "pwa": "Service Workers + TWA",
    "testing": "Playwright E2E + Jest unit tests"
  },
  "mobile": {
    "strategy": "PWA + Trusted Web Activity",
    "minWidth": "320px",
    "touchTargets": "44px minimum",
    "gps": "Geolocation API + Background tracking"
  }
}
```

### **CPO App Directory Structure:**
```
/armoracpo/
├── /docs/                        # Documentation
│   ├── armora-integration.md    # Client app integration
│   ├── sia-compliance.md        # UK SIA requirements
│   ├── api-endpoints.md         # API documentation
│   └── deployment.md            # Deployment guide
│
├── /public/                     # PWA assets
│   ├── manifest.json            # CPO app manifest
│   ├── service-worker.js        # Offline functionality
│   ├── /icons/                  # App icons (all sizes)
│   └── /.well-known/           # Android TWA verification
│
├── /src/
│   ├── /components/             # Reusable components
│   │   ├── /common/            # Buttons, Cards, Inputs
│   │   ├── /layout/            # Headers, Navigation, Tabs
│   │   ├── /assignment/        # Assignment cards, maps
│   │   ├── /compliance/        # License, badges, documents
│   │   └── /earnings/          # Payment summaries, invoices
│   │
│   ├── /contexts/              # Global state management
│   │   ├── AuthContext.tsx     # CPO authentication
│   │   ├── AssignmentContext.tsx  # Active assignments
│   │   ├── LocationContext.tsx    # GPS tracking
│   │   └── ComplianceContext.tsx  # SIA license status
│   │
│   ├── /hooks/                 # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useAssignments.ts
│   │   ├── useLocation.ts
│   │   ├── useRealtime.ts
│   │   └── useCompliance.ts
│   │
│   ├── /screens/               # All CPO app screens
│   │   ├── /Auth/
│   │   │   ├── SplashScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── SIAVerificationScreen.tsx
│   │   │
│   │   ├── /Dashboard/
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── HomeTab.tsx
│   │   │   └── QuickActions.tsx
│   │   │
│   │   ├── /Assignments/
│   │   │   ├── AssignmentsScreen.tsx
│   │   │   ├── AvailableTab.tsx
│   │   │   ├── ActiveTab.tsx
│   │   │   ├── HistoryTab.tsx
│   │   │   ├── AssignmentDetails.tsx
│   │   │   └── MapView.tsx
│   │   │
│   │   ├── /Profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── PersonalInfo.tsx
│   │   │   ├── Qualifications.tsx
│   │   │   └── EmergencyContacts.tsx
│   │   │
│   │   ├── /Compliance/
│   │   │   ├── ComplianceScreen.tsx
│   │   │   ├── SIALicense.tsx
│   │   │   ├── DBSCheck.tsx
│   │   │   ├── Insurance.tsx
│   │   │   └── TrainingModules.tsx
│   │   │
│   │   ├── /Earnings/
│   │   │   ├── EarningsScreen.tsx
│   │   │   ├── PaymentHistory.tsx
│   │   │   ├── Invoices.tsx
│   │   │   └── BankDetails.tsx
│   │   │
│   │   ├── /Schedule/
│   │   │   ├── ScheduleScreen.tsx
│   │   │   ├── Calendar.tsx
│   │   │   └── AvailabilitySettings.tsx
│   │   │
│   │   ├── /Messages/
│   │   │   ├── MessagesScreen.tsx
│   │   │   ├── ConversationList.tsx
│   │   │   └── ChatThread.tsx
│   │   │
│   │   ├── /Navigation/
│   │   │   ├── NavigationScreen.tsx
│   │   │   ├── RouteMap.tsx
│   │   │   └── TurnByTurn.tsx
│   │   │
│   │   └── /Settings/
│   │       ├── SettingsScreen.tsx
│   │       ├── Preferences.tsx
│   │       ├── Notifications.tsx
│   │       └── Privacy.tsx
│   │
│   ├── /services/              # API & integrations
│   │   ├── /api/
│   │   │   ├── assignments.ts
│   │   │   ├── cpo.ts
│   │   │   ├── compliance.ts
│   │   │   ├── earnings.ts
│   │   │   └── location.ts
│   │   ├── /firebase/
│   │   │   ├── auth.ts
│   │   │   └── messaging.ts
│   │   ├── /supabase/
│   │   │   ├── client.ts
│   │   │   ├── realtime.ts
│   │   │   └── storage.ts
│   │   └── /stripe/
│   │       └── connect.ts
│   │
│   ├── /types/                 # TypeScript definitions
│   │   ├── assignment.ts
│   │   ├── cpo.ts
│   │   ├── principal.ts
│   │   ├── compliance.ts
│   │   └── earnings.ts
│   │
│   ├── /utils/                 # Helpers
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── security.ts
│   │   └── constants.ts
│   │
│   ├── /styles/                # Global styles
│   │   ├── global.css
│   │   ├── theme.css
│   │   └── variables.css
│   │
│   ├── App.tsx                 # Main app component
│   ├── App.css
│   ├── index.tsx              # Entry point
│   └── index.css
│
├── /tests/                     # Testing
│   ├── /e2e/                  # Playwright E2E
│   └── /unit/                 # Jest unit tests
│
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md
```

---

## 📱 PHASE 3: Core CPO Screens (Build Order)

### **1. Authentication Flow**

#### **SplashScreen.tsx**
```typescript
// Display: Armora CPO branding, security badge icon
// Duration: 2 seconds
// Transitions to: LoginScreen or DashboardScreen (if authenticated)
```

#### **LoginScreen.tsx**
```typescript
// Features:
// - Email/Password login
// - Biometric authentication option (fingerprint/Face ID)
// - "Register as CPO" button
// - Forgot password link
// - Firebase Auth integration
```

#### **RegisterScreen.tsx** (Multi-step wizard)
```typescript
// Step 1: Personal Information
// - Full name, email, phone
// - Date of birth
// - Home address

// Step 2: SIA License Verification
// - SIA badge number
// - License type (CP, CCTV, Door Supervision, etc.)
// - Expiry date
// - Upload SIA badge photo (front/back)

// Step 3: Qualifications
// - Close protection training provider
// - Completion date
// - Certificates upload

// Step 4: DBS Check
// - DBS number
// - Issue date
// - Certificate upload

// Step 5: Professional Photo
// - Upload professional headshot
// - Guidelines: Plain background, professional attire

// Step 6: Emergency Contacts
// - Next of kin
// - Emergency contact number
// - Medical conditions (optional)

// Step 7: Bank Details (encrypted)
// - Account name
// - Sort code
// - Account number
// - For Stripe Connect payouts
```

---

### **2. Dashboard (Home Screen)**

#### **DashboardScreen.tsx**
```typescript
// Layout:
// ┌─────────────────────────────┐
// │  [Profile Pic]  CPO Name    │
// │  SIA: Valid ✓               │
// ├─────────────────────────────┤
// │  🟢 Operational Status      │
// │  [ READY ] [ STAND DOWN ]   │
// ├─────────────────────────────┤
// │  Active Assignment:         │
// │  ┌───────────────────────┐  │
// │  │ Principal: [Name]     │  │
// │  │ Location: [Address]   │  │
// │  │ Status: En Route      │  │
// │  │ [NAVIGATE] [CONTACT]  │  │
// │  └───────────────────────┘  │
// ├─────────────────────────────┤
// │  Today's Schedule:          │
// │  • 14:00 - Airport Transfer │
// │  • 18:00 - Event Security   │
// ├─────────────────────────────┤
// │  Quick Stats:               │
// │  Today: £450 | Week: £2,340 │
// │  Assignments: 3 completed   │
// ├─────────────────────────────┤
// │  🔔 Notifications (2)       │
// │  • SIA renewal in 30 days   │
// │  • Training module due      │
// └─────────────────────────────┘
//
// Bottom Navigation:
// [Home] [Assignments] [Schedule] [Profile]
```

---

### **3. Assignments Management**

#### **AssignmentsScreen.tsx** (3 Tabs)

**Tab 1: Available Assignments**
```typescript
// Features:
// - Real-time list of available details
// - Filters: Distance, Pay rate, Duration, Assignment type
// - Sort: Nearest first, Highest pay, Soonest start time
// - Map view toggle

// Assignment Card:
// ┌─────────────────────────────┐
// │ 🕐 Today 14:00 - 18:00      │
// │ 📍 2.3 miles away           │
// │ 💰 £180 (£45/hour)          │
// │ ─────────────────────────   │
// │ Type: Executive Transport   │
// │ Principal: [Protected]      │
// │ From: Mayfair Hotel         │
// │ To: Heathrow T5             │
// │ Duration: 4 hours           │
// │ Risk Level: Low ⚠️          │
// │ ─────────────────────────   │
// │ [ACCEPT] [VIEW DETAILS]     │
// │ Auto-decline in: 28s        │
// └─────────────────────────────┘

// Actions:
// - Tap card → Full details (route, requirements, risk assessment)
// - ACCEPT → Confirm deployment dialog
// - Auto-decline after 30 seconds
// - Push notification for new assignments
```

**Tab 2: Active Assignments**
```typescript
// Current assignment details:
// ┌─────────────────────────────┐
// │ 🟢 ACTIVE DETAIL            │
// │ ─────────────────────────   │
// │ Principal: Mr. J. Smith     │
// │ Reference: ARM-20250164     │
// │ ─────────────────────────   │
// │ Status: En Route to Pickup  │
// │ ETA: 12 minutes             │
// │ ─────────────────────────   │
// │ Pickup: 45 Park Lane, W1K   │
// │ Destination: LHR Terminal 5 │
// │ Flight: BA 283 (18:45)      │
// │ ─────────────────────────   │
// │ [NAVIGATE] [CONTACT]        │
// │ [INCIDENT REPORT] [SOS]     │
// ├─────────────────────────────┤
// │ Timeline:                   │
// │ ✓ Accepted 13:15            │
// │ ✓ Departed Base 13:20       │
// │ ○ Arrived Pickup 13:45      │
// │ ○ Principal Secure          │
// │ ○ Departed Pickup           │
// │ ○ Arrived Destination       │
// │ ○ Stand Down                │
// └─────────────────────────────┘

// Features:
// - Real-time status updates
// - GPS navigation integration
// - Secure messaging with principal/dispatch
// - Incident reporting (photos, voice notes)
// - Emergency SOS button (always visible)
// - Time tracking (auto-start/stop)
// - Check-in/Check-out with geofencing
```

**Tab 3: Assignment History**
```typescript
// Completed assignments list:
// ┌─────────────────────────────┐
// │ 📅 Yesterday - 28 Sep 2025  │
// │ ┌───────────────────────┐   │
// │ │ 14:00-18:00 (4h)      │   │
// │ │ Executive Transport   │   │
// │ │ £180.00               │   │
// │ │ ⭐⭐⭐⭐⭐ 5.0         │   │
// │ └───────────────────────┘   │
// │ ┌───────────────────────┐   │
// │ │ 20:00-23:00 (3h)      │   │
// │ │ Event Security        │   │
// │ │ £135.00               │   │
// │ │ ⭐⭐⭐⭐⭐ 5.0         │   │
// │ └───────────────────────┘   │
// ├─────────────────────────────┤
// │ 📅 27 Sep 2025              │
// │ (assignments...)            │
// └─────────────────────────────┘

// Features:
// - Filter by date range, type, earnings
// - Export to PDF/CSV
// - Tap to view full details
// - Principal ratings/feedback
// - Earnings breakdown per assignment
```

---

### **4. CPO Profile**

#### **ProfileScreen.tsx**
```typescript
// Sections:

// 1. Professional Photo & Bio
// - Photo upload (replace)
// - Name, SIA license number
// - Years of experience
// - Bio (150 words max)

// 2. SIA License & Compliance
// - License status: ✅ Valid / ⚠️ Expiring / ❌ Expired
// - Badge number
// - Expiry date
// - License types held
// - Renewal reminders

// 3. Qualifications & Certifications
// - Close Protection Level 3
// - First Aid certification
// - Advanced Driving (if applicable)
// - Firearms training (if applicable)
// - Hostile Environment training
// - Counter-surveillance
// - Upload certificates

// 4. Skills Matrix
// - Languages spoken (Principal communication)
// - Medical training level
// - Technical security skills
// - Specialist skills (VIP protocol, etc.)

// 5. Professional Details
// - Insurance details
// - DBS check status
// - Right to work (UK)
// - Company affiliation (if applicable)

// 6. Availability Calendar
// - Set weekly availability
// - Block out dates (holidays, other commitments)
// - Preferred assignment types
// - Preferred coverage areas (postal codes)

// 7. Emergency Contacts
// - Next of kin
// - Emergency number
// - Medical information

// 8. Payment Information
// - Stripe Connect account
// - Bank details (encrypted)
// - Invoicing preferences
// - Tax information
```

---

### **5. Earnings & Payments**

#### **EarningsScreen.tsx**
```typescript
// Overview Dashboard:
// ┌─────────────────────────────┐
// │  Today: £450.00             │
// │  This Week: £2,340.00       │
// │  This Month: £9,750.00      │
// │  [VIEW: Daily▼]             │
// ├─────────────────────────────┤
// │  Chart: Earnings Trend      │
// │  [Bar chart: last 7 days]   │
// ├─────────────────────────────┤
// │  Payment Status:            │
// │  🟢 Next payout: £2,340     │
// │  Date: Friday 29 Sep        │
// │  Account: ****4532          │
// ├─────────────────────────────┤
// │  Recent Assignments:        │
// │  28 Sep - £180 (Paid)       │
// │  28 Sep - £135 (Paid)       │
// │  27 Sep - £225 (Pending)    │
// └─────────────────────────────┘

// Features:
// - Daily/Weekly/Monthly/Yearly views
// - Earnings breakdown by assignment type
// - Payment history (all transactions)
// - Generate invoices (PDF)
// - Tax summary (for self-assessment)
// - Instant pay option (fee applies)
// - Export to CSV for accounting

// Payment Methods:
// - Weekly auto-payout (Stripe Connect)
// - Instant pay (available after assignment completion)
// - Bank transfer details
// - Payment preferences
```

---

### **6. Compliance Center**

#### **ComplianceScreen.tsx**
```typescript
// Compliance Dashboard:
// ┌─────────────────────────────┐
// │ ✅ Compliance Score: 98%    │
// │ Status: FULLY OPERATIONAL   │
// ├─────────────────────────────┤
// │ SIA License                 │
// │ ✅ Valid until: 12 Mar 2026 │
// │ [RENEW] [VIEW BADGE]        │
// ├─────────────────────────────┤
// │ DBS Check                   │
// │ ✅ Valid until: 05 Jan 2026 │
// │ [UPLOAD NEW]                │
// ├─────────────────────────────┤
// │ Professional Indemnity      │
// │ ✅ Valid until: 01 Apr 2026 │
// │ Coverage: £5,000,000        │
// │ [VIEW POLICY]               │
// ├─────────────────────────────┤
// │ Public Liability Insurance  │
// │ ✅ Valid until: 01 Apr 2026 │
// │ [VIEW POLICY]               │
// ├─────────────────────────────┤
// │ First Aid Certification     │
// │ ⚠️ Expires in 45 days       │
// │ [BOOK RENEWAL COURSE]       │
// ├─────────────────────────────┤
// │ Required Training Modules:  │
// │ ✅ Data Protection (GDPR)   │
// │ ✅ Equality & Diversity     │
// │ ⚠️ Counter-Terrorism (due)  │
// │ [START MODULE]              │
// └─────────────────────────────┘

// Features:
// - Real-time compliance status
// - Automated expiry reminders (90/60/30/7 days)
// - Document upload (encrypted storage)
// - Training module integration
// - Compliance score (affects assignment offers)
// - Renewal tracking
// - Regulatory updates (SIA rule changes)
```

---

### **7. Communication Hub**

#### **MessagesScreen.tsx**
```typescript
// Conversation List:
// ┌─────────────────────────────┐
// │ 🔍 Search conversations     │
// ├─────────────────────────────┤
// │ 📌 DISPATCH                 │
// │ New assignment available    │
// │ Just now                    │
// ├─────────────────────────────┤
// │ Assignment #ARM-20250164    │
// │ Principal has confirmed     │
// │ 15 minutes ago              │
// ├─────────────────────────────┤
// │ Assignment #ARM-20250163    │
// │ Thank you for excellent... │
// │ Yesterday                   │
// └─────────────────────────────┘

// Chat Thread:
// ┌─────────────────────────────┐
// │ ← Assignment #ARM-20250164  │
// │ Principal: Mr. Smith        │
// ├─────────────────────────────┤
// │ [Messages with timestamps]  │
// │ Principal: ETA?             │
// │ 13:35                       │
// │                             │
// │ CPO: 8 minutes away         │
// │ 13:36 ✓✓                    │
// ├─────────────────────────────┤
// │ [Message input]             │
// │ 🎤 📎 📸                    │
// └─────────────────────────────┘

// Features:
// - Assignment-specific threads
// - Dispatch communication
// - Principal messaging (secure, assignment-only)
// - Voice notes
// - Photo sharing (incident reports)
// - Read receipts
// - Push notifications
// - Message encryption
// - Auto-archive after assignment completion
```

---

### **8. Settings & Preferences**

#### **SettingsScreen.tsx**
```typescript
// Settings Menu:
// ┌─────────────────────────────┐
// │ ACCOUNT                     │
// │ • Profile Information       │
// │ • Change Password           │
// │ • Email Preferences         │
// ├─────────────────────────────┤
// │ OPERATIONAL                 │
// │ • Availability Schedule     │
// │ • Assignment Preferences    │
// │ • Coverage Areas            │
// │ • Minimum Pay Rate          │
// ├─────────────────────────────┤
// │ NOTIFICATIONS               │
// │ • Assignment Alerts         │
// │ • Compliance Reminders      │
// │ • Payment Notifications     │
// │ • Message Alerts            │
// ├─────────────────────────────┤
// │ APP PREFERENCES             │
// │ • Dark Mode / Light Mode    │
// │ • Language                  │
// │ • Map Provider              │
// │ • Distance Units (mi/km)    │
// ├─────────────────────────────┤
// │ PRIVACY & SECURITY          │
// │ • Biometric Lock            │
// │ • Data Privacy              │
// │ • Location Permissions      │
// │ • Clear Cache               │
// ├─────────────────────────────┤
// │ SUPPORT                     │
// │ • Help Center               │
// │ • Contact Support           │
// │ • Report Issue              │
// │ • Terms & Conditions        │
// │ • Privacy Policy            │
// ├─────────────────────────────┤
// │ ABOUT                       │
// │ • App Version               │
// │ • Open Source Licenses      │
// └─────────────────────────────┘
```

---

## ⚡ PHASE 4: Critical Mobile Features

### **1. Real-time Assignment Dispatch**
```typescript
// Implementation:
// - Firebase Cloud Messaging for push notifications
// - Supabase Realtime for instant assignment updates
// - WebSocket connection (fallback)
// - Auto-decline timer (30 seconds)
// - Sound + vibration alerts
// - Background notifications (app closed)

// Flow:
// 1. New assignment available
// 2. Push notification sent
// 3. CPO opens app
// 4. Assignment card displayed with 30s timer
// 5. Accept → Confirm deployment
// 6. Decline → Assignment returns to pool
// 7. Timeout → Auto-decline
```

### **2. GPS & Navigation**
```typescript
// Features:
// - Geolocation API for real-time tracking
// - Background location updates (with permission)
// - Turn-by-turn navigation (Google Maps / Apple Maps)
// - Geofencing: Auto check-in when arriving at location
// - Route optimization
// - Traffic updates
// - ETA calculation
// - Location sharing with dispatch (optional)

// Implementation:
// - navigator.geolocation.watchPosition()
// - Background location tracking (service worker)
// - Leaflet for map display (match client app)
// - Integration with native maps for navigation
```

### **3. Offline Capability**
```typescript
// Service Worker Strategy:
// - Cache assignment details locally
// - Offline incident reports (sync when online)
// - Compliance documents cached
// - Profile information cached
// - Queue actions (check-in, messages) for sync

// Features:
// - Work offline for active assignments
// - View profile and compliance documents
// - Draft incident reports
// - Auto-sync when connection restored
// - Offline indicator in UI
```

### **4. Security Features**
```typescript
// Panic/SOS Button:
// - Always visible (floating action button)
// - One-tap emergency alert
// - Sends location to dispatch
// - Auto-call emergency services (opt-in)
// - Trigger silent alarm (duress code)

// Duress Code:
// - Alternative PIN that triggers silent alert
// - Appears to log in normally
// - Sends covert SOS to dispatch

// Incident Reporting:
// - Quick report with photo/video
// - Voice recording option
// - Location auto-tagged
// - Time-stamped
// - Encrypted storage
// - Chain of custody maintained
```

### **5. Performance Optimization**
```typescript
// Mobile Performance:
// - Lazy load all screens (React.lazy + Suspense)
// - Image compression (WebP format)
// - Minimize re-renders (React.memo, useMemo, useCallback)
// - Virtual scrolling for long lists
// - Debounce search inputs
// - Prefetch likely next screens
// - 60fps animations (CSS transforms, requestAnimationFrame)

// Battery Optimization:
// - Throttle GPS updates (every 30s when en route)
// - Reduce network polling frequency
// - Batch API requests
// - Lazy load images
// - Dark mode for OLED screens
```

---

## 🔧 PHASE 5: Shared Integration with Client App

### **Supabase Database Schema (Shared Tables):**

```sql
-- Users table (shared between client and CPO apps)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL, -- 'principal' or 'cpo'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CPO Profiles
CREATE TABLE cpo_profiles (
  id UUID PRIMARY KEY REFERENCES users(id),
  full_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  sia_license_number TEXT UNIQUE NOT NULL,
  sia_expiry_date DATE NOT NULL,
  sia_license_type TEXT, -- 'CP', 'CCTV', 'Door Supervision'
  dbs_number TEXT,
  dbs_issue_date DATE,
  photo_url TEXT,
  bio TEXT,
  years_experience INTEGER,
  compliance_score INTEGER DEFAULT 100,
  operational_status TEXT DEFAULT 'stand_down', -- 'ready', 'stand_down', 'on_assignment'
  stripe_connect_account_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments (shared - links principals and CPOs)
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference TEXT UNIQUE NOT NULL, -- 'ARM-20250164'
  principal_id UUID REFERENCES users(id),
  cpo_id UUID REFERENCES cpo_profiles(id),

  assignment_type TEXT NOT NULL, -- 'executive_transport', 'event_security', etc.
  risk_level TEXT DEFAULT 'low', -- 'low', 'medium', 'high'

  pickup_address TEXT NOT NULL,
  pickup_lat DECIMAL,
  pickup_lng DECIMAL,
  destination_address TEXT,
  destination_lat DECIMAL,
  destination_lng DECIMAL,

  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,

  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'en_route', 'active', 'completed', 'cancelled'

  base_rate DECIMAL NOT NULL, -- £/hour
  total_hours DECIMAL,
  total_amount DECIMAL,

  special_instructions TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignment Timeline (status updates)
CREATE TABLE assignment_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id),
  status TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  location_lat DECIMAL,
  location_lng DECIMAL,
  notes TEXT
);

-- CPO Qualifications
CREATE TABLE cpo_qualifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cpo_id UUID REFERENCES cpo_profiles(id),
  qualification_type TEXT NOT NULL, -- 'first_aid', 'advanced_driving', 'firearms', etc.
  provider TEXT,
  issue_date DATE,
  expiry_date DATE,
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Documents
CREATE TABLE compliance_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cpo_id UUID REFERENCES cpo_profiles(id),
  document_type TEXT NOT NULL, -- 'sia_license', 'dbs', 'insurance', etc.
  document_url TEXT NOT NULL,
  expiry_date DATE,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Earnings
CREATE TABLE earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cpo_id UUID REFERENCES cpo_profiles(id),
  assignment_id UUID REFERENCES assignments(id),
  amount DECIMAL NOT NULL,
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  payout_date TIMESTAMPTZ,
  stripe_transfer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages (assignment-specific)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id),
  sender_id UUID REFERENCES users(id),
  message_text TEXT,
  message_type TEXT DEFAULT 'text', -- 'text', 'voice', 'image'
  attachment_url TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incident Reports
CREATE TABLE incident_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id),
  cpo_id UUID REFERENCES cpo_profiles(id),
  incident_type TEXT NOT NULL, -- 'security_breach', 'medical', 'vehicle', etc.
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  description TEXT NOT NULL,
  location_lat DECIMAL,
  location_lng DECIMAL,
  photos JSON, -- array of URLs
  voice_notes JSON,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'open', -- 'open', 'investigating', 'resolved'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews (both ways: principal reviews CPO, CPO reviews principal)
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id),
  reviewer_id UUID REFERENCES users(id),
  reviewee_id UUID REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **API Endpoints (CPO-specific):**

```typescript
// Base URL: /api/cpo

// Authentication
POST   /api/cpo/auth/register        // CPO registration
POST   /api/cpo/auth/login           // CPO login
POST   /api/cpo/auth/verify-sia      // Verify SIA license

// Profile
GET    /api/cpo/profile              // Get CPO profile
PUT    /api/cpo/profile              // Update profile
POST   /api/cpo/profile/photo        // Upload photo
GET    /api/cpo/profile/compliance   // Get compliance status

// Operational Status
PUT    /api/cpo/status               // Update operational status (ready/stand_down)

// Assignments
GET    /api/cpo/assignments/available     // Get available assignments
POST   /api/cpo/assignments/:id/accept    // Accept assignment
POST   /api/cpo/assignments/:id/decline   // Decline assignment
GET    /api/cpo/assignments/active        // Get active assignment
GET    /api/cpo/assignments/history       // Get completed assignments
PUT    /api/cpo/assignments/:id/status    // Update assignment status
POST   /api/cpo/assignments/:id/timeline  // Add timeline event

// Location
POST   /api/cpo/location/update      // Update GPS location

// Earnings
GET    /api/cpo/earnings              // Get earnings summary
GET    /api/cpo/earnings/history      // Get payment history
POST   /api/cpo/earnings/instant-pay  // Request instant payout
GET    /api/cpo/invoices/:id          // Get invoice PDF

// Compliance
GET    /api/cpo/compliance            // Get all compliance docs
POST   /api/cpo/compliance/upload     // Upload document
GET    /api/cpo/compliance/reminders  // Get expiry reminders

// Qualifications
GET    /api/cpo/qualifications        // Get all qualifications
POST   /api/cpo/qualifications        // Add qualification
PUT    /api/cpo/qualifications/:id    // Update qualification

// Messages
GET    /api/cpo/messages              // Get all conversations
GET    /api/cpo/messages/:assignment_id  // Get messages for assignment
POST   /api/cpo/messages              // Send message
PUT    /api/cpo/messages/:id/read     // Mark as read

// Emergency
POST   /api/cpo/emergency/sos         // Trigger SOS alert
POST   /api/cpo/incidents             // Create incident report
GET    /api/cpo/incidents/:id         // Get incident details

// Schedule
GET    /api/cpo/schedule              // Get schedule/availability
PUT    /api/cpo/availability          // Update availability
```

---

## 📝 PHASE 6: Documentation (Auto-generate)

Create these documentation files:

1. **README.md** - Complete CPO app overview
2. **SETUP.md** - Development environment setup
3. **API.md** - All endpoints and responses
4. **SCREENS.md** - Screen flow documentation
5. **DEPLOYMENT.md** - PWA and app store preparation
6. **SIA-COMPLIANCE.md** - UK SIA regulatory requirements
7. **SECURITY.md** - Security protocols and encryption

---

## 🚢 PHASE 7: Deployment Configuration

### **manifest.json (PWA):**
```json
{
  "name": "Armora CPO",
  "short_name": "Armora CPO",
  "description": "Close Protection Officer Operations App",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#FFD700",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### **vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "devCommand": "npm start",
  "routes": [
    {
      "src": "/service-worker.js",
      "headers": {
        "Cache-Control": "public, max-age=0, must-revalidate"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

---

## 🎯 PHASE 8: Testing Data

Create mock data for development:

```typescript
// 10 sample CPO profiles
// 20 available assignments (various types, times, locations)
// 5 active assignments (in different statuses)
// Payment history (last 3 months)
// Compliance documents (all types)
// Message threads (principal/dispatch)
```

---

## ⚠️ CRITICAL REQUIREMENTS CHECKLIST

### **Mobile-First:**
- [x] Start at 320px width
- [x] Scale up to 768px (tablet)
- [x] Desktop support (1024px+)

### **Touch-Friendly:**
- [x] All buttons minimum 44px height
- [x] Touch targets 8px apart
- [x] Swipe gestures for navigation

### **Real-time:**
- [x] WebSocket for assignments
- [x] Push notifications
- [x] Live location updates
- [x] Instant messaging

### **Security:**
- [x] All data encrypted (AES-256)
- [x] PCI DSS compliant payments
- [x] Secure document storage
- [x] Biometric authentication
- [x] SOS/panic button

### **Performance:**
- [x] < 3s load time (3G)
- [x] 60fps animations
- [x] Lazy loading
- [x] Image optimization
- [x] Battery efficient

### **Accessibility:**
- [x] WCAG 2.1 AA compliant
- [x] Screen reader support
- [x] Keyboard navigation
- [x] High contrast mode

### **Compliance:**
- [x] SIA license verification
- [x] DBS check tracking
- [x] Insurance validation
- [x] GDPR compliant
- [x] Data retention policies

---

## 🏃 EXECUTION INSTRUCTIONS

1. **Start development server:**
   ```bash
   npm install
   npm start
   ```

2. **Build order:**
   - Authentication flow first
   - Dashboard second
   - Assignments third
   - All other screens
   - Integration features
   - Testing & optimization

3. **Commit strategy:**
   ```bash
   git commit -m "🛡️ CPO: Authentication flow complete"
   git commit -m "📱 CPO: Dashboard with real-time status"
   git commit -m "🚨 CPO: SOS emergency features implemented"
   ```

4. **Testing priorities:**
   - Mobile responsiveness (320px-768px)
   - Touch interactions
   - Offline mode
   - GPS accuracy
   - Push notifications
   - Payment flow security

---

## 📊 SUCCESS METRICS

- ✅ All 8 screen categories functional
- ✅ Compatible with Armora client app
- ✅ Works at 320px width
- ✅ Real-time assignment updates < 1s
- ✅ Full assignment lifecycle (accept → complete)
- ✅ SIA compliance tracking operational
- ✅ Payment integration working
- ✅ GPS navigation accurate
- ✅ Offline capability functional
- ✅ < 3s page load on 3G

---

## 🚀 READY TO BUILD

**Remember:** This is a professional Close Protection Officer operations app for SIA-licensed security professionals. Use correct security industry terminology, prioritize compliance and safety features, and maintain the highest standards of data security.

Begin implementation following the structure and requirements above. Start with authentication, then dashboard, then assignments. Test continuously on mobile devices (320px width minimum).

**Let's build the professional security operations platform that CPOs deserve! 🛡️**
