# RLS Quick Reference Guide - Armora CPO

## 🚀 Quick Start

### Apply the Migration

```bash
# Navigate to project root
cd /workspaces/armoracpo

# Option 1: Supabase Dashboard (Recommended)
# 1. Go to SQL Editor
# 2. Copy/paste contents of 20250103_enable_rls_policies.sql
# 3. Run

# Option 2: Supabase CLI
supabase db push

# Option 3: psql
psql $DATABASE_URL -f supabase/migrations/20250103_enable_rls_policies.sql
```

### Verify the Migration

```bash
# Run verification script
psql $DATABASE_URL -f supabase/migrations/20250103_verify_rls.sql

# Or in Supabase Dashboard SQL Editor
SELECT * FROM rls_verification_report;
```

---

## 📋 What Each User Can Access

### CPO (Close Protection Officer)

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| **protection_officers** | ✅ Own profile only | ❌ (via service) | ✅ Own profile only | ❌ |
| **protection_assignments** | ✅ Own + Pending | ❌ | ✅ Own only | ❌ |
| **payment_records** | ✅ Own only | ❌ | ❌ | ❌ |
| **earnings** | ✅ Own only | ❌ | ❌ | ❌ |
| **incident_reports** | ✅ Own only | ✅ Own only | ✅ Own only | ✅ Own only |
| **messages** | ✅ Own assignments | ✅ Own assignments | ✅ Mark read | ❌ |
| **reviews** | ✅ About self | ✅ For assignments | ❌ | ❌ |
| **cpo_qualifications** | ✅ Own only | ✅ Own only | ✅ Own only | ✅ Own only |
| **compliance_documents** | ✅ Own only | ✅ Own only | ✅ Own only | ✅ Own only |
| **cpo_availability** | ✅ Own only | ✅ Own only | ✅ Own only | ✅ Own only |

### Principal (Client)

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| **protection_officers** | ❌ | ❌ | ❌ | ❌ |
| **protection_assignments** | ✅ Own only | ✅ Own only | ✅ Own only | ❌ |
| **incident_reports** | ✅ Own assignments | ❌ | ❌ | ❌ |
| **messages** | ✅ Own assignments | ✅ Own assignments | ✅ Mark read | ❌ |
| **reviews** | ✅ About self | ✅ For assignments | ❌ | ❌ |

### Service Role (Backend/Edge Functions)

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| **ALL TABLES** | ✅ | ✅ | ✅ | ✅ |

> **Note:** Service role bypasses ALL RLS policies. Use ONLY in trusted backend code.

---

## 🔑 Authentication Context

### Get Current User

```typescript
// In client app (respects RLS)
const { data: { user } } = await supabase.auth.getUser();
console.log(user.id); // This is auth.uid() in SQL policies
```

### Check User Type

```sql
-- In SQL policies
SELECT is_cpo(auth.uid()); -- Returns true/false

-- Get CPO ID from user ID
SELECT get_cpo_id(auth.uid()); -- Returns CPO profile UUID
```

---

## 📝 Common Policy Patterns

### Pattern 1: Own Data Only

```sql
-- CPO can only access their own profile
CREATE POLICY "CPOs can view own profile"
  ON protection_officers
  FOR SELECT
  USING (user_id = auth.uid());
```

**Use Cases:**
- CPO profiles
- Earnings
- Qualifications
- Compliance documents
- Availability schedules

### Pattern 2: Assignment-Based Access

```sql
-- Users can access data for their assignments
CREATE POLICY "Users can view assignment messages"
  ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM protection_assignments
      WHERE id = messages.assignment_id
      AND (
        principal_id = auth.uid() OR
        cpo_id IN (SELECT id FROM protection_officers WHERE user_id = auth.uid())
      )
    )
  );
```

**Use Cases:**
- Messages
- Incident reports
- Assignment timeline
- Assignment details

### Pattern 3: Service Role Bypass

