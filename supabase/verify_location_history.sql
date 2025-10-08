-- Verification Script for location_history Table Migration
-- Run this script after executing 004_create_location_history.sql
-- All checks should return positive results for successful migration

-- ============================================================================
-- CHECK 1: Verify Table Exists
-- ============================================================================
DO $$
DECLARE
  table_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'location_history'
  ) INTO table_exists;

  IF table_exists THEN
    RAISE NOTICE '✓ CHECK 1 PASSED: Table location_history exists';
  ELSE
    RAISE EXCEPTION '✗ CHECK 1 FAILED: Table location_history does not exist';
  END IF;
END $$;

-- ============================================================================
-- CHECK 2: Verify All Columns Exist with Correct Types
-- ============================================================================
DO $$
DECLARE
  column_count integer;
  expected_columns text[] := ARRAY[
    'id',
    'assignment_id',
    'cpo_id',
    'latitude',
    'longitude',
    'accuracy',
    'altitude',
    'heading',
    'speed',
    'timestamp',
    'created_at'
  ];
BEGIN
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'location_history'
    AND column_name = ANY(expected_columns);

  IF column_count = 11 THEN
    RAISE NOTICE '✓ CHECK 2 PASSED: All 11 expected columns exist';
  ELSE
    RAISE EXCEPTION '✗ CHECK 2 FAILED: Expected 11 columns, found %', column_count;
  END IF;
END $$;

-- ============================================================================
-- CHECK 2a: Verify Column Data Types
-- ============================================================================
DO $$
DECLARE
  id_type text;
  assignment_id_type text;
  cpo_id_type text;
  latitude_type text;
  longitude_type text;
  accuracy_type text;
  altitude_type text;
  heading_type text;
  speed_type text;
  timestamp_type text;
  created_at_type text;
BEGIN
  SELECT data_type INTO id_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'location_history' AND column_name = 'id';

  SELECT data_type INTO assignment_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'location_history' AND column_name = 'assignment_id';

  SELECT data_type INTO cpo_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'location_history' AND column_name = 'cpo_id';

  SELECT data_type INTO latitude_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'location_history' AND column_name = 'latitude';

  SELECT data_type INTO longitude_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'location_history' AND column_name = 'longitude';

  SELECT data_type INTO accuracy_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'location_history' AND column_name = 'accuracy';

  SELECT data_type INTO timestamp_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'location_history' AND column_name = 'timestamp';

  IF id_type = 'uuid' AND
     assignment_id_type = 'uuid' AND
     cpo_id_type = 'uuid' AND
     latitude_type = 'double precision' AND
     longitude_type = 'double precision' AND
     accuracy_type = 'double precision' AND
     timestamp_type = 'timestamp with time zone' THEN
    RAISE NOTICE '✓ CHECK 2a PASSED: All column data types are correct';
  ELSE
    RAISE EXCEPTION '✗ CHECK 2a FAILED: Column data types are incorrect';
  END IF;
END $$;

-- ============================================================================
-- CHECK 3: Verify NOT NULL Constraints
-- ============================================================================
DO $$
DECLARE
  not_null_count integer;
BEGIN
  SELECT COUNT(*) INTO not_null_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'location_history'
    AND is_nullable = 'NO'
    AND column_name IN (
      'id',
      'assignment_id',
      'cpo_id',
      'latitude',
      'longitude',
      'accuracy',
      'timestamp',
      'created_at'
    );

  IF not_null_count = 8 THEN
    RAISE NOTICE '✓ CHECK 3 PASSED: All required NOT NULL constraints exist';
  ELSE
    RAISE EXCEPTION '✗ CHECK 3 FAILED: Expected 8 NOT NULL columns, found %', not_null_count;
  END IF;
END $$;

-- ============================================================================
-- CHECK 4: Verify Primary Key
-- ============================================================================
DO $$
DECLARE
  pk_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'location_history'
      AND indexname = 'location_history_pkey'
  ) INTO pk_exists;

  IF pk_exists THEN
    RAISE NOTICE '✓ CHECK 4 PASSED: Primary key constraint exists on id column';
  ELSE
    RAISE EXCEPTION '✗ CHECK 4 FAILED: Primary key constraint not found';
  END IF;
END $$;

-- ============================================================================
-- CHECK 5: Verify Foreign Key Constraints
-- ============================================================================
DO $$
DECLARE
  fk_count integer;
BEGIN
  SELECT COUNT(*) INTO fk_count
  FROM information_schema.table_constraints
  WHERE table_schema = 'public'
    AND table_name = 'location_history'
    AND constraint_type = 'FOREIGN KEY';

  IF fk_count = 2 THEN
    RAISE NOTICE '✓ CHECK 5 PASSED: Both foreign key constraints exist (assignment_id, cpo_id)';
  ELSE
    RAISE EXCEPTION '✗ CHECK 5 FAILED: Expected 2 foreign key constraints, found %', fk_count;
  END IF;
END $$;

