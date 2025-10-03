# Shared Backend Schema

This document tracks database tables, types, and configurations shared between the **Armora Client App** and **ArmoraCPO App**.

## Critical Information

**Supabase Project:** https://jmzvrqwjmlnvxojculee.supabase.co
**Firebase Project:** armora-protection (Sender ID: 1010601153585)
**Status:** Production (3 CPOs registered, 1 sample assignment)

⚠️ **IMPORTANT:** Changes to these schemas MUST be coordinated between both app teams. Any breaking changes require simultaneous updates to both applications.

---

## Table of Contents

1. [Shared Database Tables](#shared-database-tables)
2. [TypeScript Interfaces](#typescript-interfaces)
3. [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
4. [Real-time Subscriptions](#real-time-subscriptions)
5. [Firebase Configuration](#firebase-configuration)
6. [Database Functions](#database-functions)
7. [Schema Change Workflow](#schema-change-workflow)
8. [Contact & Coordination](#contact--coordination)

---

## Shared Database Tables

### Core Tables

#### 1. `protection_officers`

**Purpose:** CPO (Close Protection Officer) profiles with SIA licenses, specializations, and performance metrics
**Used By:** Both apps (CPO app for profile management, Client app for CPO selection)

**Key Columns:**
- `id` (uuid, PK) - Unique CPO identifier
- `user_id` (uuid, FK → auth.users) - Links to Supabase Auth user
- `email` (text) - CPO email address
- `first_name`, `last_name` (text) - CPO name
- `phone` (text) - Contact number
- `profile_photo_url` (text) - Avatar/profile image URL

**SIA License Fields:**
- `sia_license_number` (text) - SIA badge number
- `sia_license_type` (text) - License category (e.g., "Close Protection")
- `sia_license_expiry` (date) - License expiration date

**Location & Availability:**
- `is_available` (boolean) - Operational status (true = available for assignments)
- `current_latitude`, `current_longitude` (numeric) - GPS coordinates for tracking
- `verification_status` (enum) - 'pending' | 'verified' | 'rejected'

**Professional Details:**
- `vehicle_make`, `vehicle_model`, `vehicle_color`, `vehicle_registration` (text) - Vehicle info
- `right_to_work_status` (text) - Employment eligibility
- `right_to_work_document_url` (text) - Document storage URL

**Personal Information:**
- `date_of_birth` (date) - DOB for compliance
- `address_line1`, `address_line2`, `city`, `postcode`, `country` (text) - Address
- `emergency_contact_name`, `emergency_contact_phone` (text) - Emergency contacts

**Banking (for payouts):**
- `bank_account_name`, `bank_sort_code`, `bank_account_number` (text) - Bank details
- `national_insurance_number` (text) - NI number for tax purposes

**Performance Metrics:**
- `rating` (numeric) - Average star rating (0-5)
- `total_assignments` (integer) - Total assignments accepted

**Push Notifications:**
- `fcm_token` (text) - Firebase Cloud Messaging token for notifications

**Timestamps:**
- `created_at`, `updated_at` (timestamptz) - Record tracking

**RLS Policies:**
- CPOs can read/update their own profile
- Clients can read verified CPO profiles (limited fields)
- Admin can manage all profiles

**Relationships:**
- One-to-many with `protection_assignments` (via `cpo_id`)
- One-to-many with `payment_records` (via `cpo_id`)
- One-to-many with `incident_reports` (via `cpo_id`)

---

#### 2. `protection_assignments`

**Purpose:** Job assignments connecting principals (clients) with CPOs
**Used By:** Both apps (CPO app for job management, Client app for booking/tracking)

**Key Columns:**
- `id` (uuid, PK) - Unique assignment identifier
- `principal_id` (uuid, FK → principals) - Client who requested assignment
- `cpo_id` (uuid, FK → protection_officers) - Assigned CPO (null if unassigned)

**Assignment Details:**
- `assignment_type` (enum) - 'close_protection' | 'event_security' | 'residential_security' | 'executive_protection' | 'transport_security'
- `threat_level` (enum) - 'low' | 'medium' | 'high' | 'critical'
- `special_instructions` (text) - Additional requirements/notes
- `required_certifications` (text[]) - Array of required CPO certifications

**Location Information:**
- `pickup_location` (text) - Pickup address
- `pickup_latitude`, `pickup_longitude` (numeric) - Pickup GPS coordinates
- `dropoff_location` (text) - Destination address (optional)
- `dropoff_latitude`, `dropoff_longitude` (numeric) - Destination GPS coordinates (optional)

**Time Tracking:**
- `scheduled_start_time` (timestamptz) - Planned start time
- `scheduled_end_time` (timestamptz) - Planned end time (optional)
- `actual_start_time` (timestamptz) - Actual start time (set when status → 'active')
- `actual_end_time` (timestamptz) - Actual end time (set when status → 'completed')

**Status Workflow:**
- `status` (enum) - 'pending' | 'assigned' | 'en_route' | 'active' | 'completed' | 'cancelled'
  - `pending` - Unassigned, available for CPOs to accept
  - `assigned` - CPO accepted, preparing to start
  - `en_route` - CPO traveling to pickup location
  - `active` - Protection detail in progress
  - `completed` - Assignment finished successfully
  - `cancelled` - Assignment cancelled by either party

**Financial Details:**
- `base_rate` (numeric) - Hourly/flat rate for assignment
- `estimated_duration_hours` (numeric) - Estimated duration
- `total_cost` (numeric) - Final calculated cost

**Principal Information (denormalized for quick access):**
- `principal_name` (text) - Client full name
- `principal_phone` (text) - Client contact number
- `principal_photo_url` (text) - Client avatar URL

**Requirements:**
- `vehicle_required` (boolean) - Whether CPO must provide vehicle
- `armed_protection_required` (boolean) - Whether armed protection needed
- `number_of_cpos_required` (integer) - Number of CPOs needed (usually 1)

**Timestamps:**
- `created_at`, `updated_at` (timestamptz) - Record tracking

**RLS Policies:**
- Principals can read/update their own assignments
- CPOs can read assignments where `cpo_id = their_id` OR `status = 'pending'`
- CPOs can update assignments where `cpo_id = their_id`

**Relationships:**
- Many-to-one with `protection_officers` (via `cpo_id`)
- Many-to-one with `principals` (via `principal_id`)
- One-to-many with `assignment_messages` (via `assignment_id`)
- One-to-many with `payment_records` (via `assignment_id`)
- One-to-many with `incident_reports` (via `assignment_id`)

---

#### 3. `assignment_messages`

**Purpose:** Real-time messaging between principals and CPOs during assignments
**Used By:** Both apps (for in-assignment communication)

**Key Columns:**
- `id` (uuid, PK) - Unique message identifier
- `assignment_id` (uuid, FK → protection_assignments) - Related assignment
- `sender_id` (uuid) - Auth user ID of sender
- `sender_type` (enum) - 'principal' | 'cpo'
- `message` (text) - Message content (sanitized)
- `read` (boolean) - Whether message has been read by recipient
- `created_at` (timestamptz) - Message timestamp

**RLS Policies:**
- Users can read messages for assignments they're part of
- Users can create messages for assignments they're part of
- Users can update `read` status on messages sent to them

**Relationships:**
- Many-to-one with `protection_assignments` (via `assignment_id`)

---

#### 4. `payment_records`

**Purpose:** Payment transactions for completed assignments
**Used By:** Both apps (CPO app for earnings, Client app for payment history)

**Key Columns:**
- `id` (uuid, PK) - Unique payment identifier
- `assignment_id` (uuid, FK → protection_assignments) - Related assignment
- `cpo_id` (uuid, FK → protection_officers) - CPO receiving payment
- `amount` (numeric) - Payment amount in GBP
- `currency` (text) - Currency code (default: 'GBP')
- `payment_method` (enum) - 'bank_transfer' | 'stripe' | 'paypal'
- `payment_status` (enum) - 'pending' | 'processing' | 'completed' | 'failed'
- `stripe_payment_intent_id` (text) - Stripe transaction reference
- `paid_at` (timestamptz) - Payment completion timestamp
- `created_at`, `updated_at` (timestamptz) - Record tracking

**RLS Policies:**
- CPOs can read payment records where `cpo_id = their_id`
- Principals can read payment records for their assignments
- Only backend can create/update payment records

**Relationships:**
- Many-to-one with `protection_assignments` (via `assignment_id`)
- Many-to-one with `protection_officers` (via `cpo_id`)

---

#### 5. `incident_reports`

**Purpose:** Security incident documentation during assignments
**Used By:** Both apps (CPO app for filing reports, Client app for viewing)

**Key Columns:**
- `id` (uuid, PK) - Unique incident identifier
- `assignment_id` (uuid, FK → protection_assignments) - Related assignment
- `cpo_id` (uuid, FK → protection_officers) - CPO who filed report
- `incident_type` (enum) - 'threat' | 'medical' | 'property_damage' | 'protocol_breach' | 'other'
- `severity` (enum) - 'low' | 'medium' | 'high' | 'critical'
- `description` (text) - Detailed incident description
- `location` (text) - Incident location address
- `latitude`, `longitude` (numeric) - GPS coordinates of incident
- `incident_time` (timestamptz) - When incident occurred
- `witnesses` (text[]) - Array of witness names/details
- `police_notified` (boolean) - Whether police were called
- `police_reference` (text) - Police report reference number
- `photos` (text[]) - Array of photo URLs
- `video_evidence` (text[]) - Array of video URLs
- `created_at`, `updated_at` (timestamptz) - Record tracking

**RLS Policies:**
- CPOs can create incident reports for their assignments
- CPOs can read incident reports they created
- Principals can read incident reports for their assignments
- Admin can read all incident reports

**Relationships:**
- Many-to-one with `protection_assignments` (via `assignment_id`)
- Many-to-one with `protection_officers` (via `cpo_id`)

---

#### 6. `principals` (Client Profiles)

**Purpose:** Client/principal user profiles
**Used By:** Primarily Client app (CPO app has read-only access to limited fields)

**Key Columns:**
- `id` (uuid, PK) - Unique principal identifier
- `user_id` (uuid, FK → auth.users) - Links to Supabase Auth user
- `email` (text) - Principal email
- `full_name` (text) - Principal full name
- `phone` (text) - Contact number
- `discount_percentage` (numeric) - Any discount applied to bookings
- `questionnaire_completed` (boolean) - Whether onboarding questionnaire completed
- `questionnaire_data` (jsonb) - Questionnaire responses
- `preferred_protection_level` (text) - Default protection level preference
- `emergency_contacts` (jsonb) - Emergency contact information
- `accessibility_requirements` (text) - Any accessibility needs
- `created_at`, `updated_at` (timestamptz) - Record tracking

**RLS Policies:**
- Principals can read/update their own profile
- CPOs can read limited fields (name, photo) for assigned assignments only

**Relationships:**
- One-to-many with `protection_assignments` (via `principal_id`)

---

#### 7. `questionnaire_responses`

**Purpose:** Onboarding questionnaire data collection
**Used By:** Client app (CPO app does not access)

**Key Columns:**
- `id` (uuid, PK) - Unique response identifier
- `user_id` (uuid, FK → auth.users) - User who completed questionnaire
- `responses` (jsonb) - Question-answer pairs
- `completed` (boolean) - Completion status
- `completion_percentage` (numeric) - Progress percentage
- `profile_type` (text) - User type (client/cpo)
- `completed_at` (timestamptz) - Completion timestamp
- `created_at`, `updated_at` (timestamptz) - Record tracking

**RLS Policies:**
- Users can read/update their own questionnaire responses

---

#### 8. `protection_reviews`

**Purpose:** CPO performance reviews from principals
**Used By:** Both apps (CPO app to view ratings, Client app to submit reviews)

**Key Columns:**
- `id` (uuid, PK) - Unique review identifier
- `assignment_id` (uuid, FK → protection_assignments) - Related assignment
- `principal_id` (uuid, FK → principals) - Reviewer
- `officer_id` (uuid, FK → protection_officers) - CPO being reviewed
- `rating` (numeric) - Star rating (1-5)
- `review_text` (text) - Written review
- `service_aspects` (jsonb) - Detailed rating breakdown (professionalism, punctuality, etc.)
- `created_at` (timestamptz) - Review submission timestamp

**RLS Policies:**
- Principals can create reviews for their completed assignments
- CPOs can read reviews where `officer_id = their_id`
- Reviews cannot be updated or deleted once created

**Relationships:**
- Many-to-one with `protection_assignments` (via `assignment_id`)
- Many-to-one with `protection_officers` (via `officer_id`)
- Many-to-one with `principals` (via `principal_id`)

---

#### 9. `emergency_activations`

**Purpose:** Emergency panic button activations and responses
**Used By:** Both apps (CPO app for emergency SOS, Client app for panic button)

**Key Columns:**
- `id` (uuid, PK) - Unique activation identifier
- `user_id` (uuid, FK → auth.users) - User who activated emergency
- `assignment_id` (uuid, FK → protection_assignments) - Related assignment (if applicable)
- `activation_type` (enum) - 'panic_button' | 'medical' | 'security_threat' | 'breakdown'
- `location` (jsonb) - GPS coordinates at time of activation
- `response_status` (enum) - 'activated' | 'dispatched' | 'resolved' | 'false_alarm'
- `response_time_seconds` (integer) - Time to resolution
- `resolution_notes` (text) - How emergency was resolved
- `activated_at` (timestamptz) - Emergency activation timestamp
- `resolved_at` (timestamptz) - Emergency resolution timestamp

**RLS Policies:**
- Users can create emergency activations
- Users can read their own emergency activations
- CPOs can read emergencies for their assignments
- Admin can read all emergency activations

**Relationships:**
- Many-to-one with `protection_assignments` (via `assignment_id`)
- Many-to-one with `auth.users` (via `user_id`)

---

#### 10. `venue_protection_contracts`

**Purpose:** Long-term venue protection contracts
**Used By:** Client app (CPO app has read-only access for assigned contracts)

**Key Columns:**
- `id` (uuid, PK) - Unique contract identifier
- `client_id` (uuid, FK → principals) - Client who purchased contract
- `venue_name` (text) - Venue name
- `venue_address` (jsonb) - Venue location details
- `contract_type` (enum) - 'day' | 'weekend' | 'monthly' | 'annual'
- `officer_count` (integer) - Number of CPOs required
- `protection_level` (enum) - 'essential' | 'executive' | 'shadow'
- `contract_value` (numeric) - Total contract value
- `start_date`, `end_date` (date) - Contract duration
- `special_requirements` (text) - Additional contract terms
- `status` (enum) - 'active' | 'completed' | 'cancelled'
- `created_at` (timestamptz) - Contract creation timestamp

**RLS Policies:**
- Clients can read their own contracts
- CPOs can read contracts they're assigned to
- Only backend can create/update contracts

---

#### 11. `safe_ride_fund_contributions`

**Purpose:** Track contributions to the safe ride fund (charity/social impact feature)
**Used By:** Both apps (for displaying social impact metrics)

**Key Columns:**
- `id` (uuid, PK) - Unique contribution identifier
- `contributor_id` (uuid) - User who contributed
- `assignment_id` (uuid, FK → protection_assignments) - Related assignment
- `contribution_amount` (numeric) - Contribution amount
- `contribution_type` (enum) - 'assignment_percentage' | 'direct_donation' | 'subscription_bonus'
- `created_at` (timestamptz) - Contribution timestamp

---

#### 12. `safe_ride_fund_stats`

**Purpose:** Aggregate statistics for the safe ride fund
**Used By:** Both apps (for displaying public impact metrics)

**Key Columns:**
- `id` (uuid, PK) - Single row identifier
- `total_safe_assignments` (integer) - Total assignments funded
- `total_contributions` (numeric) - Total funds raised
- `monthly_target` (numeric) - Monthly fundraising goal
- `last_updated` (timestamptz) - Last update timestamp

---

#### 13. `sia_license_verifications`

**Purpose:** SIA license verification records
**Used By:** CPO app (for compliance checking), Backend (for automated verification)

**Key Columns:**
- `id` (uuid, PK) - Unique verification identifier
- `license_number` (text) - SIA license number
- `holder_name` (text) - License holder name
- `license_type` (text) - License category
- `issue_date`, `expiry_date` (date) - License validity period
- `status` (enum) - 'active' | 'expired' | 'suspended' | 'revoked'
- `verification_date` (timestamptz) - When verification was performed

**RLS Policies:**
- CPOs can read verifications for their license
- Admin can manage all verifications

---

## TypeScript Interfaces

### CPO App Interfaces (`src/lib/supabase.ts`)

```typescript
export interface ProtectionOfficer {
  id: string;
  user_id: string;
  sia_license_number: string;
  sia_license_type: string;
  sia_license_expiry: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  profile_photo_url?: string;
  date_of_birth: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  postcode: string;
  country: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_color?: string;
  vehicle_registration?: string;
  bank_account_name?: string;
  bank_sort_code?: string;
  bank_account_number?: string;
  national_insurance_number?: string;
  right_to_work_status: string;
  right_to_work_document_url?: string;
  is_available: boolean;
  current_latitude?: number;
  current_longitude?: number;
  rating?: number;
  total_assignments?: number;
  created_at: string;
  updated_at: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  fcm_token?: string;
}

export interface ProtectionAssignment {
  id: string;
  principal_id: string;
  cpo_id?: string;
  pickup_location: string;
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_location?: string;
  dropoff_latitude?: number;
  dropoff_longitude?: number;
  scheduled_start_time: string;
  scheduled_end_time?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  assignment_type: 'close_protection' | 'event_security' | 'residential_security' | 'executive_protection' | 'transport_security';
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  special_instructions?: string;
  required_certifications?: string[];
  status: 'pending' | 'assigned' | 'en_route' | 'active' | 'completed' | 'cancelled';
  base_rate: number;
  estimated_duration_hours?: number;
  total_cost?: number;
  principal_name: string;
  principal_phone: string;
  principal_photo_url?: string;
  vehicle_required: boolean;
  armed_protection_required: boolean;
  number_of_cpos_required: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentRecord {
  id: string;
  assignment_id: string;
  cpo_id: string;
  amount: number;
  currency: string;
  payment_method: 'bank_transfer' | 'stripe' | 'paypal';
  payment_status: 'pending' | 'processing' | 'completed' | 'failed';
  stripe_payment_intent_id?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface IncidentReport {
  id: string;
  assignment_id: string;
  cpo_id: string;
  incident_type: 'threat' | 'medical' | 'property_damage' | 'protocol_breach' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  incident_time: string;
  witnesses?: string[];
  police_notified: boolean;
  police_reference?: string;
  photos?: string[];
  video_evidence?: string[];
  created_at: string;
  updated_at: string;
}

export interface AssignmentMessage {
  id: string;
  assignment_id: string;
  sender_type: 'principal' | 'cpo';
  sender_id: string;
  message: string;
  read: boolean;
  created_at: string;
}
```

### Client App Database Types (`src/types/database.types.ts`)

The client app uses generated Supabase types with slightly different structure:

```typescript
export type ProtectionLevel = 'essential' | 'executive' | 'shadow';
export type AssignmentStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
export type OfficerStatus = 'pending_approval' | 'approved' | 'suspended' | 'inactive';
export type AvailabilityStatus = 'available' | 'on_assignment' | 'offline' | 'busy';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
```

**⚠️ COORDINATION REQUIRED:** The two apps use slightly different enum values for `status` fields:
- CPO App: `'pending' | 'assigned' | 'en_route' | 'active' | 'completed' | 'cancelled'`
- Client App: `'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'`

**Resolution:** Need to align on single set of status values or map between them in application code.

---

## Row Level Security (RLS) Policies

### Critical RLS Policies (Both Apps Depend On)

#### `protection_officers` Table

```sql
-- CPOs can read their own profile
CREATE POLICY "cpos_read_own_profile"
ON protection_officers FOR SELECT
USING (auth.uid() = user_id);

-- CPOs can update their own profile
CREATE POLICY "cpos_update_own_profile"
ON protection_officers FOR UPDATE
USING (auth.uid() = user_id);

-- Verified CPOs visible to clients (limited fields via view)
CREATE POLICY "clients_read_verified_cpos"
ON protection_officers FOR SELECT
USING (verification_status = 'verified');
```

#### `protection_assignments` Table

```sql
-- CPOs can see pending assignments (for job selection)
CREATE POLICY "cpos_read_pending_assignments"
ON protection_assignments FOR SELECT
USING (status = 'pending' AND cpo_id IS NULL);

-- CPOs can see their assigned assignments
CREATE POLICY "cpos_read_own_assignments"
ON protection_assignments FOR SELECT
USING (cpo_id IN (
  SELECT id FROM protection_officers WHERE user_id = auth.uid()
));

-- CPOs can update their assigned assignments
CREATE POLICY "cpos_update_own_assignments"
ON protection_assignments FOR UPDATE
USING (cpo_id IN (
  SELECT id FROM protection_officers WHERE user_id = auth.uid()
));

-- Principals can see their own assignments
CREATE POLICY "principals_read_own_assignments"
ON protection_assignments FOR SELECT
USING (principal_id IN (
  SELECT id FROM principals WHERE user_id = auth.uid()
));
```

#### `assignment_messages` Table

```sql
-- Users can read messages for assignments they're part of
CREATE POLICY "users_read_assignment_messages"
ON assignment_messages FOR SELECT
USING (
  assignment_id IN (
    SELECT id FROM protection_assignments
    WHERE principal_id IN (SELECT id FROM principals WHERE user_id = auth.uid())
    OR cpo_id IN (SELECT id FROM protection_officers WHERE user_id = auth.uid())
  )
);

-- Users can create messages for assignments they're part of
CREATE POLICY "users_create_assignment_messages"
ON assignment_messages FOR INSERT
WITH CHECK (
  assignment_id IN (
    SELECT id FROM protection_assignments
    WHERE principal_id IN (SELECT id FROM principals WHERE user_id = auth.uid())
    OR cpo_id IN (SELECT id FROM protection_officers WHERE user_id = auth.uid())
  )
);
```

#### `payment_records` Table

```sql
-- CPOs can see their payment records
CREATE POLICY "cpos_read_own_payments"
ON payment_records FOR SELECT
USING (cpo_id IN (
  SELECT id FROM protection_officers WHERE user_id = auth.uid()
));

-- Principals can see payments for their assignments
CREATE POLICY "principals_read_assignment_payments"
ON payment_records FOR SELECT
USING (assignment_id IN (
  SELECT id FROM protection_assignments
  WHERE principal_id IN (SELECT id FROM principals WHERE user_id = auth.uid())
));
```

---

## Real-time Subscriptions

### Supabase Realtime Channels (Shared Between Apps)

#### Assignment Updates

**CPO App Usage:**
```typescript
// Subscribe to assignment updates for a specific CPO
const channel = supabase
  .channel('assignment-updates')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'protection_assignments',
      filter: `cpo_id=eq.${cpoId}`,
    },
    (payload) => {
      // Handle assignment update
      callback(payload.new as ProtectionAssignment);
    }
  )
  .subscribe();
```

**Client App Usage:**
```typescript
// Subscribe to assignment updates for a specific principal
const channel = supabase
  .channel(`assignment-${assignmentId}`)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'protection_assignments',
      filter: `id=eq.${assignmentId}`,
    },
    callback
  )
  .subscribe();
```

#### CPO Location Tracking

**CPO App:** Publishes location updates
```typescript
// Update CPO location
await supabase
  .from('protection_officers')
  .update({
    current_latitude: latitude,
    current_longitude: longitude,
  })
  .eq('id', cpoId);
```

**Client App:** Subscribes to CPO location updates
```typescript
// Subscribe to CPO location updates
const channel = supabase
  .channel(`officer-location-${officerId}`)
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'protection_officers',
      filter: `id=eq.${officerId}`,
    },
    (payload) => {
      // Update map marker with new location
    }
  )
  .subscribe();
```

#### Message Subscriptions

**Both Apps:**
```typescript
// Subscribe to real-time messages for an assignment
const channel = supabase
  .channel(`messages-${assignmentId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'assignment_messages',
      filter: `assignment_id=eq.${assignmentId}`,
    },
    (payload) => {
      // Display new message
      callback(payload.new as AssignmentMessage);
    }
  )
  .subscribe();
```

---

## Firebase Configuration

### Shared Firebase Project: `armora-protection`

**Configuration (Both Apps):**
```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "armora-protection.firebaseapp.com",
  projectId: "armora-protection",
  storageBucket: "armora-protection.appspot.com",
  messagingSenderId: "1010601153585",
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};
```

### Firebase Cloud Messaging (FCM) Push Notifications

**Token Storage:**
- FCM tokens stored in `protection_officers.fcm_token` (for CPO app)
- FCM tokens stored in `principals.fcm_token` (for Client app)

**CPO App Notifications:**
```typescript
// Request notification permission and save token
const requestNotificationPermission = async (userId: string) => {
  const messaging = getMessaging();
  const permission = await Notification.requestPermission();

  if (permission === 'granted') {
    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
    });

    // Save token to Supabase
    await supabase
      .from('protection_officers')
      .update({ fcm_token: token })
      .eq('user_id', userId);
  }
};
```

**Notification Types (Both Apps):**
- `new_assignment` - New assignment available (CPO app)
- `assignment_accepted` - CPO accepted assignment (Client app)
- `cpo_en_route` - CPO is on the way (Client app)
- `assignment_started` - Assignment started (Client app)
- `assignment_completed` - Assignment completed (Both apps)
- `new_message` - New message received (Both apps)
- `payment_received` - Payment processed (CPO app)
- `emergency_activated` - Emergency button pressed (Both apps)

### Service Worker Configuration

**Both apps must register a Firebase service worker:**

`public/firebase-messaging-sw.js`:
```javascript
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "...",
  authDomain: "armora-protection.firebaseapp.com",
  projectId: "armora-protection",
  storageBucket: "armora-protection.appspot.com",
  messagingSenderId: "1010601153585",
  appId: "...",
});

const messaging = firebase.messaging();
```

---

## Database Functions

### Shared PostgreSQL Functions

#### `find_nearby_officers`

**Purpose:** Find CPOs within a specific radius using PostGIS
**Used By:** Client app (for CPO selection), Backend (for assignment matching)

```sql
CREATE OR REPLACE FUNCTION find_nearby_officers(
  lat NUMERIC,
  lng NUMERIC,
  radius_km NUMERIC DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  protection_level TEXT[],
  rating NUMERIC,
  distance_km NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    po.id,
    CONCAT(po.first_name, ' ', po.last_name) as full_name,
    ARRAY[]::TEXT[] as protection_level, -- Placeholder
    po.rating,
    ST_Distance(
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(po.current_longitude, po.current_latitude), 4326)::geography
    ) / 1000 as distance_km
  FROM protection_officers po
  WHERE
    po.is_available = true
    AND po.verification_status = 'verified'
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(po.current_longitude, po.current_latitude), 4326)::geography,
      radius_km * 1000
    )
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Usage (Client App):**
```typescript
const { data: nearbyOfficers } = await supabase.rpc('find_nearby_officers', {
  lat: 51.5074,
  lng: -0.1278,
  radius_km: 10,
});
```