```sql
-- Service role can perform any operation
CREATE POLICY "Service role can manage payments"
  ON payment_records
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

**Use Cases:**
- Payment processing (Stripe webhooks)
- Admin operations
- Assignment matching algorithm
- System-generated notifications

---

## 💾 Storage Bucket Access

### CPO Profiles (`cpo-profiles`)

```typescript
// ✅ CPO can upload their own photo
const { data, error } = await supabase.storage
  .from('cpo-profiles')
  .upload(`${cpoId}/profile.jpg`, file);

// ✅ Anyone can view profile photos
const { data } = supabase.storage
  .from('cpo-profiles')
  .getPublicUrl(`${cpoId}/profile.jpg`);
```

**Folder Structure:** `{cpo_user_id}/filename.ext`

### Compliance Documents (`compliance-documents`)

```typescript
// ✅ CPO can upload their own documents
const { data, error } = await supabase.storage
  .from('compliance-documents')
  .upload(`${cpoId}/sia-license.pdf`, file);

// ❌ Other CPOs CANNOT view
// ✅ Service role CAN view (for verification)
```

**Folder Structure:** `{cpo_user_id}/document-type.ext`

### Incident Evidence (`incident-evidence`)

```typescript
// ✅ CPO can upload evidence for their incidents
const { data, error } = await supabase.storage
  .from('incident-evidence')
  .upload(`${incidentId}/photo.jpg`, file);

// ✅ CPO who created incident can view
// ✅ Principal of assignment can view
// ✅ Service role can view
```

**Folder Structure:** `{incident_id}/filename.ext`

---

## 🧪 Testing RLS Policies

### Test as CPO User

```typescript
// Login as CPO
const { data: { user } } = await supabase.auth.signInWithPassword({
  email: 'cpo@example.com',
  password: 'password123',
});

// Should return CPO's own profile
const { data: profile } = await supabase
  .from('protection_officers')
  .select('*')
  .single();

// Should return EMPTY (cannot access other CPOs)
const { data: others } = await supabase
  .from('protection_officers')
  .select('*')
  .neq('user_id', user.id);

console.log(others.length); // Should be 0
```

### Test as Principal User

```typescript
// Login as principal
const { data: { user } } = await supabase.auth.signInWithPassword({
  email: 'principal@example.com',
  password: 'password123',
});

// Should return principal's own assignments
const { data: assignments } = await supabase
  .from('protection_assignments')
  .select('*');

console.log(assignments.every(a => a.principal_id === user.id)); // Should be true
```

### Test with Service Role

```typescript
import { createClient } from '@supabase/supabase-js';

// Create service role client (backend only!)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ⚠️ NEVER expose in client!
);

// Should return ALL assignments
const { data: allAssignments } = await supabaseAdmin
  .from('protection_assignments')
  .select('*');

console.log(allAssignments.length); // All assignments, bypassing RLS
```

---

## 🐛 Debugging RLS Issues

### Issue: "No rows returned"

**Possible Causes:**
1. User not authenticated (`auth.uid()` is null)
2. RLS policy blocking access
3. No data exists for this user

**Debug Steps:**

```sql
-- Check authentication
SELECT auth.uid(); -- Should return user UUID, not null

-- Check if user has CPO profile
SELECT * FROM protection_officers WHERE user_id = auth.uid();

-- Check policy logic
EXPLAIN (ANALYZE, VERBOSE)
SELECT * FROM protection_assignments
WHERE cpo_id IN (SELECT id FROM protection_officers WHERE user_id = auth.uid());
```

### Issue: "Permission denied"

**Possible Causes:**
1. No policy exists for the operation
2. Policy logic doesn't match user context
3. RLS enabled but no matching policy

**Debug Steps:**

```sql
-- Check if RLS is enabled
SELECT rowsecurity FROM pg_tables WHERE tablename = 'protection_officers';

-- Check policies for table
SELECT * FROM pg_policies WHERE tablename = 'protection_officers';

-- Check user context
SELECT
  auth.uid() AS user_id,
  is_cpo(auth.uid()) AS is_cpo,
  get_cpo_id(auth.uid()) AS cpo_id;
