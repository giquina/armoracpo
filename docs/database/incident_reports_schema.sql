-- =====================================================
-- INCIDENT REPORTING SYSTEM - DATABASE SCHEMA
-- =====================================================
-- This schema creates the tables for the comprehensive
-- incident reporting system with GPS verification,
-- media evidence, chain of custody, and signatures.
-- =====================================================

-- Create incident_reports table
CREATE TABLE IF NOT EXISTS incident_reports (
  -- Core identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_number VARCHAR(50) UNIQUE NOT NULL, -- Format: "IR-YYYYMMDD-XXXX"

  -- Assignment context
  assignment_id UUID REFERENCES protection_assignments(id) ON DELETE SET NULL,
  assignment_reference VARCHAR(50),

  -- Classification and severity
  classification VARCHAR(50) NOT NULL CHECK (classification IN (
    'security_breach', 'threat_verbal', 'threat_physical', 'suspicious_activity',
    'medical_emergency', 'accident', 'equipment_failure', 'protocol_deviation',
    'environmental', 'lost_property', 'privacy_breach', 'communication_failure', 'other'
  )),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'informational')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'archived')),

  -- Temporal data
  incident_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  reported_datetime TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  submitted_datetime TIMESTAMP WITH TIME ZONE,

  -- Location data (JSONB for flexibility)
  location JSONB NOT NULL, -- { address, city, postcode, coordinates, venue, venueType }

  -- Reporting officer
  reporting_officer JSONB NOT NULL, -- { officerId, officerName, siaLicenseNumber, officerPhone, officerEmail }

  -- Principal details (encrypted JSONB)
  principal_details JSONB, -- { principalId, injuryStatus, injuryDescription, medicalAttentionRequired, medicalAttentionDetails }

  -- Incident description
  description JSONB NOT NULL, -- { summary, detailedNarrative, triggerFactors, outcome }

  -- Suspect details
  suspect_details JSONB, -- { count, descriptions, identifications, vehicleDescriptions, vehicleRegistrations, weaponsOrTools, directionsOfFlight }

  -- Witnesses (array of witness objects)
  witnesses JSONB DEFAULT '[]'::jsonb,

  -- Environmental conditions
  environmental_conditions JSONB NOT NULL, -- { weather, visibility, lighting, crowdLevel, noiseLevel }

  -- Actions taken
  immediate_actions JSONB DEFAULT '[]'::jsonb, -- Array of action objects
  communications_log JSONB DEFAULT '[]'::jsonb, -- Array of communication objects

  -- Equipment and resources
  equipment_used TEXT[] DEFAULT ARRAY[]::TEXT[],
  equipment_failures TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Law enforcement
  law_enforcement JSONB, -- { reported, forceName, stationName, officerName, officerBadgeNumber, crimeReferenceNumber, arrestsMade, evidenceCollected, followUpRequired, responseTime }

  -- Media and evidence
  media_attachments JSONB DEFAULT '[]'::jsonb, -- Array of media attachment objects with chain of custody
  additional_evidence TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Signatures (digital)
  signatures JSONB DEFAULT '[]'::jsonb, -- Array of signature objects

  -- Follow-up actions
  follow_up_actions JSONB DEFAULT '[]'::jsonb,
  review_required BOOLEAN DEFAULT false,
  management_notified BOOLEAN DEFAULT false,
  management_notified_at TIMESTAMP WITH TIME ZONE,

  -- Lessons learned and recommendations
  lessons_learned TEXT,
  protocol_recommendations TEXT,
  training_recommendations TEXT,

  -- Audit trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES protection_officers(id) ON DELETE SET NULL,
  last_modified_by UUID REFERENCES protection_officers(id) ON DELETE SET NULL,
  submitted_by UUID REFERENCES protection_officers(id) ON DELETE SET NULL,

  -- Data classification and retention
  data_classification VARCHAR(20) DEFAULT 'internal' CHECK (data_classification IN ('public', 'internal', 'confidential', 'restricted')),
  retention_period VARCHAR(20) DEFAULT 'standard' CHECK (retention_period IN ('standard', 'extended', 'permanent')),

  -- GDPR compliance
  gdpr_consent JSONB, -- { principalConsent, witnessConsent, consentObtainedAt }

  -- Export tracking
  exported BOOLEAN DEFAULT false,
  exported_at TIMESTAMP WITH TIME ZONE,
  exported_by UUID REFERENCES protection_officers(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_incident_reports_incident_number ON incident_reports(incident_number);
CREATE INDEX idx_incident_reports_assignment_id ON incident_reports(assignment_id);
CREATE INDEX idx_incident_reports_created_by ON incident_reports(created_by);
CREATE INDEX idx_incident_reports_incident_datetime ON incident_reports(incident_datetime DESC);
CREATE INDEX idx_incident_reports_severity ON incident_reports(severity);
CREATE INDEX idx_incident_reports_status ON incident_reports(status);
CREATE INDEX idx_incident_reports_classification ON incident_reports(classification);
CREATE INDEX idx_incident_reports_review_required ON incident_reports(review_required) WHERE review_required = true;

-- Create GIN index for JSONB columns for faster queries
CREATE INDEX idx_incident_reports_location_gin ON incident_reports USING GIN (location);
CREATE INDEX idx_incident_reports_witnesses_gin ON incident_reports USING GIN (witnesses);
CREATE INDEX idx_incident_reports_media_gin ON incident_reports USING GIN (media_attachments);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_incident_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_incident_reports_updated_at
  BEFORE UPDATE ON incident_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_incident_reports_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;

-- CPOs can view their own incident reports
CREATE POLICY "CPOs can view their own incident reports"
  ON incident_reports
  FOR SELECT
  USING (created_by = auth.uid());

-- CPOs can create incident reports
CREATE POLICY "CPOs can create incident reports"
  ON incident_reports
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- CPOs can update their own draft or submitted reports
CREATE POLICY "CPOs can update their own reports"
  ON incident_reports
  FOR UPDATE
  USING (created_by = auth.uid() AND status IN ('draft', 'submitted'))
  WITH CHECK (created_by = auth.uid());

-- CPOs can delete their own draft reports
CREATE POLICY "CPOs can delete draft reports"
  ON incident_reports
  FOR DELETE
  USING (created_by = auth.uid() AND status = 'draft');

-- =====================================================
-- STORAGE BUCKET FOR INCIDENT MEDIA
-- =====================================================

-- Create storage bucket for incident report media
INSERT INTO storage.buckets (id, name, public)
VALUES ('incident-reports', 'incident-reports', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for incident media
CREATE POLICY "CPOs can upload incident media"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'incident-reports' AND auth.role() = 'authenticated');

CREATE POLICY "CPOs can view incident media"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'incident-reports' AND auth.role() = 'authenticated');

