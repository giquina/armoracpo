# 🔌 Supabase MCP Integration - Armora CPO

## Overview

Model Context Protocol (MCP) integration for Supabase enables Claude Code to directly interact with your Supabase project - reading schemas, executing queries, managing tables, and more.

---

## 🚀 Quick Setup

### **1. Install Supabase MCP Server**

```bash
# Using npx (recommended)
npx @modelcontextprotocol/server-supabase

# Or install globally
npm install -g @modelcontextprotocol/server-supabase
```

### **2. Configure MCP in Claude Code**

Create or update: `~/.claude/mcp.json`

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-supabase"
      ],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key",
        "SUPABASE_PROJECT_ID": "your-project-id"
      }
    }
  }
}
```

⚠️ **IMPORTANT:** Use **Service Role Key** (not anon key) for MCP - it has admin privileges.

---

## 🔐 Getting Supabase Credentials

### **From Supabase Dashboard:**

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Settings → API
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **Project ID** → `SUPABASE_PROJECT_ID`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (click "Reveal" to see)

---

## 📋 MCP Tools Available

### **1. Query Database**

```javascript
// Claude can execute SQL queries directly

// Example: Get all CPO profiles
SELECT * FROM cpo_profiles WHERE operational_status = 'ready';

// Example: Get assignments with CPO details
SELECT
  a.*,
  c.full_name,
  c.sia_license_number
FROM assignments a
JOIN cpo_profiles c ON a.cpo_id = c.id
WHERE a.status = 'active';
```

### **2. Read Table Schema**

```javascript
// Claude can inspect table structure
DESCRIBE cpo_profiles;

// Or get all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

### **3. Insert Data**

```javascript
// Claude can insert test data
INSERT INTO cpo_profiles (
  id,
  full_name,
  sia_license_number,
  sia_license_type,
  sia_expiry_date
) VALUES (
  uuid_generate_v4(),
  'John Smith',
  '1234567890123456',
  'Close Protection',
  '2026-12-31'
);
```

### **4. Update Records**

```javascript
// Claude can update data
UPDATE cpo_profiles
SET operational_status = 'ready'
WHERE id = 'cpo-id-here';
```

### **5. Check RLS Policies**

```javascript
// Claude can view Row Level Security policies
SELECT * FROM pg_policies WHERE tablename = 'cpo_profiles';
```

### **6. Analyze Performance**

```javascript
// Claude can analyze query performance
EXPLAIN ANALYZE
SELECT * FROM assignments
WHERE cpo_id = 'some-id'
AND status = 'active';
```

---

## 🎯 Common MCP Use Cases

### **Use Case 1: Schema Validation**

```
You: "Check if the cpo_profiles table has all the columns from supabase.md"

Claude (via MCP):
1. Reads cpo_profiles schema
2. Compares with documentation
3. Reports missing columns
4. Suggests ALTER TABLE commands
```

### **Use Case 2: Test Data Generation**

```
You: "Create 10 sample CPO profiles for testing"

Claude (via MCP):
1. Generates realistic test data
2. Inserts into cpo_profiles
3. Creates related qualifications
4. Adds compliance documents
5. Returns summary of created data
```

### **Use Case 3: Database Migrations**

```
You: "Add a geofencing feature to assignments table"

Claude (via MCP):
1. Analyzes current schema
2. Creates migration SQL
3. Tests migration on sample data
4. Provides rollback script
```

### **Use Case 4: Data Integrity Checks**

```
You: "Find CPOs with expired SIA licenses"

Claude (via MCP):
1. Queries cpo_profiles
2. Checks sia_expiry_date
3. Returns list of expired licenses
4. Suggests automated reminder system
```

### **Use Case 5: Performance Optimization**

```
You: "Optimize slow assignment queries"

Claude (via MCP):
1. Analyzes query execution plans
2. Identifies missing indexes
3. Creates appropriate indexes
4. Measures performance improvement
```

---

## 🛠️ MCP Configuration Options

### **Advanced Configuration**

```json
{
  "mcpServers": {
    "supabase-armora-cpo": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-supabase"
      ],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key",
        "SUPABASE_PROJECT_ID": "your-project-id",
        "SUPABASE_DB_SCHEMA": "public",
        "SUPABASE_MAX_ROWS": "1000"
      },
      "disabled": false,
      "alwaysAllow": [
        "SELECT",
        "DESCRIBE"
      ]
    }
  }
}
```

### **Multiple Supabase Projects**

