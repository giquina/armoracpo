# Supabase Migration Guide: Location History Table

This guide provides step-by-step instructions for running the `004_create_location_history.sql` migration in your Supabase project.

## Overview

**Migration:** `004_create_location_history.sql`
**Purpose:** Create GPS location tracking table for active protection assignments
**Created:** 2025-10-08

This migration creates the `location_history` table with proper indexes and Row Level Security (RLS) policies to enable real-time GPS tracking for CPOs during active assignments.

## What This Migration Does

1. Creates `location_history` table with GPS tracking fields
2. Adds 4 performance indexes for efficient querying
3. Enables Row Level Security (RLS)
4. Creates 3 RLS policies:
   - CPOs can view their own location history
   - CPOs can insert their own location data
   - Clients can view location history for their assignments
5. Adds documentation comments to table and columns

## Prerequisites

- Access to Supabase Dashboard (https://app.supabase.com)
- Project admin or owner role
- Tables `protection_assignments` and `protection_officers` must already exist

## Step-by-Step Migration Instructions

### Step 1: Access Supabase SQL Editor

1. Log in to [Supabase Dashboard](https://app.supabase.com)
2. Select your Armora CPO project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New query** button

### Step 2: Copy and Paste Migration SQL

Copy the entire SQL script below and paste it into the SQL editor:

```sql
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
```

### Step 3: Run the Migration

1. Review the SQL to ensure it matches your expectations
2. Click the **Run** button (or press `Ctrl+Enter` / `Cmd+Enter`)
3. Wait for the query to execute (should take 1-3 seconds)
4. Check for success message: "Success. No rows returned"

### Step 4: Verify Table Creation

Run the verification queries below to confirm the migration was successful.

#### Verify Table Exists

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'location_history'
) as table_exists;
```

**Expected Result:** `table_exists: true`

#### Verify Column Structure

```sql
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'location_history'
ORDER BY ordinal_position;
```

**Expected Result:** 11 columns (id, assignment_id, cpo_id, latitude, longitude, accuracy, altitude, heading, speed, timestamp, created_at)

#### Verify Indexes

```sql
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'location_history'
ORDER BY indexname;
```

**Expected Result:** 5 indexes total
- `location_history_pkey` (PRIMARY KEY on id)
- `idx_location_history_assignment_id`
- `idx_location_history_assignment_timestamp`
- `idx_location_history_cpo_id`
- `idx_location_history_timestamp`

#### Verify RLS is Enabled

```sql
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'location_history';
```

**Expected Result:** `rowsecurity: true`

#### Verify RLS Policies

```sql
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'location_history'
ORDER BY policyname;
```

**Expected Result:** 3 policies
- `CPOs can insert their own location data` (cmd: INSERT)
- `CPOs can view their own location history` (cmd: SELECT)
- `Clients can view location history for their assignments` (cmd: SELECT)

## Testing RLS Policies

### Test 1: CPO Can Insert Own Location Data

As an authenticated CPO user, test inserting location data:

```sql
-- First, get a valid assignment_id and cpo_id from your database
SELECT id as assignment_id FROM public.protection_assignments LIMIT 1;
SELECT id as cpo_id FROM public.protection_officers WHERE user_id = auth.uid() LIMIT 1;

-- Then insert a test location (replace UUIDs with actual values)
INSERT INTO public.location_history (
  assignment_id,
  cpo_id,
  latitude,
  longitude,
  accuracy
) VALUES (
  'REPLACE_WITH_ASSIGNMENT_ID',
  'REPLACE_WITH_CPO_ID',
  51.5074,  -- London latitude
  -0.1278,  -- London longitude
  10.5      -- 10.5 meters accuracy
);

-- Verify insertion
SELECT * FROM public.location_history ORDER BY created_at DESC LIMIT 1;
```

**Expected Result:** Row inserted successfully, returned in SELECT query

### Test 2: CPO Can View Own Location History

```sql
-- As authenticated CPO
SELECT
  id,
  assignment_id,
  latitude,
  longitude,
  accuracy,
  timestamp
FROM public.location_history
ORDER BY timestamp DESC
LIMIT 10;
```

**Expected Result:** CPO sees only their own location records

### Test 3: Verify Foreign Key Constraints

```sql
-- This should fail due to invalid assignment_id
INSERT INTO public.location_history (
  assignment_id,
  cpo_id,
  latitude,
  longitude,
  accuracy
) VALUES (
  '00000000-0000-0000-0000-000000000000',  -- Invalid UUID
  'REPLACE_WITH_VALID_CPO_ID',
  51.5074,
  -0.1278,
  10.5
);
```

**Expected Result:** Error - foreign key constraint violation

## Rollback Instructions

If you need to rollback this migration, run the following SQL:

```sql
-- Drop RLS policies first
DROP POLICY IF EXISTS "Clients can view location history for their assignments" ON public.location_history;
DROP POLICY IF EXISTS "CPOs can insert their own location data" ON public.location_history;
DROP POLICY IF EXISTS "CPOs can view their own location history" ON public.location_history;

-- Drop indexes (will be dropped automatically with table, but explicit for clarity)
DROP INDEX IF EXISTS public.idx_location_history_assignment_timestamp;
DROP INDEX IF EXISTS public.idx_location_history_timestamp;
DROP INDEX IF EXISTS public.idx_location_history_cpo_id;
DROP INDEX IF EXISTS public.idx_location_history_assignment_id;

-- Drop table (CASCADE will handle foreign key references)
DROP TABLE IF EXISTS public.location_history CASCADE;
```

**WARNING:** This will permanently delete all location history data. Make sure to back up data first if needed.

## Verification Checklist

Use this checklist to confirm the migration was successful:

- [ ] Table `location_history` exists in public schema
- [ ] All 11 columns are present with correct data types
- [ ] 5 indexes are created (1 primary key + 4 performance indexes)
- [ ] RLS is enabled on the table
- [ ] 3 RLS policies are active
- [ ] Foreign key constraints to `protection_assignments` and `protection_officers` work
- [ ] Test insert succeeds as authenticated CPO
- [ ] Test select returns only authorized records
- [ ] Table and column comments are visible

## Troubleshooting

### Error: relation "protection_assignments" does not exist

**Cause:** Required parent tables are not yet created
**Solution:** Run migrations in order - this is migration 004, ensure 001-003 are complete

### Error: permission denied for schema public

**Cause:** Insufficient database permissions
**Solution:** Ensure you're logged in as project owner or have been granted necessary permissions

### RLS Policies Not Working

**Cause:** User authentication context not set
**Solution:** Ensure queries are run in authenticated context (use Supabase client in app, not direct SQL as admin)

### Slow Query Performance

**Cause:** Missing indexes or large dataset
**Solution:** Verify all 4 indexes exist using the verification query above. Consider adding composite indexes if specific query patterns emerge.

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Foreign Keys](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)
- [GPS Coordinate Systems](https://en.wikipedia.org/wiki/Geographic_coordinate_system)

## Next Steps

After successful migration:

1. Update TypeScript types in `src/types/database.types.ts` to include `location_history` table
2. Create `locationHistoryService.ts` in `src/services/` for CRUD operations
3. Implement real-time location tracking in `ActiveJob.tsx` component
4. Add location history visualization in client/coordinator views
5. Test real-time Supabase subscriptions for live location updates

## Support

If you encounter issues during migration:

1. Check Supabase logs in Dashboard > Logs
2. Verify prerequisite tables exist
3. Review error messages carefully
4. Consult [Supabase Community](https://github.com/supabase/supabase/discussions)

---

**Migration Status:** Ready to deploy
**Last Updated:** 2025-10-08
**Prepared By:** Claude Code
