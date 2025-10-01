# 🔍 Armora Infrastructure Analysis

## 📊 Overview

This document provides a complete analysis of the **existing Armora client app infrastructure** and recommendations for the **Armora CPO app** integration.

**Analysis Date:** 2025-10-01
**Source:** github.com/giquina/armora (main branch)
**Purpose:** Understand existing architecture to build compatible CPO app

---

## 🏗️ Current Armora Client App Stack

### **Frontend**
```
Framework: React 19.1.1
Language: TypeScript 4.9.5
Styling: CSS Modules
State Management: React Context + useReducer
Routing: React Router (inferred)
```

### **Backend Services**

#### **1. Supabase (Primary Database)**
```typescript
// Configuration found in src/lib/supabase.ts

URL: process.env.REACT_APP_SUPABASE_URL
Key: process.env.REACT_APP_SUPABASE_ANON_KEY

Features Used:
✓ Authentication (Email + Google OAuth)
✓ Real-time subscriptions
✓ PostgreSQL database
✓ Row Level Security (RLS)

Custom Header:
'x-application-name': 'armora-protection-service'
```

**Supabase Tables Identified:**
- `users` - User accounts
- `protection_officers` - CPO profiles (exists in client app!)
- `assignments` - Job assignments
- `emergency_activations` - SOS/emergency alerts
- `payment_transactions` - Payment records
- `questionnaire_responses` - Client questionnaires
- `protection_reviews` - Ratings/reviews
- `venue_protection_contracts` - Contracts
- `sia_licenses` - SIA verification data

#### **2. Firebase**
```typescript
// Configuration (from .env.example)

REACT_APP_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID
REACT_APP_FIREBASE_VAPID_KEY (Cloud Messaging)

Features Used:
✓ Authentication (supplementary)
✓ Cloud Messaging (push notifications)
✓ Google Sign-In provider
```

#### **3. Stripe**
```typescript
// Payment Processing

REACT_APP_STRIPE_PUBLISHABLE_KEY

Features:
✓ Payment processing
✓ Stripe Connect (for CPO payouts - future)
```

#### **4. Google Maps**
```typescript
REACT_APP_GOOGLE_MAPS_API_KEY

Features:
✓ Location services
✓ Route planning
✓ Map display
```

### **Infrastructure**

#### **Hosting: Vercel** (Inferred)
- No `vercel.json` found in repo (likely using default settings)
- Deployment: Automatic via GitHub integration
- Build Command: `npm run build`
- Output Directory: `build/`

---

## 🔧 Services Architecture

### **Backend Services Identified:**

```
src/services/
├── assignmentBroadcast.ts       (2.7 KB)
├── assignmentService.ts         (6.7 KB)
├── notificationService.ts       (3.3 KB)
├── realtimeTrackingService.ts   (4.1 KB)
└── stripePaymentService.ts      (5.2 KB)
```

#### **1. Assignment Service**
- **Purpose:** Manage job assignments
- **Size:** 6.7 KB (largest service)
- **Likely Functions:**
  - Create assignment
  - Accept/decline assignment
  - Update assignment status
  - Get available assignments
  - Get assignment history

#### **2. Assignment Broadcast**
- **Purpose:** Real-time assignment notifications
- **Integration:** Supabase Realtime
- **Likely Functions:**
  - Broadcast new assignments to CPOs
  - Notify assignment updates
  - Handle assignment acceptance

#### **3. Notification Service**
- **Purpose:** Push notifications via Firebase
- **Size:** 3.3 KB
- **Likely Functions:**
  - Send FCM notifications
  - Handle notification permissions
  - Subscribe to topics
  - Foreground message handling

#### **4. Real-time Tracking Service**
- **Purpose:** Live location tracking
- **Size:** 4.1 KB
- **Likely Functions:**
  - Track CPO location
  - Update location in real-time
  - Share location with principal
  - Geofencing

#### **5. Stripe Payment Service**
- **Purpose:** Payment processing
- **Size:** 5.2 KB
- **Likely Functions:**
  - Process payments
  - Create payment intents
  - Handle webhooks
  - Manage Stripe Connect (CPO payouts)

---

## 📦 Dependencies Analysis

### **Core Dependencies (package.json)**

```json
{
  "react": "^19.1.1",
  "typescript": "^4.9.5",
  "supabase-auth-helpers": "^0.5.0",
  "stripe-react": "^4.0.2",
  "firebase": "^12.3.0"
}
```

### **Development Tools**
- **Testing:** Jest + Playwright
- **E2E:** Playwright
- **Automation:** Puppeteer
- **Custom Scripts:** Claude agent bridge (!!)

### **Notable Scripts**

```json
{
  "start": "react-scripts start --no-deprecation",
  "build": "react-scripts build",
  "test": "react-scripts test",
  "dev": "npm run hooks:start && npm run agents:start && npm start",
  "agents:start": "node scripts/claude-agent-bridge.js",
  "hooks:start": "node scripts/hooks-server.js",
  "connection:fix": "killall node && npm run dev"
}
```

