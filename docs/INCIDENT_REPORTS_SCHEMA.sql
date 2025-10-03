-- ============================================================================
-- ArmoraCPO Incident Reporting System - Database Schema
-- ============================================================================
-- Description: Complete database schema for SIA-compliant incident reporting
-- Author: Claude Code AI
-- Date: 2025-10-03
-- Version: 1.0
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: incident_reports
-- ============================================================================
-- Description: Stores detailed incident reports created by CPOs
-- Compliance: SIA requirements, GDPR Article 5, Chain of Custody standards
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.incident_reports (
  -- Primary Identifiers
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_number TEXT UNIQUE NOT NULL,

  -- Assignment References
  assignment_id UUID REFERENCES public.protection_assignments(id) ON DELETE SET NULL,
  assignment_reference TEXT,

  -- Classification
  classification TEXT NOT NULL CHECK (classification IN (
    'security_breach',
    'threat_verbal',
    'threat_physical',
    'suspicious_activity',
    'medical_emergency',
    'accident',
    'equipment_failure',
    'protocol_deviation',
    'environmental',
    'lost_property',
    'privacy_breach',
    'communication_failure',
    'other'
  )),

  severity TEXT NOT NULL CHECK (severity IN (
    'critical',
    'high',
    'medium',
    'low',
    'informational'
  )),

  status TEXT NOT NULL CHECK (status IN (
    'draft',
    'submitted',
    'under_review',
    'investigated',
    'resolved',
    'escalated',
    'closed'
  )) DEFAULT 'draft',

  -- Timestamps
  incident_datetime TIMESTAMPTZ NOT NULL,
  reported_datetime TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_datetime TIMESTAMPTZ,

  -- Location Information (JSONB for flexibility)
  -- Structure: {
  --   address: string,
  --   city: string,
  --   postcode?: string,
  --   country?: string,
  --   coordinates: { latitude: number, longitude: number, accuracy: number },
  --   venue?: string,
  --   venueType?: string
  -- }
  location JSONB NOT NULL,

  -- Reporting Officer (JSONB)
  -- Structure: {
  --   officerId: string,
  --   officerName: string,
  --   siaLicenseNumber: string,
  --   officerPhone: string,
  --   officerEmail: string
  -- }
  reporting_officer JSONB NOT NULL,

  -- Principal Details (JSONB - optional, only if principal involved)
  -- Structure: {
  --   principalId: string,
  --   injuryStatus: 'none' | 'minor' | 'moderate' | 'severe' | 'critical',
  --   injuryDescription?: string,
  --   medicalAttentionRequired?: boolean,
  --   medicalAttentionDetails?: string
  -- }
  principal_details JSONB,

  -- Incident Description (JSONB)
  -- Structure: {
  --   summary: string,
  --   detailedNarrative: string,
  --   triggerFactors?: string,
  --   outcome: string
  -- }
  description JSONB NOT NULL,

  -- Suspect Details (JSONB - optional)
  -- Structure: {
  --   description: string,
  --   clothing?: string,
  --   vehicle?: string,
  --   weapons?: string,
  --   direction?: string
  -- }
  suspect_details JSONB,

  -- Witnesses (Array of JSONB)
  -- Each element: {
  --   id: string,
  --   name: string,
  --   relationship: string,
  --   contactPhone?: string,
  --   contactEmail?: string,
  --   statement: string,
  --   willingToTestify: boolean
  -- }
  witnesses JSONB[] DEFAULT '{}',

  -- Environmental Conditions (JSONB)
  -- Structure: {
  --   weather: string,
  --   visibility: string,
  --   lighting: string,
  --   crowdLevel: string,
  --   noiseLevel?: string
  -- }
  environmental_conditions JSONB,

  -- Immediate Actions Taken (Array of JSONB)
  -- Each element: {
  --   id: string,
  --   timestamp: string,
  --   action: string,
  --   result?: string,
  --   performedBy: string
  -- }
  immediate_actions JSONB[] DEFAULT '{}',

  -- Communications Log (Array of JSONB)
  -- Each element: {
  --   id: string,
  --   timestamp: string,
  --   contactType: string,
  --   contactedParty: string,
  --   method: string,
  --   details: string
  -- }
  communications_log JSONB[] DEFAULT '{}',

  -- Equipment (Text Arrays)
  equipment_used TEXT[] DEFAULT '{}',
  equipment_failures TEXT[] DEFAULT '{}',

  -- Law Enforcement (JSONB - optional)
  -- Structure: {
  --   reported: boolean,
  --   forceName?: string,
  --   stationName?: string,
  --   officerName?: string,
  --   officerBadgeNumber?: string,
  --   crimeReferenceNumber?: string,
  --   responseTime?: number,
  --   arrestsMade?: boolean,
  --   evidenceCollected?: string[],
  --   followUpRequired?: boolean
  -- }
  law_enforcement JSONB,

  -- Media Attachments (Array of JSONB)
  -- Each element: {
  --   id: string,
  --   type: 'photo' | 'video' | 'audio' | 'document',
  --   url: string,
  --   thumbnail?: string,
  --   filename: string,
  --   fileSize: number,
  --   mimeType: string,
  --   duration?: number,
  --   gpsData: { latitude, longitude, accuracy, timestamp, address },
  --   metadata: { capturedAt, capturedBy, deviceInfo, fileHash },
  --   chainOfCustody: [{ id, timestamp, action, performedBy, details, location }]
  -- }
  media_attachments JSONB[] DEFAULT '{}',

  -- Additional Evidence (Array of JSONB)
  additional_evidence JSONB[] DEFAULT '{}',

  -- Digital Signatures (Array of JSONB)
  -- Each element: {
  --   id: string,
  --   signatureData: string (base64),
  --   signedBy: { userId, userName, role },
  --   signedAt: string,
  --   ipAddress: string,
  --   location: { latitude, longitude, accuracy },
  --   deviceInfo: string,
  --   statement: string
  -- }
  signatures JSONB[] DEFAULT '{}',

  -- Follow-up Actions (Array of JSONB)
  -- Each element: {
  --   id: string,
  --   action: string,
  --   assignedTo?: string,
  --   dueDate?: string,
  --   status: string,
  --   completedAt?: string,
  --   notes?: string
  -- }
  follow_up_actions JSONB[] DEFAULT '{}',

  -- Management & Review
  review_required BOOLEAN DEFAULT false,
  management_notified BOOLEAN DEFAULT false,
  management_notified_at TIMESTAMPTZ,

  -- Lessons Learned
  lessons_learned TEXT,
  protocol_recommendations TEXT,
  training_recommendations TEXT,

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID NOT NULL REFERENCES public.protection_officers(id) ON DELETE RESTRICT,
  last_modified_by UUID REFERENCES public.protection_officers(id) ON DELETE SET NULL,
  submitted_by UUID REFERENCES public.protection_officers(id) ON DELETE SET NULL,

  -- Data Governance (GDPR)
  data_classification TEXT DEFAULT 'internal' CHECK (data_classification IN (
    'public',
    'internal',
    'confidential',
    'restricted'
  )),

  retention_period TEXT DEFAULT 'standard' CHECK (retention_period IN (
    'standard',    -- 7 years
    'extended',    -- 10 years (for critical incidents)
    'permanent'    -- Never delete (legal proceedings)
  )),

  -- GDPR Consent (JSONB)
  -- Structure: {
  --   principalConsent?: boolean,
  --   witnessConsent?: boolean[],
  --   consentObtainedAt: string
  -- }
  gdpr_consent JSONB,

  -- Export Tracking
  exported BOOLEAN DEFAULT false,
  exported_at TIMESTAMPTZ,
  exported_by UUID REFERENCES public.protection_officers(id) ON DELETE SET NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Performance indexes for common queries
CREATE INDEX IF NOT EXISTS idx_incident_reports_created_by ON public.incident_reports(created_by);
CREATE INDEX IF NOT EXISTS idx_incident_reports_assignment_id ON public.incident_reports(assignment_id);
CREATE INDEX IF NOT EXISTS idx_incident_reports_incident_datetime ON public.incident_reports(incident_datetime DESC);
CREATE INDEX IF NOT EXISTS idx_incident_reports_status ON public.incident_reports(status);
CREATE INDEX IF NOT EXISTS idx_incident_reports_severity ON public.incident_reports(severity);
CREATE INDEX IF NOT EXISTS idx_incident_reports_classification ON public.incident_reports(classification);
CREATE INDEX IF NOT EXISTS idx_incident_reports_created_at ON public.incident_reports(created_at DESC);

-- Full-text search index on incident number
CREATE INDEX IF NOT EXISTS idx_incident_reports_incident_number ON public.incident_reports USING btree(incident_number);

-- GIN indexes for JSONB queries
CREATE INDEX IF NOT EXISTS idx_incident_reports_location ON public.incident_reports USING gin(location);
CREATE INDEX IF NOT EXISTS idx_incident_reports_description ON public.incident_reports USING gin(description);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_incident_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_incident_reports_updated_at
  BEFORE UPDATE ON public.incident_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_incident_reports_updated_at();

-- Auto-generate incident number if not provided
CREATE OR REPLACE FUNCTION generate_incident_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.incident_number IS NULL OR NEW.incident_number = '' THEN
    -- Format: IR-YYYYMMDD-NNNN
    NEW.incident_number := 'IR-' ||
                          TO_CHAR(NEW.incident_datetime, 'YYYYMMDD') || '-' ||
                          LPAD(NEXTVAL('incident_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for incident numbers
CREATE SEQUENCE IF NOT EXISTS incident_number_seq START 1;

CREATE TRIGGER trigger_generate_incident_number
  BEFORE INSERT ON public.incident_reports
  FOR EACH ROW
  EXECUTE FUNCTION generate_incident_number();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on the table
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;

-- Policy: CPOs can only view their own incident reports
CREATE POLICY "CPOs can view own incident reports"
  ON public.incident_reports
  FOR SELECT
  USING (created_by = auth.uid());

-- Policy: CPOs can insert their own incident reports
CREATE POLICY "CPOs can insert own incident reports"
  ON public.incident_reports
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Policy: CPOs can update their own incident reports
CREATE POLICY "CPOs can update own incident reports"
  ON public.incident_reports
  FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Policy: CPOs can delete ONLY draft incident reports (soft delete recommended)
CREATE POLICY "CPOs can delete own draft incident reports"
  ON public.incident_reports
  FOR DELETE
  USING (created_by = auth.uid() AND status = 'draft');

-- Policy: Managers can view all incident reports (optional - comment out if not needed)
-- CREATE POLICY "Managers can view all incident reports"
--   ON public.incident_reports
--   FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM public.managers
--       WHERE managers.auth_user_id = auth.uid()
--     )
--   );

-- ============================================================================
-- SUPABASE STORAGE
-- ============================================================================

-- Create storage bucket for incident media
INSERT INTO storage.buckets (id, name, public)
VALUES ('incident-reports', 'incident-reports', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies

-- CPOs can upload to their own folder
CREATE POLICY "CPOs can upload to own incident folder"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'incident-reports' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- CPOs can view their own incident media
CREATE POLICY "CPOs can view own incident media"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'incident-reports' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- CPOs can update their own incident media metadata
CREATE POLICY "CPOs can update own incident media"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'incident-reports' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'incident-reports' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- CPOs can delete their own incident media (only for drafts - enforce in application)
CREATE POLICY "CPOs can delete own incident media"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'incident-reports' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get incident report statistics for a CPO
CREATE OR REPLACE FUNCTION get_incident_statistics(cpo_id UUID)
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'totalIncidents', COUNT(*),
    'criticalIncidents', COUNT(*) FILTER (WHERE severity = 'critical'),
    'highIncidents', COUNT(*) FILTER (WHERE severity = 'high'),
    'pendingReview', COUNT(*) FILTER (WHERE status = 'submitted' OR status = 'under_review'),
    'requiresFollowUp', COUNT(*) FILTER (WHERE review_required = true),
    'avgResolutionDays', AVG(
      CASE
        WHEN status = 'resolved' AND submitted_datetime IS NOT NULL
        THEN EXTRACT(EPOCH FROM (updated_at - submitted_datetime)) / 86400
        ELSE NULL
      END
    )
  ) INTO stats
  FROM public.incident_reports
  WHERE created_by = cpo_id;

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DATA MIGRATION (Optional)
-- ============================================================================

-- If migrating from old schema, add migration SQL here
-- Example:
-- INSERT INTO public.incident_reports (...)
-- SELECT ... FROM old_incidents_table;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify table creation
-- SELECT * FROM public.incident_reports LIMIT 1;

-- Verify indexes
-- SELECT indexname FROM pg_indexes WHERE tablename = 'incident_reports';

-- Verify RLS policies
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'incident_reports';

-- Verify storage bucket
-- SELECT * FROM storage.buckets WHERE id = 'incident-reports';

-- ============================================================================
-- NOTES
-- ============================================================================

-- 1. Incident numbers are auto-generated in format: IR-YYYYMMDD-NNNN
--    Example: IR-20251003-0001
--
-- 2. All JSONB fields support flexible schema evolution without migrations
--
-- 3. Chain of custody is maintained in media_attachments JSONB array
--
-- 4. GPS coordinates are stored in multiple places:
--    - location.coordinates (incident location)
--    - media_attachments[].gpsData (media capture location)
--    - signatures[].location (signature capture location)
--
-- 5. GDPR compliance:
--    - Data classification enforced
--    - Retention periods tracked
--    - Consent records stored
--    - Right to deletion via application logic (not direct DELETE)
--
-- 6. Security:
--    - RLS enforces CPO can only access own reports
--    - Storage policies prevent cross-CPO access
--    - File paths in storage: /{cpo_id}/{incident_id}/{filename}
--
-- 7. Performance:
--    - Indexes on common query fields
--    - GIN indexes for JSONB full-text search
--    - Timestamps indexed for date-range queries
--
-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
