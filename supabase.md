# 🗄️ Supabase Backend Integration - Armora CPO

## Overview

Supabase is the primary backend for Armora CPO, providing PostgreSQL database, authentication, real-time subscriptions, and file storage. This guide covers complete integration.

---

## 🚀 Quick Setup

### **1. Create Supabase Project**

```bash
# Visit: https://supabase.com/dashboard
# Click "New Project"
# Project Name: armora-cpo
# Database Password: [generate secure password]
# Region: London (eu-west-2)
```

### **2. Install Supabase Client**

```bash
npm install @supabase/supabase-js
```

### **3. Get API Credentials**

From Supabase Dashboard → Settings → API:
- Project URL: `https://your-project.supabase.co`
- Anon/Public Key: `eyJhbGciOiJIUzI1...` (safe for client-side)
- Service Role Key: `eyJhbGciOiJIUzI1...` (NEVER expose in client)

---

## 🔧 Client Configuration

### **src/services/supabase/client.ts**

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase: SupabaseClient<Database> = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: window.sessionStorage // Use sessionStorage for security
    },
    realtime: {
      params: {
        eventsPerSecond: 10 // Throttle real-time events
      }
    }
  }
);

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any): never => {
  console.error('Supabase error:', error);
  throw new Error(error.message || 'Database operation failed');
};
```

---

## 🗃️ Database Schema

### **Complete Schema for Armora CPO**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for location features (optional)
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- USERS TABLE (Shared with client app)
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('principal', 'cpo', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- ============================================
-- CPO PROFILES
-- ============================================

CREATE TABLE cpo_profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  photo_url TEXT,
  bio TEXT,
  years_experience INTEGER DEFAULT 0,

  -- SIA License Information
  sia_license_number TEXT UNIQUE NOT NULL,
  sia_license_type TEXT NOT NULL,
  sia_expiry_date DATE NOT NULL,
  sia_status TEXT DEFAULT 'pending' CHECK (sia_status IN ('pending', 'valid', 'expired', 'suspended')),

  -- DBS Check
  dbs_number TEXT,
  dbs_issue_date DATE,
  dbs_status TEXT DEFAULT 'pending' CHECK (dbs_status IN ('pending', 'valid', 'expired')),

  -- Operational Status
  operational_status TEXT DEFAULT 'off_duty' CHECK (operational_status IN ('ready', 'on_assignment', 'off_duty')),
  compliance_score INTEGER DEFAULT 100 CHECK (compliance_score >= 0 AND compliance_score <= 100),

  -- Payment
  stripe_connect_account_id TEXT,
  bank_account_verified BOOLEAN DEFAULT FALSE,

  -- Location (for assignment matching)
  current_location GEOGRAPHY(POINT, 4326),
  last_location_update TIMESTAMPTZ,

  -- Performance Metrics
  total_assignments INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 5.0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cpo_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CPOs can read/update own profile"
  ON cpo_profiles FOR ALL
  USING (auth.uid() = id);

-- Index for location queries
CREATE INDEX idx_cpo_location ON cpo_profiles USING GIST(current_location);

-- Index for operational status
CREATE INDEX idx_cpo_operational_status ON cpo_profiles(operational_status);

-- ============================================
-- ASSIGNMENTS
-- ============================================

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference TEXT UNIQUE NOT NULL, -- 'ARM-20250164'

  -- Relationships
  principal_id UUID REFERENCES users(id),
  cpo_id UUID REFERENCES cpo_profiles(id),

  -- Assignment Details
  assignment_type TEXT NOT NULL CHECK (assignment_type IN (
    'executive_transport',
    'event_security',
    'residential_security',
    'personal_escort',
    'static_guard',
    'mobile_patrol',
    'vip_protection',
    'corporate_security'
  )),

  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),

  -- Locations
  pickup_address TEXT NOT NULL,
  pickup_location GEOGRAPHY(POINT, 4326),
  destination_address TEXT,
  destination_location GEOGRAPHY(POINT, 4326),

  -- Timing
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'offered',
    'accepted',
    'en_route',
    'on_station',
    'principal_secure',
    'active',
    'completed',
    'cancelled',
    'incident'
  )),

  -- Pricing
  base_rate DECIMAL(10, 2) NOT NULL, -- £/hour
  total_hours DECIMAL(5, 2),
  total_amount DECIMAL(10, 2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed')),

  -- Additional Information
  special_instructions TEXT,
  threat_assessment_id UUID,
  requires_advance_check BOOLEAN DEFAULT FALSE,
  minimum_experience_years INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- CPOs can see assignments offered to them or their active assignments
CREATE POLICY "CPOs can see relevant assignments"
  ON assignments FOR SELECT
  USING (
    cpo_id = auth.uid() OR
    (cpo_id IS NULL AND status = 'offered')
  );

-- CPOs can update their own assignments
CREATE POLICY "CPOs can update own assignments"
  ON assignments FOR UPDATE
  USING (cpo_id = auth.uid());

-- Indexes
CREATE INDEX idx_assignments_cpo ON assignments(cpo_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_assignments_scheduled_start ON assignments(scheduled_start);
CREATE INDEX idx_assignments_location ON assignments USING GIST(pickup_location);

-- ============================================
-- ASSIGNMENT TIMELINE (Status Updates)
-- ============================================

CREATE TABLE assignment_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,

  status TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),

  -- Location at time of update
  location GEOGRAPHY(POINT, 4326),
  location_accuracy DECIMAL(8, 2), -- meters

  notes TEXT,

  created_by UUID REFERENCES users(id)
);

ALTER TABLE assignment_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CPOs can read/write timeline for own assignments"
  ON assignment_timeline FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = assignment_timeline.assignment_id
      AND assignments.cpo_id = auth.uid()
    )
  );

CREATE INDEX idx_timeline_assignment ON assignment_timeline(assignment_id);

-- ============================================
-- CPO QUALIFICATIONS
-- ============================================

CREATE TABLE cpo_qualifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cpo_id UUID REFERENCES cpo_profiles(id) ON DELETE CASCADE,

  qualification_type TEXT NOT NULL CHECK (qualification_type IN (
    'close_protection_level_3',
    'first_aid',
    'advanced_driving',
    'firearms',
    'hostile_environment',
    'counter_surveillance',
    'medical_first_responder',
    'cyber_security',
    'vip_protocol',
    'conflict_management'
  )),

  provider TEXT,
  certificate_number TEXT,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  certificate_url TEXT, -- Supabase Storage URL

  status TEXT DEFAULT 'valid' CHECK (status IN ('valid', 'expired', 'pending_renewal')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cpo_qualifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CPOs can manage own qualifications"
  ON cpo_qualifications FOR ALL
  USING (cpo_id = auth.uid());

CREATE INDEX idx_qualifications_cpo ON cpo_qualifications(cpo_id);

-- ============================================
-- COMPLIANCE DOCUMENTS
-- ============================================

CREATE TABLE compliance_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cpo_id UUID REFERENCES cpo_profiles(id) ON DELETE CASCADE,

  document_type TEXT NOT NULL CHECK (document_type IN (
    'sia_license',
    'dbs_certificate',
    'professional_indemnity',
    'public_liability',
    'passport',
    'driver_license',
    'proof_of_address',
    'right_to_work'
  )),

  document_url TEXT NOT NULL, -- Supabase Storage URL
  document_name TEXT,
  document_size INTEGER, -- bytes

  expiry_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),

  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id)
);

ALTER TABLE compliance_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CPOs can manage own documents"
  ON compliance_documents FOR ALL
  USING (cpo_id = auth.uid());

CREATE INDEX idx_compliance_cpo ON compliance_documents(cpo_id);

-- ============================================
-- EARNINGS
-- ============================================

CREATE TABLE earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cpo_id UUID REFERENCES cpo_profiles(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES assignments(id),

  amount DECIMAL(10, 2) NOT NULL,
  fee DECIMAL(10, 2) DEFAULT 0, -- Platform fee
  net_amount DECIMAL(10, 2) NOT NULL, -- Amount after fee

  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending',
    'processing',
    'paid',
    'failed',
    'refunded'
  )),

  payout_date TIMESTAMPTZ,
  stripe_transfer_id TEXT,
  stripe_charge_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CPOs can read own earnings"
  ON earnings FOR SELECT
  USING (cpo_id = auth.uid());

CREATE INDEX idx_earnings_cpo ON earnings(cpo_id);
CREATE INDEX idx_earnings_payout_date ON earnings(payout_date);

-- ============================================
-- MESSAGES (Assignment-specific)
-- ============================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,

  sender_id UUID REFERENCES users(id),
  sender_role TEXT NOT NULL CHECK (sender_role IN ('principal', 'cpo', 'dispatch')),

  message_text TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'image', 'location')),

  attachment_url TEXT, -- Supabase Storage URL
  attachment_type TEXT,

  read_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CPOs can read/write messages for own assignments"
  ON messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = messages.assignment_id
      AND assignments.cpo_id = auth.uid()
    )
  );

CREATE INDEX idx_messages_assignment ON messages(assignment_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- ============================================
-- INCIDENT REPORTS
-- ============================================

CREATE TABLE incident_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  cpo_id UUID REFERENCES cpo_profiles(id),

  reference TEXT UNIQUE NOT NULL, -- 'IR-20250164-01'

  incident_type TEXT NOT NULL CHECK (incident_type IN (
    'security_breach',
    'suspicious_activity',
    'medical_emergency',
    'vehicle_incident',
    'aggressive_behavior',
    'stalking',
    'photography_surveillance',
    'equipment_failure',
    'other'
  )),

  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),

  description TEXT NOT NULL,

  -- Location
  location GEOGRAPHY(POINT, 4326),
  location_description TEXT,

  -- Evidence
  photos JSONB, -- Array of Supabase Storage URLs
  videos JSONB,
  voice_notes JSONB,

  -- Timeline
  incident_timestamp TIMESTAMPTZ NOT NULL,
  reported_at TIMESTAMPTZ DEFAULT NOW(),

  -- Actions Taken
  actions_taken TEXT,
  police_notified BOOLEAN DEFAULT FALSE,
  police_reference TEXT,

  -- Witnesses
  witnesses JSONB, -- Array of witness details

  -- Status
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CPOs can manage own incident reports"
  ON incident_reports FOR ALL
  USING (cpo_id = auth.uid());

CREATE INDEX idx_incidents_cpo ON incident_reports(cpo_id);
CREATE INDEX idx_incidents_assignment ON incident_reports(assignment_id);

-- ============================================
-- REVIEWS (Both directions)
-- ============================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,

  reviewer_id UUID REFERENCES users(id),
  reviewer_role TEXT NOT NULL CHECK (reviewer_role IN ('principal', 'cpo')),

  reviewee_id UUID REFERENCES users(id),
  reviewee_role TEXT NOT NULL CHECK (reviewee_role IN ('principal', 'cpo')),

  -- Overall Rating
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),

  -- Detailed Ratings (for CPOs)
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  security_awareness_rating INTEGER CHECK (security_awareness_rating >= 1 AND security_awareness_rating <= 5),

  comment TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read reviews about them"
  ON reviews FOR SELECT
  USING (reviewee_id = auth.uid());

CREATE POLICY "Users can create reviews for completed assignments"
  ON reviews FOR INSERT
  WITH CHECK (reviewer_id = auth.uid());

CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_assignment ON reviews(assignment_id);

-- ============================================
-- AVAILABILITY SCHEDULE
-- ============================================

CREATE TABLE cpo_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cpo_id UUID REFERENCES cpo_profiles(id) ON DELETE CASCADE,

  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  -- Specific date overrides
  specific_date DATE,
  is_available BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cpo_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CPOs can manage own availability"
  ON cpo_availability FOR ALL
  USING (cpo_id = auth.uid());

CREATE INDEX idx_availability_cpo ON cpo_availability(cpo_id);
CREATE INDEX idx_availability_date ON cpo_availability(specific_date);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cpo_profiles_updated_at BEFORE UPDATE ON cpo_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate assignment reference
CREATE OR REPLACE FUNCTION generate_assignment_reference()
RETURNS TRIGGER AS $$
BEGIN
  NEW.reference = 'ARM-' || TO_CHAR(NOW(), 'YYYY') || LPAD(nextval('assignment_ref_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE assignment_ref_seq START 1;

CREATE TRIGGER assignment_reference_trigger BEFORE INSERT ON assignments
  FOR EACH ROW EXECUTE FUNCTION generate_assignment_reference();

-- Function to generate incident reference
CREATE OR REPLACE FUNCTION generate_incident_reference()
RETURNS TRIGGER AS $$
DECLARE
  assignment_ref TEXT;
  incident_count INTEGER;
BEGIN
  SELECT reference INTO assignment_ref FROM assignments WHERE id = NEW.assignment_id;
  SELECT COUNT(*) + 1 INTO incident_count FROM incident_reports WHERE assignment_id = NEW.assignment_id;

  NEW.reference = 'IR-' || SUBSTRING(assignment_ref FROM 5) || '-' || LPAD(incident_count::TEXT, 2, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER incident_reference_trigger BEFORE INSERT ON incident_reports
  FOR EACH ROW EXECUTE FUNCTION generate_incident_reference();
```