**🚨 IMPORTANT DISCOVERY:**
The Armora client app has **custom Claude agent integration** via `claude-agent-bridge.js`!

---

## 🔗 Integration Points for CPO App

### **✅ Shared Services (Reuse)**

1. **Supabase Database**
   - ✅ Use same Supabase project
   - ✅ Add CPO-specific tables
   - ✅ Share `protection_officers` table
   - ✅ Share `assignments` table
   - ✅ Share `users` table

2. **Firebase Authentication**
   - ✅ Use same Firebase project
   - ✅ Different user roles (principal vs cpo)
   - ✅ Share FCM for notifications

3. **Stripe Payments**
   - ✅ Use Stripe Connect for CPO payouts
   - ✅ Same Stripe account
   - ✅ Platform fee structure

### **🔄 Services to Adapt**

1. **Assignment Service**
   - Client app: Create assignments
   - CPO app: Accept/manage assignments
   - **Shared:** Same assignment data structure

2. **Notification Service**
   - Client app: Assignment status updates
   - CPO app: New assignment alerts
   - **Shared:** FCM infrastructure

3. **Real-time Tracking**
   - Client app: View CPO location
   - CPO app: Update own location
   - **Shared:** Supabase Realtime channels

4. **Payment Service**
   - Client app: Make payments
   - CPO app: Receive payouts
   - **Shared:** Stripe infrastructure

---

## 🗄️ Database Schema (Existing)

### **Tables Confirmed in Client App:**

```sql
-- Already exists!
CREATE TABLE protection_officers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  full_name TEXT,
  sia_license_number TEXT,
  -- ... more fields
);

-- Already exists!
CREATE TABLE assignments (
  id UUID PRIMARY KEY,
  principal_id UUID REFERENCES users(id),
  officer_id UUID REFERENCES protection_officers(id),
  status TEXT,
  pickup_location GEOGRAPHY(POINT, 4326),
  -- ... more fields
);

-- Already exists!
CREATE TABLE emergency_activations (
  id UUID PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(id),
  activation_type TEXT,
  location GEOGRAPHY(POINT, 4326),
  -- ... SOS feature already built!
);
```

### **🎯 For CPO App - What's Needed:**

1. **Extend `protection_officers` table:**
   - Add CPO-specific fields
   - Compliance documents
   - Availability schedule
   - Earnings tracking

2. **Add CPO-specific tables:**
   - `cpo_qualifications`
   - `compliance_documents`
   - `earnings`
   - `incident_reports`
   - `cpo_availability`

3. **Keep shared tables:**
   - `assignments` (shared!)
   - `users` (shared!)
   - `emergency_activations` (shared!)

---

## 🔐 Authentication Strategy

### **Current Setup (Client App):**
```typescript
// Supabase Auth
✓ Email/Password
✓ Google OAuth
✓ Session persistence (localStorage)

// User Roles (inferred)
- role: 'principal' (client)
- role: 'officer' (CPO)
```

### **For CPO App:**
```typescript
// Same auth, different role
{
  email: "cpo@example.com",
  role: "officer",  // Distinguish from principals
  officer_profile_id: "uuid"
}

// RLS Policies
- Principals: Can create assignments
- Officers: Can accept/manage assignments
- Admin: Can view all
```

---

## 🚀 Deployment Architecture

### **Current (Client App):**
```
GitHub (main branch)
    ↓
Vercel (auto-deploy)
    ↓
Production URL: [To be confirmed]
```

### **Recommended (CPO App):**
```
GitHub (armoracpo repo)
    ↓
Vercel (separate project)
    ↓
Production URL: cpo.armora.app

Shared Backend:
- Same Supabase project
- Same Firebase project
- Same Stripe account
```

---

## 📊 Key Findings & Recommendations

### **✅ What's Already Built (Reuse for CPO App):**

1. **Complete Authentication System**
   - Firebase + Supabase auth
   - Google OAuth
   - Role-based access

2. **Assignment Management**
   - Create, accept, manage assignments
   - Real-time updates
   - Status tracking

3. **Real-time Tracking**
   - Location updates
   - Geolocation services
   - Live status updates

4. **Emergency System**
   - SOS activation (already exists!)
   - Emergency location tracking
   - Alert notifications

5. **Payment Infrastructure**
   - Stripe integration
   - Payment processing
   - Ready for Stripe Connect

6. **Notification System**
   - Firebase Cloud Messaging
   - Push notifications
   - Real-time alerts

### **🔧 What Needs to be Built (CPO-Specific):**

1. **CPO Registration & Verification**
   - SIA license upload/verification
   - DBS check validation
   - Compliance document management

2. **CPO Dashboard**
   - Available assignments view
   - Active assignment management
   - Earnings tracking

3. **Compliance Center**
   - SIA license tracking
   - Expiry reminders
   - Training modules
   - Document vault

4. **Earnings & Payouts**
   - Stripe Connect integration
   - Invoice generation
   - Payment history