CREATE POLICY "CPOs can update incident media"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'incident-reports' AND auth.role() = 'authenticated');

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to generate incident number
CREATE OR REPLACE FUNCTION generate_incident_number()
RETURNS TEXT AS $$
DECLARE
  current_date TEXT;
  sequence_num TEXT;
  incident_num TEXT;
BEGIN
  current_date := TO_CHAR(NOW(), 'YYYYMMDD');

  -- Get next sequence number for today
  SELECT LPAD(
    (COUNT(*) + 1)::TEXT,
    4,
    '0'
  ) INTO sequence_num
  FROM incident_reports
  WHERE incident_number LIKE 'IR-' || current_date || '-%';

  incident_num := 'IR-' || current_date || '-' || sequence_num;

  RETURN incident_num;
END;
$$ LANGUAGE plpgsql;

-- Function to get incident reports with filters
CREATE OR REPLACE FUNCTION get_incident_reports_filtered(
  p_cpo_id UUID,
  p_status TEXT DEFAULT NULL,
  p_severity TEXT[] DEFAULT NULL,
  p_classification TEXT[] DEFAULT NULL,
  p_date_start TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_date_end TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  incident_number VARCHAR(50),
  classification VARCHAR(50),
  severity VARCHAR(20),
  status VARCHAR(20),
  incident_datetime TIMESTAMP WITH TIME ZONE,
  location JSONB,
  description JSONB,
  media_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ir.id,
    ir.incident_number,
    ir.classification,
    ir.severity,
    ir.status,
    ir.incident_datetime,
    ir.location,
    ir.description,
    jsonb_array_length(ir.media_attachments) AS media_count,
    ir.created_at
  FROM incident_reports ir
  WHERE ir.created_by = p_cpo_id
    AND (p_status IS NULL OR ir.status = p_status)
    AND (p_severity IS NULL OR ir.severity = ANY(p_severity))
    AND (p_classification IS NULL OR ir.classification = ANY(p_classification))
    AND (p_date_start IS NULL OR ir.incident_datetime >= p_date_start)
    AND (p_date_end IS NULL OR ir.incident_datetime <= p_date_end)
  ORDER BY ir.incident_datetime DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get incident statistics
CREATE OR REPLACE FUNCTION get_incident_statistics(p_cpo_id UUID)
RETURNS TABLE (
  total_incidents BIGINT,
  critical_incidents BIGINT,
  high_incidents BIGINT,
  pending_review BIGINT,
  with_media BIGINT,
  avg_response_time_minutes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_incidents,
    COUNT(*) FILTER (WHERE severity = 'critical')::BIGINT AS critical_incidents,
    COUNT(*) FILTER (WHERE severity = 'high')::BIGINT AS high_incidents,
    COUNT(*) FILTER (WHERE review_required = true AND status != 'approved')::BIGINT AS pending_review,
    COUNT(*) FILTER (WHERE jsonb_array_length(media_attachments) > 0)::BIGINT AS with_media,
    AVG(
      EXTRACT(EPOCH FROM (reported_datetime - incident_datetime)) / 60
    )::INTEGER AS avg_response_time_minutes
  FROM incident_reports
  WHERE created_by = p_cpo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE incident_reports IS 'Comprehensive incident reporting system for CPO security incidents with GPS verification, media evidence, chain of custody, and digital signatures';
COMMENT ON COLUMN incident_reports.incident_number IS 'Unique incident reference number in format IR-YYYYMMDD-XXXX';
COMMENT ON COLUMN incident_reports.location IS 'Location data including address, GPS coordinates with accuracy, venue details';
COMMENT ON COLUMN incident_reports.media_attachments IS 'Array of media attachments (photos/videos) with chain of custody tracking';
COMMENT ON COLUMN incident_reports.signatures IS 'Digital signatures with timestamp, IP, and device info for legal admissibility';
COMMENT ON COLUMN incident_reports.data_classification IS 'Data sensitivity level for access control and retention';
COMMENT ON COLUMN incident_reports.retention_period IS 'How long to retain the report (standard=7yrs, extended=25yrs, permanent=forever)';

-- =====================================================
-- SAMPLE DATA (for development/testing only)
-- =====================================================

-- Note: Do not run this in production
-- This is example data structure only

/*
INSERT INTO incident_reports (
  incident_number,
  classification,
  severity,
  status,
  incident_datetime,
  location,
  reporting_officer,
  description,
  environmental_conditions,
  created_by
) VALUES (
  'IR-20251003-0001',
  'suspicious_activity',
  'medium',
  'submitted',
  '2025-10-03 14:30:00+00',
  '{"address": "123 High Street", "city": "London", "postcode": "SW1A 1AA", "coordinates": {"latitude": 51.5074, "longitude": -0.1278, "accuracy": 10}, "venue": "Corporate Office", "venueType": "office"}',
  '{"officerId": "uuid-here", "officerName": "John Smith", "siaLicenseNumber": "SIA123456", "officerPhone": "+447700900123", "officerEmail": "john.smith@armora.com"}',
  '{"summary": "Suspicious individual observed near principal vehicle", "detailedNarrative": "At approximately 14:30, I observed an unidentified male...", "outcome": "Individual left area after being approached"}',
  '{"weather": "clear", "visibility": "good", "lighting": "daylight", "crowdLevel": "light"}',
  'uuid-of-cpo-here'
);
*/
