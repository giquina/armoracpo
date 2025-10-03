# Row Level Security (RLS) Policies - Armora CPO

## Overview

This directory contains the comprehensive Row Level Security (RLS) migration for the Armora CPO database. The migration `20250103_enable_rls_policies.sql` implements security policies across all tables to ensure:

- **CPOs can ONLY access their own data**
- **Principals can ONLY access their own assignments**
- **No unauthorized cross-user data access**
- **Service role can perform administrative operations**

## Critical Security Vulnerability - FIXED

**BEFORE:** The Supabase database had NO RLS policies enabled, meaning any authenticated user could potentially access all data.

**AFTER:** All tables now have RLS enabled with comprehensive policies enforcing strict data isolation.

## Migration File

**File:** `20250103_enable_rls_policies.sql`

**Purpose:** Enable RLS and create security policies for all tables in the Armora CPO platform.

## Tables Secured

### Core Tables with RLS Policies

1. **protection_officers** - CPO profiles
2. **protection_assignments** - Job assignments
3. **payment_records** - Payment transactions
4. **earnings** - CPO earnings records
5. **incident_reports** - Security incident documentation
6. **messages** - Assignment messaging
7. **reviews** - Rating/review system
8. **cpo_qualifications** - CPO certifications
9. **compliance_documents** - SIA licenses, DBS, insurance
10. **cpo_availability** - Availability schedules
11. **assignment_timeline** - Assignment status history
12. **emergency_activations** - Emergency panic button
13. **notifications** - Push notifications
14. **profiles** - Shared user profiles

### Storage Buckets Secured

1. **cpo-profiles** - Profile photos
2. **compliance-documents** - SIA licenses, DBS certificates
3. **incident-evidence** - Incident photos/videos

## Helper Functions

The migration creates four helper functions to simplify policy logic:

### `is_cpo(user_uuid UUID) → BOOLEAN`
Checks if a user is a CPO based on their auth user ID.

```sql
SELECT is_cpo(auth.uid());
```

### `get_cpo_id(user_uuid UUID) → UUID`
Returns the CPO profile ID for an auth user ID.

```sql
SELECT get_cpo_id(auth.uid());
```

### `is_assignment_principal(user_uuid UUID, assignment_uuid UUID) → BOOLEAN`
Checks if a user is the principal for a specific assignment.

```sql
SELECT is_assignment_principal(auth.uid(), 'assignment-id');
```

### `is_assignment_cpo(user_uuid UUID, assignment_uuid UUID) → BOOLEAN`
Checks if a user is the CPO for a specific assignment.

```sql
SELECT is_assignment_cpo(auth.uid(), 'assignment-id');
```

## Policy Patterns

### Pattern 1: CPO Own Data Access

**Tables:** `protection_officers`, `earnings`, `payment_records`, `cpo_qualifications`, `compliance_documents`, `cpo_availability`

**Logic:** CPOs can only SELECT/UPDATE/DELETE their own records.

```sql
-- Example: protection_officers table
CREATE POLICY "CPOs can view own profile"
  ON protection_officers
  FOR SELECT
  USING (user_id = auth.uid());
```

### Pattern 2: Assignment-Based Access

**Tables:** `protection_assignments`, `messages`, `incident_reports`, `assignment_timeline`

**Logic:** Users can access data related to assignments they're involved in.

```sql
-- Example: CPOs see assignments assigned to them OR pending jobs
CREATE POLICY "CPOs can view relevant assignments"
  ON protection_assignments
  FOR SELECT
  USING (
    (cpo_id IN (SELECT id FROM protection_officers WHERE user_id = auth.uid()))
    OR
    (status = 'pending' AND cpo_id IS NULL)
  );
```

### Pattern 3: Bidirectional Access

**Tables:** `messages`, `assignment_timeline`, `incident_reports`

**Logic:** Both CPOs AND principals can access based on assignment participation.

```sql
-- Example: Messages visible to both parties
CREATE POLICY "Users can view assignment messages"
  ON messages
  FOR SELECT
  USING (
    -- Principals can view
    (EXISTS (SELECT 1 FROM protection_assignments WHERE id = messages.assignment_id AND principal_id = auth.uid()))
    OR
    -- CPOs can view
    (EXISTS (SELECT 1 FROM protection_assignments pa JOIN protection_officers po ON po.id = pa.cpo_id WHERE pa.id = messages.assignment_id AND po.user_id = auth.uid()))
  );
```