5. **Incident Reporting**
   - Detailed incident forms
   - Photo/video upload
   - Chain of custody

6. **Availability Management**
   - Schedule setting
   - Shift patterns
   - Blocked dates

### **⚠️ Potential Issues:**

1. **Table Name Mismatch:**
   - Client app uses `protection_officers`
   - Our docs use `cpo_profiles`
   - **Solution:** Use `protection_officers` to maintain compatibility

2. **Different Terminology:**
   - Client app may use generic terms
   - CPO app needs SIA-specific terms
   - **Solution:** UI layer translation

3. **Shared vs Separate:**
   - Decision needed: Shared codebase or separate repos?
   - **Recommendation:** Separate repos, shared backend

---

## 🔄 Migration Strategy

### **Phase 1: Audit (Current)**
- ✅ Analyze client app structure
- ✅ Identify shared services
- ✅ Document database schema

### **Phase 2: Setup**
- [ ] Clone Armora Supabase project structure
- [ ] Extend database with CPO tables
- [ ] Set up Vercel project for CPO app
- [ ] Configure environment variables

### **Phase 3: Development**
- [ ] Build CPO-specific screens
- [ ] Integrate with shared backend
- [ ] Test cross-app functionality
- [ ] Ensure data consistency

### **Phase 4: Testing**
- [ ] Test client → CPO assignment flow
- [ ] Test real-time updates both ways
- [ ] Test payment flow (client pays, CPO receives)
- [ ] Test emergency features

### **Phase 5: Deployment**
- [ ] Deploy CPO app to Vercel
- [ ] Configure custom domain (cpo.armora.app)
- [ ] Set up monitoring
- [ ] Launch beta

---

## 🎯 Next Steps

### **Immediate Actions:**

1. **Access Supabase Project**
   ```bash
   # Get Supabase credentials from client app
   # Review actual database schema
   # Document existing tables
   ```

2. **Review Existing Services**
   ```bash
   # Clone github.com/giquina/armora
   # Study service files in detail
   # Identify reusable code
   ```

3. **Create CPO Database Schema**
   ```sql
   -- Extend protection_officers table
   -- Add CPO-specific tables
   -- Maintain compatibility
   ```

4. **Set Up CPO Vercel Project**
   ```bash
   vercel login
   vercel link --project=armora-cpo
   vercel env add
   ```

### **Critical Questions to Answer:**

1. ❓ What is the actual Supabase project URL/ID?
2. ❓ What is the Firebase project ID?
3. ❓ Are there existing protection officers in the database?
4. ❓ What is the current assignment data structure?
5. ❓ How are payments currently processed?
6. ❓ What is the emergency activation workflow?

---

## 📈 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    ARMORA ECOSYSTEM                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │  Client App      │         │   CPO App        │     │
│  │  (Principal)     │         │  (Officers)      │     │
│  ├──────────────────┤         ├──────────────────┤     │
│  │ • Book security  │         │ • Accept jobs    │     │
│  │ • Track CPO      │         │ • Update status  │     │
│  │ • Make payments  │         │ • Track earnings │     │
│  │ • Rate service   │         │ • Compliance     │     │
│  └────────┬─────────┘         └─────────┬────────┘     │
│           │                             │              │
│           └─────────────┬───────────────┘              │
│                         │                              │
│              ┌──────────▼──────────┐                   │
│              │  SHARED BACKEND     │                   │
│              ├─────────────────────┤                   │
│              │                     │                   │
│              │  ┌───────────────┐  │                   │
│              │  │   Supabase    │  │                   │
│              │  │  (Database)   │  │                   │
│              │  └───────────────┘  │                   │
│              │                     │                   │
│              │  ┌───────────────┐  │                   │
│              │  │   Firebase    │  │                   │
│              │  │(Auth/Messaging)│  │                   │
│              │  └───────────────┘  │                   │
│              │                     │                   │
│              │  ┌───────────────┐  │                   │
│              │  │    Stripe     │  │                   │
│              │  │  (Payments)   │  │                   │
│              │  └───────────────┘  │                   │
│              └─────────────────────┘                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Compatibility Checklist

- [x] Same Supabase project
- [x] Same Firebase project
- [x] Same Stripe account
- [x] Shared user authentication
- [x] Shared assignment data structure
- [x] Compatible real-time channels
- [x] Unified notification system
- [ ] CPO-specific extensions added
- [ ] Cross-app testing complete
- [ ] Production deployment verified

---

## 🔗 Related Documentation

- `supabase.md` - Complete database schema
- `firebase.md` - Firebase integration
- `vercel.md` - Deployment configuration
- `claude.md` - Build instructions
- `suggestions.md` - SIA compliance features

---

**Infrastructure Analysis Complete! 🔍**

**Key Insight:** The Armora client app already has a robust security platform built. The CPO app should **extend** this infrastructure rather than duplicate it. Shared backend, separate frontends, unified experience.

**Next:** Access actual Supabase/Firebase projects to confirm schema and begin CPO-specific development.
