-- ============================================================================
-- DAILY OCCURRENCE BOOK (DOB) SYSTEM - DATABASE SCHEMA
-- ============================================================================
--
-- Purpose: Digital replacement for traditional CPO logbooks
-- Compliance: SIA standards, BS 8507, GDPR
-- Features: Immutable entries, GPS tagging, chain of custody
--
-- Author: ArmoraCPO Development Team
-- Created: 2025-10-03
-- Version: 1.0
-- ============================================================================

-- ============================================================================
-- TABLE: daily_occurrence_book_entries
-- ============================================================================
-- Main table for DOB entries - chronological log of all operational events
-- Each entry is immutable once submitted for legal/compliance purposes
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_occurrence_book_entries (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Assignment context (optional - entries can exist outside assignments)
  assignment_id UUID REFERENCES protection_assignments(id) ON DELETE SET NULL,
  assignment_reference TEXT, -- Human-readable reference (e.g., "PA-20251003-001")

  -- CPO identification
  cpo_id UUID NOT NULL REFERENCES protection_officers(id) ON DELETE CASCADE,

  -- Entry classification
  entry_type TEXT NOT NULL CHECK (entry_type IN ('auto', 'manual')),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'assignment_start',
    'assignment_end',
    'location_change',
    'principal_pickup',
    'principal_dropoff',
    'route_deviation',
    'communication',
    'manual_note',
    'incident',
    'other'
  )),

  -- Temporal data
  timestamp TIMESTAMPTZ NOT NULL, -- When the event occurred

  -- Geospatial data (JSONB for flexibility with different GPS providers)
  gps_coordinates JSONB, -- { latitude, longitude, accuracy }

  -- Event description and context
  description TEXT NOT NULL,
  metadata JSONB, -- Additional context (weather, witnesses, equipment used, etc.)

  -- Immutability control
  is_immutable BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ, -- When entry was finalized and made immutable

  -- Audit trail
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES protection_officers(id),
  last_modified_by UUID REFERENCES protection_officers(id),

  -- Constraints
  CONSTRAINT valid_gps_coordinates CHECK (
    gps_coordinates IS NULL OR (
      gps_coordinates ? 'latitude' AND
      gps_coordinates ? 'longitude' AND
      (gps_coordinates->>'latitude')::float >= -90 AND
      (gps_coordinates->>'latitude')::float <= 90 AND
      (gps_coordinates->>'longitude')::float >= -180 AND
      (gps_coordinates->>'longitude')::float <= 180
    )
  ),
  CONSTRAINT timestamp_not_future CHECK (timestamp <= NOW() + INTERVAL '5 minutes'), -- Allow 5min clock skew
  CONSTRAINT immutable_submitted CHECK (
    (is_immutable = false AND submitted_at IS NULL) OR
    (is_immutable = true AND submitted_at IS NOT NULL)
  )
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Primary query patterns: by CPO, by assignment, by date range, by event type
CREATE INDEX idx_dob_cpo_id ON daily_occurrence_book_entries(cpo_id);
CREATE INDEX idx_dob_assignment_id ON daily_occurrence_book_entries(assignment_id) WHERE assignment_id IS NOT NULL;
CREATE INDEX idx_dob_timestamp ON daily_occurrence_book_entries(timestamp DESC);
CREATE INDEX idx_dob_event_type ON daily_occurrence_book_entries(event_type);
CREATE INDEX idx_dob_entry_type ON daily_occurrence_book_entries(entry_type);
CREATE INDEX idx_dob_immutable ON daily_occurrence_book_entries(is_immutable);

-- Composite index for common query: CPO's entries in date range
CREATE INDEX idx_dob_cpo_timestamp ON daily_occurrence_book_entries(cpo_id, timestamp DESC);

-- GIN index for metadata JSONB searches
CREATE INDEX idx_dob_metadata ON daily_occurrence_book_entries USING GIN(metadata);

-- Full-text search on description
CREATE INDEX idx_dob_description_search ON daily_occurrence_book_entries USING GIN(to_tsvector('english', description));

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE daily_occurrence_book_entries ENABLE ROW LEVEL SECURITY;

-- Policy: CPOs can view their own entries
CREATE POLICY dob_select_own_entries ON daily_occurrence_book_entries
  FOR SELECT
  USING (
    cpo_id = (SELECT id FROM protection_officers WHERE user_id = auth.uid())
  );

-- Policy: CPOs can insert their own entries
CREATE POLICY dob_insert_own_entries ON daily_occurrence_book_entries
  FOR INSERT
  WITH CHECK (
    cpo_id = (SELECT id FROM protection_officers WHERE user_id = auth.uid()) AND
    created_by = (SELECT id FROM protection_officers WHERE user_id = auth.uid())
  );

-- Policy: CPOs can update ONLY their own non-immutable entries
CREATE POLICY dob_update_own_entries ON daily_occurrence_book_entries
  FOR UPDATE
  USING (
    cpo_id = (SELECT id FROM protection_officers WHERE user_id = auth.uid()) AND
    is_immutable = false
  )
  WITH CHECK (
    cpo_id = (SELECT id FROM protection_officers WHERE user_id = auth.uid()) AND
    is_immutable = false
  );