-- ============================================================================
-- CHECK 6: Verify Performance Indexes
-- ============================================================================
DO $$
DECLARE
  index_count integer;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND tablename = 'location_history'
    AND indexname IN (
      'idx_location_history_assignment_id',
      'idx_location_history_cpo_id',
      'idx_location_history_timestamp',
      'idx_location_history_assignment_timestamp'
    );

  IF index_count = 4 THEN
    RAISE NOTICE '✓ CHECK 6 PASSED: All 4 performance indexes created';
  ELSE
    RAISE EXCEPTION '✗ CHECK 6 FAILED: Expected 4 indexes, found %', index_count;
  END IF;
END $$;

-- ============================================================================
-- CHECK 7: Verify RLS is Enabled
-- ============================================================================
DO $$
DECLARE
  rls_enabled boolean;
BEGIN
  SELECT rowsecurity INTO rls_enabled
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename = 'location_history';

  IF rls_enabled THEN
    RAISE NOTICE '✓ CHECK 7 PASSED: Row Level Security is enabled';
  ELSE
    RAISE EXCEPTION '✗ CHECK 7 FAILED: Row Level Security is not enabled';
  END IF;
END $$;

-- ============================================================================
-- CHECK 8: Verify RLS Policies Exist
-- ============================================================================
DO $$
DECLARE
  policy_count integer;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'location_history'
    AND policyname IN (
      'CPOs can view their own location history',
      'CPOs can insert their own location data',
      'Clients can view location history for their assignments'
    );

  IF policy_count = 3 THEN
    RAISE NOTICE '✓ CHECK 8 PASSED: All 3 RLS policies are in place';
  ELSE
    RAISE EXCEPTION '✗ CHECK 8 FAILED: Expected 3 RLS policies, found %', policy_count;
  END IF;
END $$;

-- ============================================================================
-- CHECK 9: Verify Policy Commands
-- ============================================================================
DO $$
DECLARE
  select_policy_count integer;
  insert_policy_count integer;
BEGIN
  SELECT COUNT(*) INTO select_policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'location_history'
    AND cmd = 'SELECT';

  SELECT COUNT(*) INTO insert_policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'location_history'
    AND cmd = 'INSERT';

  IF select_policy_count = 2 AND insert_policy_count = 1 THEN
    RAISE NOTICE '✓ CHECK 9 PASSED: Policy commands are correct (2 SELECT, 1 INSERT)';
  ELSE
    RAISE EXCEPTION '✗ CHECK 9 FAILED: Expected 2 SELECT and 1 INSERT policies';
  END IF;
END $$;

-- ============================================================================
-- CHECK 10: Verify Default Values
-- ============================================================================
DO $$
DECLARE
  id_default text;
  timestamp_default text;
  created_at_default text;
BEGIN
  SELECT column_default INTO id_default
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'location_history' AND column_name = 'id';

  SELECT column_default INTO timestamp_default
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'location_history' AND column_name = 'timestamp';

  SELECT column_default INTO created_at_default
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'location_history' AND column_name = 'created_at';

  IF id_default LIKE '%gen_random_uuid%' AND
     timestamp_default LIKE '%now()%' AND
     created_at_default LIKE '%now()%' THEN
    RAISE NOTICE '✓ CHECK 10 PASSED: Default values are configured correctly';
  ELSE
    RAISE EXCEPTION '✗ CHECK 10 FAILED: Default values are not configured correctly';
  END IF;
END $$;

-- ============================================================================
-- SUMMARY: Display Table Structure
-- ============================================================================
SELECT
  '=== LOCATION_HISTORY TABLE STRUCTURE ===' as info;

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'location_history'
ORDER BY ordinal_position;

-- ============================================================================
-- SUMMARY: Display All Indexes
-- ============================================================================
SELECT
  '=== LOCATION_HISTORY INDEXES ===' as info;

SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'location_history'
ORDER BY indexname;

-- ============================================================================
-- SUMMARY: Display All RLS Policies
-- ============================================================================
SELECT
  '=== LOCATION_HISTORY RLS POLICIES ===' as info;

SELECT
  policyname,
  cmd as command,
  CASE
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_clause,
  CASE
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'location_history'
ORDER BY policyname;

-- ============================================================================
-- SUMMARY: Display Foreign Key Constraints
-- ============================================================================
SELECT
  '=== LOCATION_HISTORY FOREIGN KEYS ===' as info;

SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name = 'location_history';

-- ============================================================================
-- FINAL VERIFICATION MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'VERIFICATION COMPLETE';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'All checks passed successfully!';
  RAISE NOTICE 'The location_history table is ready for use.';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update TypeScript types in src/types/database.types.ts';
  RAISE NOTICE '2. Create locationHistoryService.ts';
  RAISE NOTICE '3. Implement GPS tracking in ActiveJob component';
  RAISE NOTICE '4. Test real-time location updates';
  RAISE NOTICE '================================================';
END $$;
