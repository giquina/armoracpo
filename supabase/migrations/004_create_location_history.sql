-- Migration: Create location_history table for GPS tracking
-- Description: Stores GPS location data for active assignments
-- Created: 2025-10-08

-- Create location_history table
CREATE TABLE IF NOT EXISTS public.location_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.protection_assignments(id) ON DELETE CASCADE,
  cpo_id uuid NOT NULL REFERENCES public.protection_officers(id) ON DELETE CASCADE,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  accuracy double precision NOT NULL,
  altitude double precision,
  heading double precision,
  speed double precision,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_location_history_assignment_id ON public.location_history(assignment_id);
CREATE INDEX IF NOT EXISTS idx_location_history_cpo_id ON public.location_history(cpo_id);
CREATE INDEX IF NOT EXISTS idx_location_history_timestamp ON public.location_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_location_history_assignment_timestamp ON public.location_history(assignment_id, timestamp DESC);

-- Enable Row Level Security
ALTER TABLE public.location_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: CPOs can view their own location history
CREATE POLICY "CPOs can view their own location history"
  ON public.location_history
  FOR SELECT
  USING (
    cpo_id IN (
      SELECT id FROM public.protection_officers
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: CPOs can insert their own location data
CREATE POLICY "CPOs can insert their own location data"
  ON public.location_history
  FOR INSERT
  WITH CHECK (
    cpo_id IN (
      SELECT id FROM public.protection_officers
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Clients can view location history for their assignments
CREATE POLICY "Clients can view location history for their assignments"
  ON public.location_history
  FOR SELECT
  USING (
    assignment_id IN (
      SELECT id FROM public.protection_assignments
      WHERE client_id = auth.uid()
    )
  );

-- Add comment to table
COMMENT ON TABLE public.location_history IS 'GPS location tracking data for active protection assignments';

-- Add comments to columns
COMMENT ON COLUMN public.location_history.assignment_id IS 'Reference to the active assignment';
COMMENT ON COLUMN public.location_history.cpo_id IS 'Reference to the protection officer';
COMMENT ON COLUMN public.location_history.latitude IS 'GPS latitude in decimal degrees';
COMMENT ON COLUMN public.location_history.longitude IS 'GPS longitude in decimal degrees';
COMMENT ON COLUMN public.location_history.accuracy IS 'Location accuracy in meters';
COMMENT ON COLUMN public.location_history.altitude IS 'Altitude in meters (optional)';
COMMENT ON COLUMN public.location_history.heading IS 'Direction of travel in degrees (0-360, optional)';
COMMENT ON COLUMN public.location_history.speed IS 'Speed in meters per second (optional)';
COMMENT ON COLUMN public.location_history.timestamp IS 'When the location was recorded';
COMMENT ON COLUMN public.location_history.created_at IS 'When this record was inserted into the database';
