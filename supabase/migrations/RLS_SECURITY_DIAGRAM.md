# RLS Security Architecture - Armora CPO

## 🏗️ Security Model Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SUPABASE DATABASE                           │
│                     Row Level Security (RLS) Enabled                │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
            ┌───────▼───────┐ ┌──▼──────┐ ┌────▼─────────┐
            │   CPO User    │ │Principal│ │ Service Role │
            │  (Operator)   │ │ (Client)│ │   (Backend)  │
            └───────┬───────┘ └──┬──────┘ └────┬─────────┘
                    │             │             │
                    │             │             │ (Bypasses RLS)
                    │             │             │
            ┌───────▼─────────────▼─────────────▼──────────┐
            │         RLS POLICY ENFORCEMENT LAYER         │
            └──────────────────┬───────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
    ┌───▼────┐         ┌──────▼──────┐       ┌──────▼─────┐
    │  CPO   │         │ Assignment  │       │  Storage   │
    │ Tables │         │   Tables    │       │  Buckets   │
    └────────┘         └─────────────┘       └────────────┘
```

---

## 🔐 Access Control Matrix

### CPO User Access

```
┌─────────────────────────────────────────────────────────────┐
│                       CPO CAN ACCESS:                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ protection_officers       → Own profile ONLY            │
│  ✅ protection_assignments    → Own + Pending jobs          │
│  ✅ payment_records           → Own payments ONLY           │
│  ✅ earnings                  → Own earnings ONLY           │
│  ✅ incident_reports          → Own reports (full CRUD)     │
│  ✅ messages                  → Own assignment messages     │
│  ✅ reviews                   → Reviews about self          │
│  ✅ cpo_qualifications        → Own certs (full CRUD)       │
│  ✅ compliance_documents      → Own docs (full CRUD)        │
│  ✅ cpo_availability          → Own schedule (full CRUD)    │
│                                                             │
│  ❌ OTHER CPOS' DATA          → BLOCKED                     │
│  ❌ PRINCIPAL PRIVATE DATA    → BLOCKED                     │
│  ❌ OTHER ASSIGNMENTS         → BLOCKED                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Principal User Access

```
┌─────────────────────────────────────────────────────────────┐
│                    PRINCIPAL CAN ACCESS:                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ protection_assignments    → Own assignments ONLY        │
│  ✅ messages                  → Own assignment messages     │
│  ✅ incident_reports          → View only (for own work)    │
│  ✅ reviews                   → Reviews about self          │
│                                                             │
│  ❌ CPO PRIVATE DATA          → BLOCKED                     │
│  ❌ CPO EARNINGS              → BLOCKED                     │
│  ❌ OTHER PRINCIPALS          → BLOCKED                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Service Role Access

```
┌─────────────────────────────────────────────────────────────┐
│                   SERVICE ROLE CAN ACCESS:                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ ALL TABLES                → Full CRUD access            │
│  ✅ ALL STORAGE BUCKETS       → Full access                 │
│  ✅ BYPASS RLS                → No restrictions             │
│                                                             │
│  ⚠️  ONLY USE IN BACKEND CODE (Edge Functions, Webhooks)    │
│  ⚠️  NEVER EXPOSE SERVICE KEY IN CLIENT-SIDE CODE           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Policy Decision Flow

### CPO Accessing Assignment Data

```
┌─────────────────────┐
│  CPO makes query    │
│  to assignments     │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────┐
│ Is user authenticated?│
│  (auth.uid() != null) │
└──────────┬───────────┘
           │
      ┌────┴────┐
      │   NO    │ ────► ❌ DENY (Not authenticated)
      └─────────┘
           │
      ┌────┴────┐
      │   YES   │
      └────┬────┘
           │
           ▼
┌──────────────────────────┐
│ Does CPO profile exist?  │
│  protection_officers     │
│  WHERE user_id = auth.uid()│
└──────────┬───────────────┘
           │
      ┌────┴────┐
      │   NO    │ ────► ❌ DENY (Not a CPO)
      └─────────┘
           │
      ┌────┴────┐
      │   YES   │
      └────┬────┘
           │
           ▼
┌─────────────────────────────────┐
│ Check assignment access:        │
│                                 │
│ 1. Assignment assigned to CPO?  │
│    (cpo_id = cpo_profile.id)    │
│         OR                      │
│ 2. Assignment is pending?       │
│    (status = 'pending' AND      │
│     cpo_id IS NULL)             │
└─────────────┬───────────────────┘
              │
         ┌────┴────┐
         │   NO    │ ────► ❌ DENY (Not your assignment)
         └─────────┘
              │
         ┌────┴────┐
         │   YES   │ ────► ✅ ALLOW
         └─────────┘
```

