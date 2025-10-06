# Supabase Setup Guide - ArmoraCPO App

## Overview

The ArmoraCPO app uses **Supabase** as the backend database and authentication system. This database is **shared with the Armora Client app** to enable real-time synchronization between clients (principals) and protection officers (CPOs).

## Production Environment

### Existing Production Instance
- **Project URL**: `https://jmzvrqwjmlnvxojculee.supabase.co`
- **Status**: Fully operational and deployed
- **Shared Between**: Armora Client App and ArmoraCPO App

### Environment Variables (Production)

Add these to your `.env` file or deployment environment (Vercel, Netlify, etc.):

```env
REACT_APP_SUPABASE_URL=https://jmzvrqwjmlnvxojculee.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_production_anon_key_here
```

> **Note**: Get the production `REACT_APP_SUPABASE_ANON_KEY` from:
> - Supabase Dashboard → Project Settings → API → `anon` `public` key
> - Or from the Armora Client app repository

---

## Local Development Setup

### Prerequisites

1. **Docker Desktop** - Required for running local Supabase
   - Install from: https://docs.docker.com/desktop
   - Ensure Docker is running before starting Supabase

2. **Supabase CLI** - Installed via npm (already in package.json)
   ```bash
   npx supabase --version
   ```

### Step 1: Configure Environment Variables

Create a `.env` file in the project root:

```env
# Supabase Local Development
REACT_APP_SUPABASE_URL=http://127.0.0.1:54321
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Development Server
HOST=0.0.0.0
PORT=3000
TSC_COMPILE_ON_ERROR=true
```

> **Note**: The anon key above is the standard Supabase local development key (safe for local use only).

### Step 2: Start Local Supabase

```bash
# Start all Supabase services (Postgres, Auth, Realtime, Storage, etc.)
npx supabase start
```

**Expected output:**
```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Services Available:**
- **API**: http://127.0.0.1:54321 (Supabase API endpoint)
- **Studio**: http://127.0.0.1:54323 (Database management UI)
- **Inbucket**: http://127.0.0.1:54324 (Email testing)

### Step 3: Run Database Migrations

Migrations are automatically applied when you start Supabase. To manually apply migrations:

```bash
# Apply all migrations to local database
npx supabase db reset

# Or push migrations without resetting
npx supabase db push
```

**Migration Files (Applied in Order):**
1. `20250101000000_initial_schema.sql` - Core tables (protection_officers, protection_assignments, etc.)
2. `20250102000000_create_assignment_messages.sql` - Messaging feature
3. `20250103_enable_rls_policies.sql` - Row Level Security policies
4. `20250103_insert_test_data.sql` - Test/seed data
5. `20250103_verify_rls.sql` - RLS verification

### Step 4: Seed Development Data

The database will automatically be seeded with test data from `supabase/seed.sql` when you run `npx supabase db reset`.

**Test Data Includes:**
- 5 CPO profiles (James Mitchell, Amara Okafor, David Thompson, Priya Sharma, Marcus Johnson)
- 8 protection assignments (pending, assigned, active, completed, cancelled)
- 4 payment records
- 2 incident reports
- 5 assignment messages

**Test Login Credentials:**
```
Email: james.mitchell@armoracpo.test
Password: (Set your own via Supabase Studio)
```

### Step 5: Start Development Server

```bash
npm start
```

The app will connect to your local Supabase instance at `http://127.0.0.1:54321`.

---

## Database Schema

### Core Tables

#### 1. `protection_officers` (CPO Profiles)
- Personal information (name, email, phone, DOB)
- SIA license details (number, type, expiry)
- Address and emergency contacts
- Vehicle information
- Banking details for payouts
- Availability and GPS location
- Performance metrics (rating, total assignments)
- Verification status

#### 2. `protection_assignments` (Jobs)
- Pickup/dropoff locations with GPS
- Scheduling (scheduled vs actual times)
- Assignment type (close_protection, event_security, residential, executive, transport)
- Threat level (low, medium, high, critical)
- Status (pending, assigned, en_route, active, completed, cancelled)
- Financial tracking (base_rate, duration, total_cost)
- Client details and requirements