```json
{
  "mcpServers": {
    "supabase-dev": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "https://dev-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "dev-key",
        "SUPABASE_PROJECT_ID": "dev-project-id"
      }
    },
    "supabase-prod": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "https://prod-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "prod-key",
        "SUPABASE_PROJECT_ID": "prod-project-id"
      }
    }
  }
}
```

---

## 🔒 Security Best Practices

### **1. Environment Variables**

**Never hardcode keys in mcp.json!** Use environment variables:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_SERVICE_ROLE_KEY": "${SUPABASE_SERVICE_ROLE_KEY}",
        "SUPABASE_PROJECT_ID": "${SUPABASE_PROJECT_ID}"
      }
    }
  }
}
```

Then set in your shell:

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export SUPABASE_PROJECT_ID="your-project-id"
```

### **2. Read-Only MCP (Safer)**

For production, create a read-only role:

```sql
-- Create read-only role
CREATE ROLE mcp_readonly;

-- Grant read access to all tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO mcp_readonly;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO mcp_readonly;

-- Create user for MCP
CREATE USER mcp_user WITH PASSWORD 'secure-password';
GRANT mcp_readonly TO mcp_user;
```

Then use this user's credentials in MCP config.

### **3. Audit Logging**

Enable audit logging for MCP queries:

```sql
-- Create audit log table
CREATE TABLE mcp_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query TEXT NOT NULL,
  executed_by TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  rows_affected INTEGER
);

-- Create function to log queries
CREATE OR REPLACE FUNCTION log_mcp_query()
RETURNS event_trigger AS $$
BEGIN
  INSERT INTO mcp_audit_log (query, executed_by)
  VALUES (current_query(), current_user);
END;
$$ LANGUAGE plpgsql;

-- Create event trigger
CREATE EVENT TRIGGER mcp_query_logger
  ON ddl_command_end
  EXECUTE FUNCTION log_mcp_query();
```

---

## 📊 MCP Query Examples

### **Example 1: CPO Dashboard Data**

```sql
-- Get CPO dashboard summary
SELECT
  cp.full_name,
  cp.operational_status,
  cp.compliance_score,
  COUNT(DISTINCT a.id) as total_assignments,
  SUM(e.net_amount) as total_earnings,
  AVG(r.rating) as average_rating
FROM cpo_profiles cp
LEFT JOIN assignments a ON a.cpo_id = cp.id
LEFT JOIN earnings e ON e.cpo_id = cp.id
LEFT JOIN reviews r ON r.reviewee_id = cp.id
WHERE cp.id = 'cpo-id-here'
GROUP BY cp.id;
```

### **Example 2: Compliance Status**

```sql
-- Get all CPOs with expiring documents
SELECT
  cp.full_name,
  cp.sia_expiry_date,
  cp.dbs_status,
  cd.document_type,
  cd.expiry_date
FROM cpo_profiles cp
LEFT JOIN compliance_documents cd ON cd.cpo_id = cp.id
WHERE
  cp.sia_expiry_date <= NOW() + INTERVAL '30 days'
  OR cd.expiry_date <= NOW() + INTERVAL '30 days'
ORDER BY cp.sia_expiry_date, cd.expiry_date;
```

### **Example 3: Active Assignments Map**

```sql
-- Get all active assignments with locations
SELECT
  a.id,
  a.reference,
  a.assignment_type,
  a.pickup_address,
  ST_X(a.pickup_location::geometry) as pickup_lng,
  ST_Y(a.pickup_location::geometry) as pickup_lat,
  a.destination_address,
  ST_X(a.destination_location::geometry) as dest_lng,
  ST_Y(a.destination_location::geometry) as dest_lat,
  cp.full_name as cpo_name,
  a.status
FROM assignments a
JOIN cpo_profiles cp ON a.cpo_id = cp.id
WHERE a.status IN ('active', 'en_route', 'on_station');
```

### **Example 4: Revenue Analytics**

```sql
-- Get earnings breakdown by assignment type
SELECT
  a.assignment_type,
  COUNT(a.id) as total_assignments,
  SUM(a.total_amount) as total_revenue,
  AVG(a.total_amount) as avg_assignment_value,
  SUM(a.total_hours) as total_hours
FROM assignments a
WHERE a.status = 'completed'
  AND a.actual_end >= NOW() - INTERVAL '30 days'
GROUP BY a.assignment_type
ORDER BY total_revenue DESC;
```

---

## 🧪 Testing MCP Connection

### **Test Script**

