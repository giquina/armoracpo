-- ============================================
-- RLS VERIFICATION SCRIPT
-- File: 20250103_verify_rls.sql
-- Purpose: Verify that RLS policies are correctly configured
-- ============================================

-- This script performs comprehensive verification of RLS policies
-- Run this AFTER applying 20250103_enable_rls_policies.sql

-- ============================================
-- SECTION 1: RLS ENABLED STATUS
-- ============================================

\echo ''
\echo '=========================================='
\echo 'SECTION 1: RLS ENABLED STATUS'
\echo '=========================================='
\echo ''

SELECT
  tablename,
  CASE
    WHEN rowsecurity THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END AS rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'protection_officers',
    'protection_assignments',
    'payment_records',
    'earnings',
    'incident_reports',
    'messages',
    'reviews',
    'cpo_qualifications',
    'compliance_documents',
    'cpo_availability',
    'assignment_timeline',
    'emergency_activations',
    'notifications',
    'profiles',
    'assignment_messages'
  )
ORDER BY tablename;

-- ============================================
-- SECTION 2: POLICY COUNTS PER TABLE
-- ============================================

\echo ''
\echo '=========================================='
\echo 'SECTION 2: POLICY COUNTS PER TABLE'
\echo '=========================================='
\echo ''

SELECT
  tablename,
  COUNT(*) AS policy_count,
  STRING_AGG(DISTINCT cmd::text, ', ') AS operations_covered
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- SECTION 3: DETAILED POLICY LISTING
-- ============================================

\echo ''
\echo '=========================================='
\echo 'SECTION 3: DETAILED POLICY LISTING'
\echo '=========================================='
\echo ''

SELECT
  tablename,
  policyname,
  cmd AS operation,
  CASE
    WHEN permissive = 'PERMISSIVE' THEN 'PERMISSIVE'
    ELSE 'RESTRICTIVE'
  END AS type,
  roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- ============================================
-- SECTION 4: HELPER FUNCTIONS VERIFICATION
-- ============================================

\echo ''
\echo '=========================================='
\echo 'SECTION 4: HELPER FUNCTIONS VERIFICATION'
\echo '=========================================='
\echo ''

SELECT
  routine_name AS function_name,
  data_type AS return_type,
  CASE
    WHEN routine_name IN ('is_cpo', 'get_cpo_id', 'is_assignment_principal', 'is_assignment_cpo') THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END AS status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('is_cpo', 'get_cpo_id', 'is_assignment_principal', 'is_assignment_cpo')
ORDER BY routine_name;

-- ============================================
-- SECTION 5: STORAGE BUCKET POLICIES
-- ============================================

\echo ''
\echo '=========================================='
\echo 'SECTION 5: STORAGE BUCKET POLICIES'
\echo '=========================================='
\echo ''

SELECT
  policyname,
  cmd AS operation,
  CASE
    WHEN policyname LIKE '%cpo-profiles%' THEN 'cpo-profiles'
    WHEN policyname LIKE '%compliance%' THEN 'compliance-documents'
    WHEN policyname LIKE '%incident%' THEN 'incident-evidence'
    ELSE 'other'
  END AS bucket
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY bucket, cmd, policyname;

-- ============================================
-- SECTION 6: MISSING POLICIES DETECTION
-- ============================================

\echo ''
\echo '=========================================='
\echo 'SECTION 6: MISSING POLICIES DETECTION'
\echo '=========================================='
\echo ''

-- Check for tables without SELECT policies
SELECT
  tablename,
  '❌ MISSING SELECT POLICY' AS warning
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true
  AND tablename NOT IN (
    SELECT DISTINCT tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND cmd = 'SELECT'
  )
ORDER BY tablename;

-- ============================================
-- SECTION 7: SECURITY GAPS ANALYSIS
-- ============================================

\echo ''
\echo '=========================================='
\echo 'SECTION 7: SECURITY GAPS ANALYSIS'
\echo '=========================================='
\echo ''

-- Tables with RLS disabled (security risk!)
SELECT
  'RLS DISABLED' AS issue_type,
  tablename,
  '❌ CRITICAL: Enable RLS immediately' AS recommendation
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE 'sql_%';

-- Tables with no policies (RLS enabled but no policies = deny all)
SELECT
  'NO POLICIES' AS issue_type,
  t.tablename,
  '⚠️ WARNING: RLS enabled but no policies defined' AS recommendation
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.rowsecurity = true
  AND NOT EXISTS (
    SELECT 1
    FROM pg_policies p
    WHERE p.schemaname = 'public'
      AND p.tablename = t.tablename
  );

-- ============================================
-- SECTION 8: RECOMMENDED INDEXES
-- ============================================

\echo ''
\echo '=========================================='
\echo 'SECTION 8: RECOMMENDED INDEXES'
\echo '=========================================='
\echo ''

-- Check if recommended indexes exist
SELECT
  'protection_officers.user_id' AS recommended_index,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'protection_officers'
        AND indexname LIKE '%user_id%'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END AS status
UNION ALL
SELECT
  'protection_assignments.cpo_id' AS recommended_index,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'protection_assignments'
        AND indexname LIKE '%cpo_id%'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END AS status
UNION ALL
SELECT
  'protection_assignments.principal_id' AS recommended_index,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'protection_assignments'
        AND indexname LIKE '%principal_id%'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END AS status
UNION ALL
SELECT
  'incident_reports.cpo_id' AS recommended_index,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'incident_reports'
        AND indexname LIKE '%cpo_id%'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END AS status