---

## Schema Change Workflow

When modifying shared schemas, follow this process to ensure both apps remain functional:

### Step 1: Proposal & Planning
1. Create an issue in both repositories describing the schema change
2. Tag both development teams for review
3. Discuss impact on both applications
4. Agree on migration timeline

### Step 2: Documentation Update
1. Update `SHARED_SCHEMA.md` in ArmoraCPO repository with proposed changes
2. Create a pull request for documentation review
3. Mark the change with a version tag (e.g., `v2.1.0`)

### Step 3: Database Migration
1. Write Supabase migration SQL in a new migration file
2. Test migration on staging/development environment
3. Verify both apps work with new schema
4. Document any required RLS policy changes

### Step 4: Application Updates
1. Update ArmoraCPO app TypeScript types (`src/lib/supabase.ts`)
2. Update Armora Client app TypeScript types (`src/types/database.types.ts`)
3. Update service layer code in both apps to handle new schema
4. Write tests for schema changes in both apps

### Step 5: Deployment
1. Deploy database migration to production during low-traffic window
2. Monitor for errors in both applications
3. Deploy CPO app updates
4. Deploy Client app updates
5. Verify end-to-end functionality

### Step 6: Documentation Sync
1. Copy updated `SHARED_SCHEMA.md` to Armora Client app repository
2. Update API documentation if external APIs are affected
3. Notify all stakeholders of completed changes