```bash
#!/bin/bash
# test-supabase-mcp.sh

echo "Testing Supabase MCP Connection..."

# Test 1: Check if MCP server responds
echo "1. Testing MCP server..."
npx @modelcontextprotocol/server-supabase --version

# Test 2: Simple query
echo "2. Testing database query..."
# (This would be done through Claude Code interface)

echo "MCP connection test complete!"
```

### **Via Claude Code**

```
You: "Test Supabase MCP connection and show me the cpo_profiles table structure"

Claude (via MCP):
✓ Connected to Supabase
✓ Database: armora-cpo
✓ Schema: public

Table: cpo_profiles
Columns:
- id (uuid, primary key)
- full_name (text)
- sia_license_number (text, unique)
- operational_status (text)
[... full schema ...]

Connection successful! 🎉
```

---

## 🔄 MCP Workflows

### **Workflow 1: Development Setup**

```
1. You: "Set up the CPO database schema from supabase.md"

2. Claude (via MCP):
   - Reads supabase.md
   - Executes CREATE TABLE statements
   - Sets up RLS policies
   - Creates indexes
   - Generates sample data
   - Returns summary

3. You: "Verify all tables are created correctly"

4. Claude (via MCP):
   - Lists all tables
   - Checks constraints
   - Validates relationships
   - Reports status
```

### **Workflow 2: Data Migration**

```
1. You: "Migrate CPO data from old system (CSV file)"

2. Claude (via MCP):
   - Reads CSV structure
   - Maps to cpo_profiles schema
   - Validates data
   - Inserts with error handling
   - Reports results

3. You: "Verify data integrity"

4. Claude (via MCP):
   - Counts records
   - Checks for duplicates
   - Validates foreign keys
   - Returns report
```

### **Workflow 3: Performance Tuning**

```
1. You: "Find and fix slow queries"

2. Claude (via MCP):
   - Analyzes pg_stat_statements
   - Identifies slow queries
   - Explains query plans
   - Suggests indexes
   - Creates optimizations
   - Measures improvements
```

---

## 📚 MCP Commands Reference

### **Schema Operations**

```sql
-- List all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Describe table
\d+ cpo_profiles

-- List indexes
SELECT * FROM pg_indexes WHERE tablename = 'cpo_profiles';

-- List foreign keys
SELECT * FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY';
```

### **Data Operations**

```sql
-- Count records
SELECT COUNT(*) FROM cpo_profiles;

-- Sample data
SELECT * FROM cpo_profiles LIMIT 5;

-- Check for nulls
SELECT COUNT(*) FROM cpo_profiles WHERE sia_license_number IS NULL;
```

### **Monitoring Operations**

```sql
-- Active connections
SELECT * FROM pg_stat_activity;

-- Database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🐛 Troubleshooting

### **Issue: MCP Server Not Starting**

```bash
# Check if Supabase MCP is installed
npm list -g @modelcontextprotocol/server-supabase

# Reinstall if needed
npm install -g @modelcontextprotocol/server-supabase

# Check MCP logs
tail -f ~/.claude/logs/mcp-supabase.log
```

### **Issue: Authentication Failed**

```bash
# Verify credentials
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Test direct connection
curl -X GET \
  "${SUPABASE_URL}/rest/v1/cpo_profiles?select=count" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}"
```

### **Issue: Query Timeout**

```json
// Increase timeout in MCP config
{
  "mcpServers": {
    "supabase": {
      "env": {
        "SUPABASE_QUERY_TIMEOUT": "30000"
      }
    }
  }
}
```

---

## 🎯 Best Practices

1. **Always use Service Role Key** - Anon key won't work for MCP
2. **Test queries in Supabase SQL Editor first** - Validate before MCP
3. **Use transactions for multi-step operations** - Ensure data integrity
4. **Monitor MCP query performance** - Watch for slow operations
5. **Keep MCP config in version control** - But use env vars for secrets
6. **Document MCP workflows** - Help team understand automation
7. **Regular security audits** - Check who has Service Role access

---

## 📈 Advanced Features

### **Real-time Subscriptions via MCP**

```sql
-- Claude can set up real-time listeners
LISTEN assignments_channel;
```

### **Automated Backups via MCP**

```sql
-- Trigger backup via MCP
SELECT * FROM backup_database();
```

### **Data Analysis via MCP**

```sql
-- Generate analytics report
SELECT
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as assignments,
  SUM(total_amount) as revenue
FROM assignments
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date;
```

---

**Supabase MCP setup complete! 🔌**

Claude can now directly interact with your Armora CPO database.