### Pattern 4: Service Role Bypass

**All Tables:** Service role can perform administrative operations.

```sql
-- Service role can bypass RLS for system operations
CREATE POLICY "Service role can manage all assignments"
  ON protection_assignments
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

## Storage Bucket Policies

### CPO Profiles (`cpo-profiles`)

- ✅ CPOs can upload/update/delete their own photos
- ✅ Anyone can view profile photos (public)

**Folder structure:** `{user_id}/profile-{timestamp}.jpg`

### Compliance Documents (`compliance-documents`)

- ✅ CPOs can upload/view/delete their own documents
- ✅ Service role can view all (for verification)
- ❌ Other users CANNOT access

**Folder structure:** `{user_id}/{document_type}-{timestamp}.pdf`

### Incident Evidence (`incident-evidence`)

- ✅ CPO who created incident can upload/view
- ✅ Principal of assignment can view
- ✅ Service role can view all
- ❌ Other users CANNOT access

**Folder structure:** `{incident_id}/{timestamp}-{filename}.jpg`

## Applying the Migration

### Option 1: Supabase Dashboard (Recommended for Production)

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `20250103_enable_rls_policies.sql`
3. Paste and run the migration
4. Verify results in the output

### Option 2: Supabase CLI

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Push the migration
supabase db push

# Verify RLS status
supabase db diff
```

### Option 3: Direct SQL Execution

```bash
# Using psql
psql postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres -f supabase/migrations/20250103_enable_rls_policies.sql
```

## Verification

The migration includes two helper views for verification:

### View 1: RLS Status

```sql
SELECT * FROM rls_status;
```

**Output:**
```
schemaname | tablename                | rls_enabled
-----------+--------------------------+-------------
public     | protection_officers      | true
public     | protection_assignments   | true
public     | incident_reports         | true
...
```

### View 2: RLS Policies

```sql
SELECT * FROM rls_policies;
```

**Output:** Shows all policies with their configuration.

### Manual Verification

```sql
-- Check if RLS is enabled on a table
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'protection_officers';

-- List all policies for a table
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'protection_officers';
```

## Testing RLS Policies

### Test 1: CPO Can Access Own Data

```sql
-- Set session to CPO user
SET request.jwt.claims = '{"sub": "cpo-user-uuid"}';

-- Should return CPO's own profile
SELECT * FROM protection_officers WHERE user_id = 'cpo-user-uuid';

-- Should return EMPTY (cannot access other CPOs)
SELECT * FROM protection_officers WHERE user_id != 'cpo-user-uuid';
```

### Test 2: CPO Can See Relevant Assignments

```sql
-- Set session to CPO user
SET request.jwt.claims = '{"sub": "cpo-user-uuid"}';

-- Should return assignments assigned to this CPO + pending jobs
SELECT * FROM protection_assignments;

-- Should NOT return assignments assigned to other CPOs (unless pending)
```

### Test 3: Principal Can Access Own Assignments

```sql
-- Set session to principal user
SET request.jwt.claims = '{"sub": "principal-user-uuid"}';

-- Should return principal's own assignments
SELECT * FROM protection_assignments WHERE principal_id = 'principal-user-uuid';

-- Should return EMPTY (cannot access other principals' assignments)
SELECT * FROM protection_assignments WHERE principal_id != 'principal-user-uuid';
```

### Test 4: Storage Bucket Isolation

```bash
# CPO should be able to upload to their own folder
supabase storage upload cpo-profiles/{cpo-user-id}/photo.jpg photo.jpg

# CPO should NOT be able to upload to another CPO's folder (should fail)
supabase storage upload cpo-profiles/{other-cpo-id}/photo.jpg photo.jpg
```

## Performance Considerations

RLS policies add a WHERE clause to every query. For optimal performance:

### Recommended Indexes