UNION ALL
SELECT
  'assignment_messages.assignment_id' AS recommended_index,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'assignment_messages'
        AND indexname LIKE '%assignment_id%'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END AS status;

-- ============================================
-- SECTION 9: POLICY COVERAGE MATRIX
-- ============================================

\echo ''
\echo '=========================================='
\echo 'SECTION 9: POLICY COVERAGE MATRIX'
\echo '=========================================='
\echo ''

-- Show which operations are covered for each table
SELECT
  t.tablename,
  CASE WHEN EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename AND cmd = 'SELECT') THEN '✅' ELSE '❌' END AS "SELECT",
  CASE WHEN EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename AND cmd = 'INSERT') THEN '✅' ELSE '❌' END AS "INSERT",
  CASE WHEN EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename AND cmd = 'UPDATE') THEN '✅' ELSE '❌' END AS "UPDATE",
  CASE WHEN EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename AND cmd = 'DELETE') THEN '✅' ELSE '❌' END AS "DELETE",
  CASE WHEN EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename AND cmd = 'ALL') THEN '✅' ELSE '❌' END AS "ALL"
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.rowsecurity = true
ORDER BY t.tablename;

-- ============================================
-- SECTION 10: SUMMARY REPORT
-- ============================================

\echo ''
\echo '=========================================='
\echo 'SECTION 10: SUMMARY REPORT'
\echo '=========================================='
\echo ''

WITH rls_stats AS (
  SELECT
    COUNT(*) FILTER (WHERE rowsecurity = true) AS tables_with_rls,
    COUNT(*) FILTER (WHERE rowsecurity = false) AS tables_without_rls,
    COUNT(*) AS total_tables
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT LIKE 'sql_%'
),
policy_stats AS (
  SELECT
    COUNT(DISTINCT tablename) AS tables_with_policies,
    COUNT(*) AS total_policies
  FROM pg_policies
  WHERE schemaname = 'public'
),
storage_stats AS (
  SELECT
    COUNT(*) AS storage_policies
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
)
SELECT
  '📊 RLS SUMMARY' AS report,
  r.tables_with_rls AS "Tables with RLS",
  r.tables_without_rls AS "Tables without RLS",
  r.total_tables AS "Total Tables",
  p.tables_with_policies AS "Tables with Policies",
  p.total_policies AS "Total DB Policies",
  s.storage_policies AS "Storage Policies"
FROM rls_stats r, policy_stats p, storage_stats s;

-- ============================================
-- SECTION 11: SECURITY RECOMMENDATIONS
-- ============================================

\echo ''
\echo '=========================================='
\echo 'SECTION 11: SECURITY RECOMMENDATIONS'
\echo '=========================================='
\echo ''

SELECT
  '1. Enable RLS on all tables' AS recommendation,
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false)
    THEN '⚠️ ACTION REQUIRED'
    ELSE '✅ COMPLETE'
  END AS status
UNION ALL
SELECT
  '2. Create policies for all RLS-enabled tables' AS recommendation,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_tables t
      WHERE t.schemaname = 'public'
        AND t.rowsecurity = true
        AND NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.schemaname = 'public' AND p.tablename = t.tablename)
    )
    THEN '⚠️ ACTION REQUIRED'
    ELSE '✅ COMPLETE'
  END AS status
UNION ALL
SELECT
  '3. Secure storage buckets with RLS' AS recommendation,
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects')
    THEN '✅ COMPLETE'
    ELSE '⚠️ ACTION REQUIRED'
  END AS status
UNION ALL
SELECT
  '4. Create helper functions for policy logic' AS recommendation,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name IN ('is_cpo', 'get_cpo_id'))
    THEN '✅ COMPLETE'
    ELSE '⚠️ ACTION REQUIRED'
  END AS status
UNION ALL
SELECT
  '5. Add indexes on filtered columns' AS recommendation,
  '⚠️ REVIEW SECTION 8 FOR DETAILS' AS status;

-- ============================================
-- VERIFICATION COMPLETE
-- ============================================

\echo ''
\echo '=========================================='
\echo '✅ RLS VERIFICATION COMPLETE'
\echo '=========================================='
\echo ''
\echo 'Review the output above for any warnings or missing policies.'
\echo 'Address any ❌ or ⚠️ items before deploying to production.'
\echo ''

-- Create a comprehensive verification view
CREATE OR REPLACE VIEW rls_verification_report AS
WITH rls_status AS (
  SELECT
    tablename,
    rowsecurity AS rls_enabled
  FROM pg_tables
  WHERE schemaname = 'public'
),
policy_counts AS (
  SELECT
    tablename,
    COUNT(*) AS policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  GROUP BY tablename
)
SELECT
  r.tablename,
  r.rls_enabled,
  COALESCE(p.policy_count, 0) AS policy_count,
  CASE
    WHEN r.rls_enabled AND COALESCE(p.policy_count, 0) > 0 THEN '✅ SECURED'
    WHEN r.rls_enabled AND COALESCE(p.policy_count, 0) = 0 THEN '⚠️ RLS ENABLED, NO POLICIES'
    WHEN NOT r.rls_enabled THEN '❌ RLS DISABLED'
  END AS security_status
FROM rls_status r
LEFT JOIN policy_counts p ON r.tablename = p.tablename
ORDER BY security_status, r.tablename;

COMMENT ON VIEW rls_verification_report IS 'Comprehensive RLS verification report showing security status of all tables';

\echo 'Created view: rls_verification_report'
\echo 'Query it with: SELECT * FROM rls_verification_report;'
\echo ''