---

## 🔄 Real-time Subscriptions

### **src/services/supabase/realtime.ts**

```typescript
import { supabase } from './client';
import { Assignment } from '@/types';

/**
 * Subscribe to new assignments for a CPO
 */
export const subscribeToNewAssignments = (
  cpoId: string,
  onNewAssignment: (assignment: Assignment) => void
) => {
  const channel = supabase
    .channel('new-assignments')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'assignments',
        filter: `cpo_id=eq.${cpoId}`
      },
      (payload) => {
        onNewAssignment(payload.new as Assignment);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Subscribe to assignment status updates
 */
export const subscribeToAssignmentUpdates = (
  assignmentId: string,
  onUpdate: (assignment: Assignment) => void
) => {
  const channel = supabase
    .channel(`assignment-${assignmentId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'assignments',
        filter: `id=eq.${assignmentId}`
      },
      (payload) => {
        onUpdate(payload.new as Assignment);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Subscribe to new messages in assignment
 */
export const subscribeToMessages = (
  assignmentId: string,
  onNewMessage: (message: any) => void
) => {
  const channel = supabase
    .channel(`messages-${assignmentId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `assignment_id=eq.${assignmentId}`
      },
      (payload) => {
        onNewMessage(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
```

---

## 📁 File Storage

### **src/services/supabase/storage.ts**

```typescript
import { supabase } from './client';

const BUCKETS = {
  PROFILES: 'cpo-profiles',
  DOCUMENTS: 'compliance-documents',
  INCIDENTS: 'incident-evidence',
  MESSAGES: 'message-attachments'
};

/**
 * Upload CPO profile photo
 */
export const uploadProfilePhoto = async (
  cpoId: string,
  file: File
): Promise<string> => {
  const fileName = `${cpoId}/profile-${Date.now()}.${file.name.split('.').pop()}`;

  const { data, error } = await supabase.storage
    .from(BUCKETS.PROFILES)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) throw error;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKETS.PROFILES)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

/**
 * Upload compliance document
 */
export const uploadComplianceDocument = async (
  cpoId: string,
  documentType: string,
  file: File
): Promise<string> => {
  const fileName = `${cpoId}/${documentType}-${Date.now()}.${file.name.split('.').pop()}`;

  const { data, error } = await supabase.storage
    .from(BUCKETS.DOCUMENTS)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // Get public URL (secured by RLS)
  const { data: urlData } = supabase.storage
    .from(BUCKETS.DOCUMENTS)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

/**
 * Upload incident photo/video
 */
export const uploadIncidentEvidence = async (
  incidentId: string,
  file: File
): Promise<string> => {
  const fileName = `${incidentId}/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from(BUCKETS.INCIDENTS)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(BUCKETS.INCIDENTS)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

/**
 * Delete file from storage
 */
export const deleteFile = async (
  bucket: string,
  path: string
): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
};
```

---

## 🔐 Row Level Security (RLS) Policies

### **Storage Bucket Policies**

```sql
-- CPO Profiles bucket policies
CREATE POLICY "CPOs can upload own profile photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cpo-profiles' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view profile photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cpo-profiles');

-- Compliance Documents bucket policies
CREATE POLICY "CPOs can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'compliance-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "CPOs can view own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'compliance-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Incident Evidence bucket policies
CREATE POLICY "CPOs can upload incident evidence"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'incident-evidence');

CREATE POLICY "CPOs can view incident evidence"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'incident-evidence');
```

---

## 📊 Database Functions & Triggers

### **Useful Database Functions**

```sql
-- Calculate CPO compliance score
CREATE OR REPLACE FUNCTION calculate_compliance_score(cpo_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  sia_valid BOOLEAN;
  dbs_valid BOOLEAN;
  insurance_count INTEGER;
  qualification_count INTEGER;
BEGIN
  -- Check SIA license (25 points)
  SELECT sia_status = 'valid' INTO sia_valid
  FROM cpo_profiles WHERE id = cpo_id_param;

  IF sia_valid THEN score := score + 25; END IF;

  -- Check DBS (20 points)
  SELECT dbs_status = 'valid' INTO dbs_valid
  FROM cpo_profiles WHERE id = cpo_id_param;

  IF dbs_valid THEN score := score + 20; END IF;

  -- Check insurance documents (15 points)
  SELECT COUNT(*) INTO insurance_count
  FROM compliance_documents
  WHERE cpo_id = cpo_id_param
  AND document_type IN ('professional_indemnity', 'public_liability')
  AND status = 'approved'
  AND (expiry_date IS NULL OR expiry_date > NOW());

  IF insurance_count >= 2 THEN score := score + 15; END IF;

  -- Check qualifications (40 points - 10 each for 4 key quals)
  SELECT COUNT(*) INTO qualification_count
  FROM cpo_qualifications
  WHERE cpo_id = cpo_id_param
  AND status = 'valid'
  AND (expiry_date IS NULL OR expiry_date > NOW());

  score := score + LEAST(qualification_count * 10, 40);

  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update compliance score
CREATE OR REPLACE FUNCTION update_cpo_compliance_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE cpo_profiles
  SET compliance_score = calculate_compliance_score(NEW.cpo_id)
  WHERE id = NEW.cpo_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER compliance_doc_score_update
AFTER INSERT OR UPDATE ON compliance_documents
FOR EACH ROW EXECUTE FUNCTION update_cpo_compliance_score();

CREATE TRIGGER qualification_score_update
AFTER INSERT OR UPDATE ON cpo_qualifications
FOR EACH ROW EXECUTE FUNCTION update_cpo_compliance_score();
```

---

## 🧪 Testing Supabase Integration

### **src/services/supabase/supabase.test.ts**

```typescript
import { supabase } from './client';

describe('Supabase Integration', () => {
  it('connects to Supabase successfully', async () => {
    const { data, error } = await supabase.from('users').select('count');
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('enforces RLS policies', async () => {
    // Attempt to read another user's profile (should fail)
    const { data, error } = await supabase
      .from('cpo_profiles')
      .select('*')
      .neq('id', 'current-user-id');

    expect(data).toEqual([]);
  });
});
```

---

## 📚 Useful Supabase CLI Commands

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Init project locally
supabase init

# Start local Supabase (for development)
supabase start

# Stop local Supabase
supabase stop

# Link to remote project
supabase link --project-ref your-project-ref

# Generate TypeScript types from schema
supabase gen types typescript --project-id your-project-id > src/types/supabase.ts

# Run migrations
supabase db push

# Reset database (development only!)
supabase db reset

# View database URL
supabase status
```

---

## 🔄 Database Migrations

### **Create Migration**

```bash
# Create new migration
supabase migration new add_cpo_profiles_table

# Edit migration file
# supabase/migrations/20250101000000_add_cpo_profiles_table.sql
```

### **Example Migration**

```sql
-- supabase/migrations/20250101000000_add_geofencing.sql

ALTER TABLE assignments
ADD COLUMN geofence_radius INTEGER DEFAULT 100; -- meters

CREATE TABLE geofence_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id),
  cpo_id UUID REFERENCES cpo_profiles(id),
  event_type TEXT CHECK (event_type IN ('entered', 'exited')),
  location GEOGRAPHY(POINT, 4326),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_geofence_events_assignment ON geofence_events(assignment_id);
```

---

## 🎯 Best Practices

1. **Always use RLS policies** - Never disable RLS in production
2. **Use prepared statements** - Prevent SQL injection
3. **Index frequently queried columns** - Optimize performance
4. **Use JSONB for flexible data** - Photos, voice notes, etc.
5. **Enable real-time selectively** - Don't subscribe to everything
6. **Use transactions for related updates** - Maintain data integrity
7. **Regularly backup database** - Automated daily backups in Supabase
8. **Monitor query performance** - Use Supabase Dashboard
9. **Type safety with TypeScript** - Generate types from schema

---

**Supabase setup complete! 🗄️**

Your CPO app now has a powerful, scalable backend with real-time capabilities.