#### 3. `assignment_messages` (Real-time Chat)
- Assignment-specific messaging
- Sender type (principal or CPO)
- Read status tracking

#### 4. `payment_records` (Financial Transactions)
- Amount and currency
- Payment method (bank_transfer, stripe, paypal)
- Payment status (pending, processing, completed, failed)
- Stripe integration support

#### 5. `incident_reports` (Security Incidents)
- Incident type (threat, medical, property_damage, protocol_breach)
- Severity (low, medium, high, critical)
- GPS location
- Evidence attachments (photos, videos)
- Police involvement tracking

### Row Level Security (RLS)

All tables have **RLS enabled** with strict policies:
- CPOs can only view their own profile
- CPOs can see pending assignments OR their assigned assignments
- CPOs can only see payments/incidents for their assignments
- Principals can only see their own assignments
- Messages are restricted to assignment participants

**Documentation:**
- `supabase/migrations/README_RLS.md` - Complete RLS guide
- `supabase/migrations/RLS_INDEX.md` - Policy index
- `supabase/migrations/RLS_QUICK_REFERENCE.md` - Quick reference
- `supabase/migrations/RLS_SECURITY_DIAGRAM.md` - Security diagrams

---

## Deployment

### Deploying to Production

**Option 1: Use Existing Production Instance** (Recommended)

The production Supabase instance already exists and is shared with the Armora Client app. Simply configure your production environment variables:

```env
REACT_APP_SUPABASE_URL=https://jmzvrqwjmlnvxojculee.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<get_from_supabase_dashboard>
```

**Option 2: Create New Supabase Project** (Not recommended - will break client integration)

If you need a separate instance:

1. Go to https://supabase.com/dashboard
2. Create new project
3. Apply migrations:
   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
4. Update environment variables in your deployment platform

### Migration Management

**Adding New Migrations:**
```bash
# Create a new migration file
npx supabase migration new <migration_name>

# Edit the generated file in supabase/migrations/
# Then apply it:
npx supabase db push
```

**Reverting Migrations:**
```bash
# Reset database to clean state
npx supabase db reset

# Or manually drop/recreate tables via Studio
```

---

## Troubleshooting

### Issue: "Cannot connect to Docker daemon"

**Solution**: Ensure Docker Desktop is installed and running.

```bash
# Check Docker status
docker --version
docker ps
```

### Issue: "Failed to inspect service"

**Solution**: Restart Docker Desktop and try again.

```bash
npx supabase stop
npx supabase start
```

### Issue: "Migration failed"

**Solution**: Check migration syntax and database logs.

```bash
# View Supabase logs
npx supabase status
npx supabase db reset --debug
```

### Issue: "RLS policy blocking access"

**Solution**: Verify you're authenticated and your user has the correct permissions.

```bash
# Test RLS policies
npx supabase db test
```

---

## Useful Commands

```bash
# Start Supabase
npx supabase start

# Stop Supabase
npx supabase stop

# View status
npx supabase status

# Reset database (applies all migrations + seed data)
npx supabase db reset

# Open Studio UI
open http://127.0.0.1:54323

# View logs
npx supabase logs

# Create migration
npx supabase migration new <name>

# Link to remote project
npx supabase link --project-ref <ref>

# Push migrations to remote
npx supabase db push

# Pull remote changes
npx supabase db pull
```

---

## Additional Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Supabase CLI Reference**: https://supabase.com/docs/guides/cli
- **Row Level Security Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **Local Development**: https://supabase.com/docs/guides/local-development

---

## Support

For issues or questions:
1. Check the RLS documentation in `supabase/migrations/README_RLS.md`
2. Review the schema documentation in `docs/SHARED_SCHEMA.md`
3. Consult the cross-app integration guide in `docs/CROSS_APP_INTEGRATION.md`
