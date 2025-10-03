# 🔒 Row Level Security (RLS) Deployment Guide

**Created:** January 3, 2025
**Purpose:** Deploy comprehensive RLS policies to secure the Armora CPO database

---

## 📋 Overview

This guide explains how to deploy the comprehensive Row Level Security (RLS) policies created for the Armora CPO platform. The RLS migration ensures that:

- ✅ CPOs can ONLY access their own data
- ✅ CPOs can ONLY see assignments assigned to them OR pending assignments (for acceptance)
- ✅ Principals can ONLY access their own assignments
- ✅ No unauthorized cross-user data access
- ✅ Storage buckets are secured with folder-based isolation

---

## 🚀 Quick Start

### Prerequisites
- Access to Supabase Dashboard
- Database connection permissions
- Understanding of SQL migrations

### Deployment Steps (5 minutes)

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard
   - Select project: `supabase-emerald-school` (jmzvrqwjmlnvxojculee)
   - Navigate to: **SQL Editor** (left sidebar)

2. **Load the RLS Migration**
   - Click **"+ New Query"**
   - Copy the entire contents of: `/supabase/migrations/20250103_enable_rls_policies.sql`
   - Paste into the SQL editor

3. **Review the Migration**
   - The migration is **944 lines** and includes:
     - Helper functions for role checking
     - RLS policies for all core tables
     - Storage bucket policies
     - Verification views

4. **Execute the Migration**
   - Click **"Run"** (or press Ctrl/Cmd + Enter)
   - Wait for completion (should take 5-10 seconds)
   - Check for any error messages

5. **Verify RLS is Enabled**
   ```sql
   -- Run this query to verify RLS status
   SELECT * FROM rls_status ORDER BY tablename;
   ```

   Expected output: All tables should show `rls_enabled = true`

6. **Verify Policies Are Created**
   ```sql
   -- Run this query to see all policies
   SELECT tablename, COUNT(*) AS policy_count
   FROM rls_policies
   GROUP BY tablename
   ORDER BY tablename;
   ```

   Expected output: Multiple policies per table

---

## 📊 What Gets Deployed

### Helper Functions (4 functions)

| Function | Purpose |
|----------|---------|
| `is_cpo(user_uuid)` | Check if a user is a CPO |
| `get_cpo_id(user_uuid)` | Get CPO ID from auth user ID |
| `is_assignment_principal(user_uuid, assignment_uuid)` | Check if user is principal for an assignment |
| `is_assignment_cpo(user_uuid, assignment_uuid)` | Check if user is CPO for an assignment |

### Tables with RLS Enabled (15+ tables)

| Table | Policies | Description |
|-------|----------|-------------|
| `protection_officers` | 4 | CPOs can only view/update their own profile |
| `protection_assignments` | 6 | CPOs see their assignments + pending jobs, principals see their own |
| `payment_records` | 2 | CPOs see only their own payments |
| `incident_reports` | 3 | CPOs manage their reports, principals can view |
| `messages` | 3 | Assignment-based message access |
| `reviews` | 3 | Users see reviews about them and by them |
| `cpo_qualifications` | 2 | CPOs manage their own qualifications |
| `compliance_documents` | 2 | CPOs manage their own documents |
| `cpo_availability` | 1 | CPOs manage their own availability |
| `assignment_timeline` | 2 | Assignment participants can view/create entries |
| `emergency_activations` | 2 | Users manage their own emergencies |
| `notifications` | 3 | Users see only their own notifications |
| `profiles` | 1 | Users manage their own profile |

### Storage Bucket Policies (3 buckets)

| Bucket | Policies | Description |
|--------|----------|-------------|
| `cpo-profiles` | 4 | CPOs upload/view/update/delete their own photos |
| `compliance-documents` | 3 | CPOs upload/view/delete their own documents |
| `incident-evidence` | 2 | CPOs upload evidence, authorized users can view |

### Verification Views (2 views)

| View | Purpose |
|------|---------|
| `rls_status` | Shows RLS enabled/disabled for all public tables |
| `rls_policies` | Lists all RLS policies in the database |

---

## ✅ Post-Deployment Verification

### 1. Check RLS Status

```sql
-- Should return all tables with rls_enabled = true
SELECT
  tablename,
  CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END AS rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 2. Count Policies

```sql
-- Should return policy counts for all tables
SELECT
  tablename,
  COUNT(*) AS policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

### 3. Test CPO Data Access

```sql
-- Test: CPO should only see their own profile
-- (Run as authenticated CPO user)
SELECT * FROM protection_officers;
-- Should return only 1 row (the CPO's own profile)

-- Test: CPO should see their assignments + pending assignments
SELECT id, status, cpo_id FROM protection_assignments;
-- Should return assignments where:
--   - cpo_id matches the CPO's ID, OR
--   - status = 'pending' AND cpo_id IS NULL
```

### 4. Test Storage Access

```sql
-- Test: Check storage bucket policies
SELECT
  bucket_id,
  COUNT(*) AS policy_count
FROM storage.policies
GROUP BY bucket_id;
-- Should show policies for cpo-profiles, compliance-documents, incident-evidence
```

---

## 🧪 Test Data Deployment (Optional)

After deploying RLS policies, you can optionally deploy test data for development/testing.

⚠️ **WARNING:** Only deploy test data in **development** or **staging** environments. **NEVER** in production!

### Deploy Test Data

1. **Open Supabase SQL Editor**
2. **Load the Test Data Migration**
   - Copy contents of: `/supabase/migrations/20250103_insert_test_data.sql`
   - Paste into SQL editor
3. **Execute the Migration**
   - Click **"Run"**