### Breaking Changes

For breaking changes that would cause downtime:
1. Implement backward-compatible changes first (e.g., add new columns, keep old ones)
2. Deploy both apps to use new columns
3. Once both apps are updated, remove old columns in a second migration
4. This ensures zero-downtime deployments

### Emergency Rollback Procedure

If a schema change causes critical issues:
1. Immediately roll back database migration
2. Redeploy previous versions of both apps
3. Document what went wrong
4. Revise schema change plan
5. Re-test before attempting again

---

## Contact & Coordination

### Schema Change Notifications

For any schema changes, create a notification in:

**ArmoraCPO Repository:**
- File issue with label: `schema-change`, `breaking-change` (if applicable)
- Assign to: CPO app development team

**Armora Client Repository:**
- File issue with label: `schema-change`, `breaking-change` (if applicable)
- Assign to: Client app development team

### Development Team Contacts

**ArmoraCPO Team:**
- Repository: `github.com/[org]/armoracpo`
- Email: cpo-dev@armora.com (placeholder)
- Slack: #armora-cpo-dev

**Armora Client Team:**
- Repository: `github.com/giquina/armora`
- Email: client-dev@armora.com (placeholder)
- Slack: #armora-client-dev

### Critical Alerts

For urgent schema issues affecting production:
1. Post in both Slack channels: `#armora-cpo-dev` and `#armora-client-dev`
2. Email both development teams
3. Create high-priority issues in both repositories
4. Coordinate immediate response call if needed