### Principal Accessing Assignment Data

```
┌─────────────────────┐
│ Principal makes     │
│ query to assignments│
└──────────┬──────────┘
           │
           ▼
┌──────────────────────┐
│ Is user authenticated?│
│  (auth.uid() != null) │
└──────────┬───────────┘
           │
      ┌────┴────┐
      │   NO    │ ────► ❌ DENY (Not authenticated)
      └─────────┘
           │
      ┌────┴────┐
      │   YES   │
      └────┬────┘
           │
           ▼
┌──────────────────────────┐
│ Is principal_id = user?  │
│  (principal_id = auth.uid())│
└──────────┬───────────────┘
           │
      ┌────┴────┐
      │   NO    │ ────► ❌ DENY (Not your assignment)
      └─────────┘
           │
      ┌────┴────┐
      │   YES   │ ────► ✅ ALLOW
      └─────────┘
```

---

## 🗂️ Storage Bucket Security

### CPO Profiles Bucket (`cpo-profiles`)

```
┌─────────────────────────────────────────────────────────┐
│ Folder: {cpo_user_id}/profile.jpg                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  UPLOAD (INSERT):                                       │
│    ✅ CPO can upload to own folder                      │
│       (auth.uid() = folder name)                        │
│    ❌ CPO CANNOT upload to other folders                │
│                                                         │
│  VIEW (SELECT):                                         │
│    ✅ Anyone can view (public photos)                   │
│                                                         │
│  UPDATE/DELETE:                                         │
│    ✅ CPO can update/delete own photos                  │
│    ❌ CPO CANNOT modify other photos                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Compliance Documents Bucket (`compliance-documents`)

```
┌─────────────────────────────────────────────────────────┐
│ Folder: {cpo_user_id}/sia-license.pdf                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  UPLOAD (INSERT):                                       │
│    ✅ CPO can upload to own folder                      │
│       (auth.uid() = folder name)                        │
│    ❌ CPO CANNOT upload to other folders                │
│                                                         │
│  VIEW (SELECT):                                         │
│    ✅ CPO can view own documents                        │
│    ✅ Service role can view all (verification)          │
│    ❌ Other CPOs CANNOT view                            │
│    ❌ Principals CANNOT view                            │
│                                                         │
│  DELETE:                                                │
│    ✅ CPO can delete own documents                      │
│    ❌ Others CANNOT delete                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Incident Evidence Bucket (`incident-evidence`)