4. **Verify Test Data**
   ```sql
   -- Should return 5 test CPOs
   SELECT id, first_name, last_name, email FROM protection_officers;

   -- Should return 8 test assignments
   SELECT id, assignment_type, status, principal_name FROM protection_assignments;

   -- Should return 4 test payments
   SELECT id, amount, payment_status FROM payment_records;

   -- Should return 2 test incidents
   SELECT id, incident_type, severity FROM incident_reports;
   ```

### Test Data Includes

- **5 Test CPOs:**
  - James Mitchell (Executive Protection Specialist)
  - Amara Okafor (Event Security & VIP Protection)
  - David Thompson (Residential & Transport Security)
  - Priya Sharma (Medical Emergency & Close Protection)
  - Marcus Johnson (Armed Protection & High-Risk Details)

- **8 Test Assignments:**
  - 1 pending (Royal Albert Hall VIP event)
  - 1 assigned (Harrods shopping trip)
  - 1 active (Heathrow airport transport)
  - 4 completed (various assignments)
  - 1 cancelled (O2 Arena event)

- **4 Payment Records**
- **2 Incident Reports**
- **5 Assignment Messages**

---

## 🔧 Troubleshooting

### Problem: RLS policies fail to create

**Symptom:** Error messages when running the migration

**Solutions:**
1. Check if policies already exist:
   ```sql
   SELECT * FROM pg_policies WHERE schemaname = 'public';
   ```
2. If policies exist, drop them first:
   ```sql
   -- Example: Drop existing policy
   DROP POLICY IF EXISTS "CPOs can view own profile" ON protection_officers;
   ```
3. Re-run the migration

### Problem: Table doesn't exist errors

**Symptom:** Error: `relation "table_name" does not exist`

**Explanation:** The migration uses conditional logic to handle optional tables:
```sql
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'table_name') THEN
    -- Create policy
  END IF;
END $$;
```

**Solution:** This is expected behavior. The migration will skip tables that don't exist.

### Problem: Storage policies fail

**Symptom:** Error when creating storage bucket policies

**Solutions:**
1. Check if storage buckets exist:
   ```sql
   SELECT * FROM storage.buckets;
   ```
2. Create missing buckets via Supabase Dashboard:
   - Go to: **Storage** → **Create new bucket**
   - Create: `cpo-profiles`, `compliance-documents`, `incident-evidence`
3. Re-run storage policy section of migration

### Problem: Authentication errors when testing

**Symptom:** "permission denied" or "no rows returned" when testing as CPO

**Solutions:**
1. Ensure you're authenticated as a CPO user:
   ```sql
   SELECT auth.uid(); -- Should return your user UUID
   ```
2. Verify CPO profile exists:
   ```sql
   SELECT * FROM protection_officers WHERE user_id = auth.uid();
   ```
3. If no profile exists, create one or use test data

---

## 🔒 Security Best Practices

### After Deployment

1. **Monitor RLS Performance**
   - Watch query performance in Supabase Dashboard
   - Add indexes on frequently filtered columns:
     ```sql
     CREATE INDEX IF NOT EXISTS idx_protection_officers_user_id
       ON protection_officers(user_id);
     CREATE INDEX IF NOT EXISTS idx_protection_assignments_cpo_id
       ON protection_assignments(cpo_id);
     CREATE INDEX IF NOT EXISTS idx_protection_assignments_status
       ON protection_assignments(status);
     ```

2. **Regular Audits**
   - Review RLS policies monthly
   - Check for policy violations in logs
   - Update policies as new tables are added

3. **Documentation**
   - Document all RLS policies in application security docs
   - Update this guide if policies change
   - Train team on RLS principles

4. **Testing**
   - Test all user roles (CPO, principal, admin)
   - Verify data isolation between users
   - Test edge cases (assignment transfers, etc.)

---

## 📚 Additional Resources

### Related Documentation
- `/workspaces/armoracpo/CLAUDE.md` - Project build instructions (updated with RLS info)
- `/workspaces/armoracpo/docs/supabase.md` - Database schema reference
- `/workspaces/armoracpo/docs/PROJECT-STATUS.md` - Current project status
- `/workspaces/armoracpo/docs/todo.md` - Development task breakdown

### Supabase RLS Documentation
- [Supabase RLS Overview](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)

### Migration Files
- `/supabase/migrations/20250103_enable_rls_policies.sql` - RLS policies (944 lines)
- `/supabase/migrations/20250103_insert_test_data.sql` - Test data (783 lines)
- `/supabase/migrations/20250103_verify_rls.sql` - Verification queries

---

## 📝 Changelog

### January 3, 2025 - Initial Creation
- Created comprehensive RLS migration (944 lines)
- Added helper functions for role checking
- Implemented policies for all core tables
- Added storage bucket policies
- Created verification views
- Created this deployment guide

---

## ✅ Deployment Checklist

Use this checklist when deploying RLS policies:

- [ ] Backed up database (if production)
- [ ] Reviewed RLS migration SQL
- [ ] Opened Supabase SQL Editor
- [ ] Copied and pasted RLS migration
- [ ] Executed migration successfully
- [ ] Verified RLS status (`SELECT * FROM rls_status`)
- [ ] Verified policy count (`SELECT * FROM rls_policies`)
- [ ] Tested CPO data access (should see only own data)
- [ ] Tested assignment access (should see own + pending)
- [ ] Tested storage bucket access
- [ ] Added performance indexes (if needed)
- [ ] Documented deployment in team notes
- [ ] Updated this guide if issues encountered

---

**Need Help?** Review the troubleshooting section or consult the Supabase RLS documentation.

**Security Question?** Always err on the side of restricting access. It's easier to grant access later than to clean up a data breach.