```

### Issue: "Slow query performance"

**Possible Causes:**
1. Missing index on filtered columns
2. Complex policy logic
3. Multiple nested EXISTS clauses

**Debug Steps:**

```sql
-- Check query execution plan
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM protection_assignments;

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_protection_assignments_cpo_id
  ON protection_assignments(cpo_id);

CREATE INDEX IF NOT EXISTS idx_protection_officers_user_id
  ON protection_officers(user_id);
```

---

## 📚 Helper Functions Reference

### `is_cpo(user_uuid UUID) → BOOLEAN`

Checks if a user is a CPO.

```sql
-- Usage in policies
CREATE POLICY "CPOs only"
  ON some_table
  FOR SELECT
  USING (is_cpo(auth.uid()));

-- Direct usage
SELECT is_cpo('user-uuid-here'); -- true or false
```

### `get_cpo_id(user_uuid UUID) → UUID`

Returns the CPO profile ID for a user.

```sql
-- Usage in policies
CREATE POLICY "CPO own data"
  ON some_table
  FOR SELECT
  USING (cpo_id = get_cpo_id(auth.uid()));

-- Direct usage
SELECT get_cpo_id('user-uuid-here'); -- CPO profile UUID
```

### `is_assignment_principal(user_uuid UUID, assignment_uuid UUID) → BOOLEAN`

Checks if user is the principal for an assignment.

```sql
-- Usage
SELECT is_assignment_principal(auth.uid(), 'assignment-uuid'); -- true/false
```

### `is_assignment_cpo(user_uuid UUID, assignment_uuid UUID) → BOOLEAN`

Checks if user is the CPO for an assignment.

```sql
-- Usage
SELECT is_assignment_cpo(auth.uid(), 'assignment-uuid'); -- true/false
```

---

## 🔒 Security Best Practices

### ✅ DO

- **Always use `auth.uid()`** for user identification in policies
- **Test policies with real user sessions** before deploying
- **Use service role ONLY in backend code** (Edge Functions, webhooks)
- **Keep policies simple** - complex logic = performance issues
- **Add indexes** on columns used in policy filters
- **Monitor query performance** after enabling RLS
- **Document custom policies** in migration files

### ❌ DON'T

- **Don't disable RLS in production** - ever!
- **Don't use `USING (true)` for user policies** - only for service role
- **Don't expose service role key** in client-side code
- **Don't trust user input** in policy logic
- **Don't create overly complex policies** - split into multiple
- **Don't forget to test edge cases** (empty results, unauthorized access)
- **Don't skip verification** after applying migrations

---

## 🚨 Emergency Procedures

### Disable RLS on a Table (ONLY IF CRITICAL BUG)

```sql
-- ⚠️ WARNING: Only use in emergency!
ALTER TABLE protection_assignments DISABLE ROW LEVEL SECURITY;

-- Fix the issue, then re-enable
ALTER TABLE protection_assignments ENABLE ROW LEVEL SECURITY;
```

### Temporarily Grant Full Access (DEBUGGING ONLY)

```sql
-- ⚠️ WARNING: Removes all security! Never use in production!
CREATE POLICY "temp_full_access"
  ON protection_assignments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- REMEMBER TO DROP AFTER DEBUGGING
DROP POLICY "temp_full_access" ON protection_assignments;
```

### Rollback RLS Migration

```sql
-- Drop all policies
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Disable RLS on all tables
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true)
  LOOP
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;

-- Drop helper functions
DROP FUNCTION IF EXISTS is_cpo(UUID);
DROP FUNCTION IF EXISTS get_cpo_id(UUID);
DROP FUNCTION IF EXISTS is_assignment_principal(UUID, UUID);
DROP FUNCTION IF EXISTS is_assignment_cpo(UUID, UUID);
```

---

## 📞 Support

- **Documentation:** `/workspaces/armoracpo/supabase/migrations/README_RLS.md`
- **Verification Script:** `20250103_verify_rls.sql`
- **Main Migration:** `20250103_enable_rls_policies.sql`
- **Supabase RLS Docs:** https://supabase.com/docs/guides/auth/row-level-security

---

**Last Updated:** 2025-01-03
**Migration Version:** 20250103_enable_rls_policies