```
┌─────────────────────────────────────────────────────────┐
│ Folder: {incident_id}/photo.jpg                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  UPLOAD (INSERT):                                       │
│    ✅ CPO can upload for their incidents                │
│       (CPO created the incident)                        │
│    ❌ Others CANNOT upload                              │
│                                                         │
│  VIEW (SELECT):                                         │
│    ✅ CPO who created incident can view                 │
│    ✅ Principal of assignment can view                  │
│    ✅ Service role can view all                         │
│    ❌ Other CPOs CANNOT view                            │
│    ❌ Other Principals CANNOT view                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Helper Functions Architecture

```
┌────────────────────────────────────────────────────────┐
│              HELPER FUNCTIONS (SECURITY)               │
└────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  is_cpo(user_uuid UUID) → BOOLEAN                    │
│                                                      │
│  SELECT EXISTS (                                     │
│    SELECT 1 FROM protection_officers                 │
│    WHERE user_id = user_uuid                         │
│  );                                                  │
│                                                      │
│  Use Case: Check if user is a CPO                   │
│  Example: WHERE is_cpo(auth.uid())                   │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  get_cpo_id(user_uuid UUID) → UUID                   │
│                                                      │
│  SELECT id FROM protection_officers                  │
│  WHERE user_id = user_uuid                           │
│  LIMIT 1;                                            │
│                                                      │
│  Use Case: Get CPO profile ID from user ID          │
│  Example: WHERE cpo_id = get_cpo_id(auth.uid())     │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  is_assignment_principal(user_uuid, assign_uuid)     │
│  → BOOLEAN                                           │
│                                                      │
│  SELECT EXISTS (                                     │
│    SELECT 1 FROM protection_assignments              │
│    WHERE id = assign_uuid                            │
│    AND principal_id = user_uuid                      │
│  );                                                  │
│                                                      │
│  Use Case: Check if user is principal for assignment│
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  is_assignment_cpo(user_uuid, assign_uuid)           │
│  → BOOLEAN                                           │
│                                                      │
│  SELECT EXISTS (                                     │
│    SELECT 1 FROM protection_assignments pa           │
│    JOIN protection_officers po ON po.id = pa.cpo_id │
│    WHERE pa.id = assign_uuid                         │
│    AND po.user_id = user_uuid                        │
│  );                                                  │
│                                                      │
│  Use Case: Check if user is CPO for assignment      │
└──────────────────────────────────────────────────────┘
```

---

## 🚨 Security Boundaries

### Data Isolation Guarantees

```
┌─────────────────────────────────────────────────────────┐
│                  SECURITY GUARANTEES                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. ✅ CPO A CANNOT access CPO B's data                 │
│     - Profile, earnings, qualifications, documents      │
│                                                         │
│  2. ✅ Principal A CANNOT access Principal B's data     │
│     - Assignments, messages, incidents                  │
│                                                         │
│  3. ✅ CPO CANNOT access assignments from other CPOs    │
│     - Unless assignment is pending (available to all)   │
│                                                         │
│  4. ✅ Principal CANNOT access CPO private data         │
│     - Earnings, bank details, compliance docs           │
│                                                         │
│  5. ✅ Storage buckets enforce folder-level isolation   │
│     - Users can only access their own folder            │
│                                                         │
│  6. ✅ Service role operates outside RLS boundaries     │
│     - For admin operations, matching algorithm, etc.    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Attack Vectors Mitigated

```
┌─────────────────────────────────────────────────────────┐
│              ATTACK VECTORS MITIGATED                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ❌ SQL Injection                                       │
│     → Supabase parameterizes all queries               │
│                                                         │
│  ❌ Horizontal Privilege Escalation                     │
│     → RLS prevents access to other users' data          │
│                                                         │
│  ❌ Direct Database Access                              │
│     → All queries go through RLS policy layer           │
│                                                         │
│  ❌ Storage Bucket Enumeration                          │
│     → Folder-based policies prevent discovery           │
│                                                         │
│  ❌ Assignment Data Leakage                             │
│     → CPOs only see their assignments + pending jobs    │
│                                                         │
│  ❌ Earnings/Payment Data Exposure                      │
│     → CPOs can only view own financial records          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📈 Performance Impact

### RLS Overhead

```
┌─────────────────────────────────────────────────────┐
│ Query Type          │ Overhead    │ Mitigation     │
├─────────────────────┼─────────────┼────────────────┤
│ Simple SELECT       │ ~5-10ms     │ Add indexes    │
│ Complex JOIN        │ ~10-30ms    │ Optimize JOIN  │
│ EXISTS subquery     │ ~5-15ms     │ Add indexes    │
│ Storage access      │ ~10-20ms    │ Use CDN        │
└─────────────────────────────────────────────────────┘

RECOMMENDED INDEXES:
  ✅ protection_officers(user_id)
  ✅ protection_assignments(cpo_id)
  ✅ protection_assignments(principal_id)
  ✅ incident_reports(cpo_id)
  ✅ messages(assignment_id)
```

---

## 🎯 Migration Checklist

```
┌─────────────────────────────────────────────────────────┐
│                  DEPLOYMENT CHECKLIST                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  □ Review migration SQL                                 │
│  □ Apply 20250103_enable_rls_policies.sql               │
│  □ Run 20250103_verify_rls.sql                          │
│  □ Check rls_verification_report view                   │
│  □ Test as CPO user (can access own data only)          │
│  □ Test as Principal user (can access own assignments)  │
│  □ Test storage bucket access                           │
│  □ Monitor query performance (EXPLAIN ANALYZE)          │
│  □ Add recommended indexes                              │
│  □ Update application error handling                    │
│  □ Document any custom policies                         │
│  □ Set up monitoring alerts                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

**Security Level:** 🔒 **MAXIMUM**

**Last Updated:** 2025-01-03

**Migration Version:** 20250103_enable_rls_policies