---

## Version History

| Version | Date | Changes | Apps Affected |
|---------|------|---------|---------------|
| 1.0.0 | 2025-10-03 | Initial shared schema documentation | Both |

---

## Appendix: Type Mapping Between Apps

### Status Field Mapping

| CPO App Status | Client App Status | Description |
|----------------|-------------------|-------------|
| `pending` | `pending` | Unassigned, available for CPOs |
| `assigned` | `confirmed` | CPO accepted assignment |
| `en_route` | `active` (?) | CPO traveling to pickup |
| `active` | `active` | Assignment in progress |
| `completed` | `completed` | Assignment finished |
| `cancelled` | `cancelled` | Assignment cancelled |

**⚠️ ACTION REQUIRED:** Align on single set of status values or implement mapping layer.

---

## FAQ

### Q: Can I add a new column to a shared table without coordinating?
**A:** No. Any column addition requires coordination because:
- RLS policies may need updates
- TypeScript types in both apps must be updated
- Real-time subscriptions may need to include new fields

### Q: What if I need to add a CPO-only table?
**A:** You can add CPO-specific tables without coordination, but:
- Document them in ArmoraCPO's local schema docs (not this file)
- Ensure RLS policies prevent client access
- Consider if the data might be useful to clients in the future

### Q: How do I test schema changes locally?
**A:** Use Supabase local development:
```bash
# Start local Supabase instance
supabase start

# Apply migrations
supabase db push

# Test both apps against local instance
# CPO App: Update .env to point to local Supabase
# Client App: Update .env to point to local Supabase
```

### Q: What's the process for renaming a table?
**A:** Renaming shared tables is a breaking change:
1. Create a view with the new name pointing to the old table
2. Update both apps to use the new view name
3. Once both apps are deployed, rename the actual table
4. Update view to point to renamed table
5. Eventually remove view (after confirmation both apps work)

---

**Document Maintenance:** This document should be updated whenever:
- New shared tables are added
- Existing tables are modified
- RLS policies are changed
- Real-time subscription patterns change
- Firebase notification types are added
- Database functions are created or modified

**Last Updated:** 2025-10-03
**Maintained By:** ArmoraCPO & Armora Client Development Teams