-- Policy: NO DELETE allowed (retention compliance)
-- DOB entries must be retained for 7 years per SIA requirements
-- Deletion only via automated retention policy or admin override

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Prevent updates to immutable entries
CREATE OR REPLACE FUNCTION prevent_immutable_updates()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_immutable = true THEN
    RAISE EXCEPTION 'Cannot modify immutable DOB entry. Entry ID: %', OLD.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_immutable_updates
  BEFORE UPDATE ON daily_occurrence_book_entries
  FOR EACH ROW
  EXECUTE FUNCTION prevent_immutable_updates();

-- Trigger: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dob_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_dob_updated_at
  BEFORE UPDATE ON daily_occurrence_book_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_dob_updated_at();

-- Trigger: Set submitted_at when is_immutable is set to true
CREATE OR REPLACE FUNCTION set_dob_submitted_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_immutable = true AND OLD.is_immutable = false THEN
    NEW.submitted_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_dob_submitted_at
  BEFORE UPDATE ON daily_occurrence_book_entries
  FOR EACH ROW
  WHEN (OLD.is_immutable = false AND NEW.is_immutable = true)
  EXECUTE FUNCTION set_dob_submitted_at();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Get DOB entries for a CPO with filters
CREATE OR REPLACE FUNCTION get_dob_entries(
  p_cpo_id UUID,
  p_assignment_id UUID DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_entry_type TEXT DEFAULT NULL,
  p_event_type TEXT DEFAULT NULL,
  p_search_query TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  assignment_id UUID,
  assignment_reference TEXT,
  cpo_id UUID,
  entry_type TEXT,
  event_type TEXT,
  timestamp TIMESTAMPTZ,
  gps_coordinates JSONB,
  description TEXT,
  metadata JSONB,
  is_immutable BOOLEAN,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dob.id,
    dob.assignment_id,
    dob.assignment_reference,
    dob.cpo_id,
    dob.entry_type,
    dob.event_type,
    dob.timestamp,
    dob.gps_coordinates,
    dob.description,
    dob.metadata,
    dob.is_immutable,
    dob.submitted_at,
    dob.created_at,
    dob.updated_at
  FROM daily_occurrence_book_entries dob
  WHERE dob.cpo_id = p_cpo_id
    AND (p_assignment_id IS NULL OR dob.assignment_id = p_assignment_id)
    AND (p_start_date IS NULL OR dob.timestamp >= p_start_date)
    AND (p_end_date IS NULL OR dob.timestamp <= p_end_date)
    AND (p_entry_type IS NULL OR dob.entry_type = p_entry_type)
    AND (p_event_type IS NULL OR dob.event_type = p_event_type)
    AND (p_search_query IS NULL OR dob.description ILIKE '%' || p_search_query || '%')
  ORDER BY dob.timestamp DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get DOB statistics for a CPO
CREATE OR REPLACE FUNCTION get_dob_statistics(p_cpo_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  total_entries BIGINT,
  auto_entries BIGINT,
  manual_entries BIGINT,
  immutable_entries BIGINT,
  entries_by_event_type JSONB,
  recent_entries BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_entries,
    COUNT(*) FILTER (WHERE entry_type = 'auto')::BIGINT AS auto_entries,
    COUNT(*) FILTER (WHERE entry_type = 'manual')::BIGINT AS manual_entries,
    COUNT(*) FILTER (WHERE is_immutable = true)::BIGINT AS immutable_entries,
    jsonb_object_agg(
      event_type,
      cnt
    ) AS entries_by_event_type,
    COUNT(*) FILTER (WHERE timestamp >= NOW() - (p_days || ' days')::INTERVAL)::BIGINT AS recent_entries
  FROM (
    SELECT
      entry_type,
      event_type,
      timestamp,
      is_immutable,
      COUNT(*) OVER (PARTITION BY event_type) as cnt
    FROM daily_occurrence_book_entries
    WHERE cpo_id = p_cpo_id
  ) subquery
  GROUP BY total_entries, auto_entries, manual_entries, immutable_entries;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE daily_occurrence_book_entries IS
'Daily Occurrence Book (DOB) - Digital replacement for traditional CPO logbooks. All entries are GPS-tagged and become immutable once submitted for legal/compliance purposes.';

COMMENT ON COLUMN daily_occurrence_book_entries.is_immutable IS
'Once true, entry cannot be modified. Required for legal admissibility and chain of custody.';

COMMENT ON COLUMN daily_occurrence_book_entries.gps_coordinates IS
'JSONB storing { latitude, longitude, accuracy }. Validates coordinates are within valid ranges.';

COMMENT ON COLUMN daily_occurrence_book_entries.metadata IS
'Additional context such as weather conditions, witnesses present, equipment used, etc.';

COMMENT ON COLUMN daily_occurrence_book_entries.timestamp IS
'When the event occurred (not when it was logged). Cannot be in the future beyond 5min clock skew.';

-- ============================================================================
-- SAMPLE DATA (FOR DEVELOPMENT/TESTING ONLY)
-- ============================================================================

-- Uncomment to insert sample data
/*
INSERT INTO daily_occurrence_book_entries (
  cpo_id,
  entry_type,
  event_type,
  timestamp,
  gps_coordinates,
  description,
  metadata,
  is_immutable,
  created_by
) VALUES (
  'cpo-uuid-here',
  'auto',
  'assignment_start',
  NOW() - INTERVAL '2 hours',
  '{"latitude": 51.5074, "longitude": -0.1278, "accuracy": 10}'::JSONB,
  'Protection detail commenced at principal residence',
  '{"weather": "clear", "temperature": 15, "equipment": ["radio", "body_camera"]}'::JSONB,
  true,
  'cpo-uuid-here'
);
*/

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