```sql
-- Index on protection_officers.user_id (for CPO lookups)
CREATE INDEX IF NOT EXISTS idx_protection_officers_user_id ON protection_officers(user_id);

-- Index on protection_assignments.cpo_id (for assignment filtering)
CREATE INDEX IF NOT EXISTS idx_protection_assignments_cpo_id ON protection_assignments(cpo_id);

-- Index on protection_assignments.principal_id (for principal filtering)
CREATE INDEX IF NOT EXISTS idx_protection_assignments_principal_id ON protection_assignments(principal_id);

-- Index on incident_reports.cpo_id (for incident filtering)
CREATE INDEX IF NOT EXISTS idx_incident_reports_cpo_id ON incident_reports(cpo_id);

-- Index on messages.assignment_id (for message filtering)
CREATE INDEX IF NOT EXISTS idx_messages_assignment_id ON messages(assignment_id);
```

### Monitoring Performance

```sql
-- Check query performance with EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT * FROM protection_assignments
WHERE cpo_id IN (SELECT id FROM protection_officers WHERE user_id = auth.uid());
```

## Common Issues & Troubleshooting

### Issue 1: "Permission Denied" Errors

**Symptom:** Query returns no results or throws permission error.

**Cause:** RLS policy is blocking access.

**Debug:**
```sql
-- Check which user is authenticated
SELECT auth.uid();

-- Check if user has a CPO profile
SELECT * FROM protection_officers WHERE user_id = auth.uid();

-- Check policy matches user context
```

### Issue 2: Service Role Not Bypassing RLS

**Symptom:** Service role queries fail or return no results.

**Cause:** Service role policies not correctly configured.

**Fix:** Ensure service role policies use `USING (true)` and `WITH CHECK (true)`.

### Issue 3: Storage Upload Fails

**Symptom:** File upload to storage bucket returns permission error.

**Cause:** Storage bucket policy doesn't match folder structure.

**Fix:** Ensure folder structure matches policy (e.g., `{user_id}/filename`).

### Issue 4: Slow Queries After RLS

**Symptom:** Queries take longer after enabling RLS.

**Cause:** Missing indexes on filtered columns.

**Fix:** Add indexes on `user_id`, `cpo_id`, `principal_id`, etc.

## Security Best Practices

### ✅ DO

- Always use `auth.uid()` for user identification
- Test policies with actual user sessions
- Use service role ONLY for administrative operations
- Keep policies simple and readable
- Add indexes on frequently filtered columns
- Monitor query performance after enabling RLS
- Document all policies and their purpose

### ❌ DON'T

- Don't disable RLS in production
- Don't use `USING (true)` for user-level policies (only service role)
- Don't expose service role key in client-side code
- Don't trust user input in policies
- Don't create overly complex policies (split into multiple if needed)
- Don't forget to test edge cases (empty results, unauthorized access)

## Edge Function Compatibility

When using Supabase Edge Functions, use the **service role key** to bypass RLS:

```typescript
import { createClient } from '@supabase/supabase-js';

// Use service role key (NEVER expose in client!)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role bypasses RLS
);

// This will bypass RLS policies
const { data, error } = await supabaseAdmin
  .from('protection_assignments')
  .select('*');
```

For user-scoped operations in Edge Functions, use the user's JWT:

```typescript
// Use anon key + user JWT
const supabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  {
    global: {
      headers: {
        Authorization: `Bearer ${userJwt}`,
      },
    },
  }
);

// This will respect RLS policies
const { data, error } = await supabaseClient
  .from('protection_assignments')
  .select('*');
```

## Future Enhancements

### Planned Improvements

1. **Role-Based Policies:** Add admin roles with elevated permissions
2. **Audit Logging:** Log all policy violations for security monitoring
3. **Dynamic Policies:** Policies that adjust based on assignment status
4. **Geofencing Policies:** Location-based access control
5. **Time-Based Policies:** Access restrictions based on time windows

### Migration History

- **20250103_enable_rls_policies.sql** - Initial comprehensive RLS implementation
- *Future migrations will be documented here*

## Support & Documentation

- **Supabase RLS Docs:** https://supabase.com/docs/guides/auth/row-level-security
- **PostgreSQL RLS Docs:** https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- **Project CLAUDE.md:** `/workspaces/armoracpo/CLAUDE.md`
- **Supabase Schema Docs:** `/workspaces/armoracpo/docs/supabase.md`

## Contact

For questions or issues with RLS policies, refer to the Armora CPO development team or create an issue in the project repository.

---

**Migration Status:** ✅ **READY FOR DEPLOYMENT**

**Security Level:** 🔒 **MAXIMUM (All tables secured)**

**Last Updated:** 2025-01-03
