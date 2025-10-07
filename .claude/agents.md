# ArmoraCPO - Custom Agent Definitions

**Last Updated:** October 7, 2025
**Purpose:** Define specialized sub-agents for complex tasks in the ArmoraCPO platform

---

## 🤖 Available Custom Agents

### 1. `/agent-supabase` - Supabase Integration Expert
**Specialization:** Database, auth, storage, RLS policies, real-time subscriptions

**When to use:**
- Setting up new database tables or migrations
- Debugging Supabase auth issues
- Configuring Row Level Security (RLS) policies
- Testing real-time subscriptions
- Storage bucket configuration

**Example:**
```
/agent-supabase
Please audit all RLS policies and ensure CPOs can only access their own assignments
```

---

### 2. `/agent-firebase` - Firebase & Push Notifications Expert
**Specialization:** FCM, service workers, push notifications, Firebase config

**When to use:**
- Setting up Firebase Cloud Messaging
- Debugging notification delivery issues
- Configuring service workers for push
- Testing notification permissions
- FCM token management

**Example:**
```
/agent-firebase
The push notifications aren't working on production. Debug and fix the FCM setup.
```

---

### 3. `/agent-mobile-ui` - Mobile UI/UX Specialist
**Specialization:** React Native-style UI, responsive design, animations, accessibility

**When to use:**
- Creating new mobile-first components
- Improving animations and transitions
- Fixing responsive design issues
- Accessibility improvements (WCAG compliance)
- Touch gesture handling

**Example:**
```
/agent-mobile-ui
Create a swipeable card interface for the Available Jobs screen with smooth animations
```

---

### 4. `/agent-security` - Security & Compliance Auditor
**Specialization:** Security best practices, data privacy, GDPR, authentication, encryption

**When to use:**
- Security audits before deployment
- Implementing data encryption
- GDPR/privacy compliance checks
- Securing API endpoints
- Reviewing authentication flows

**Example:**
```
/agent-security
Audit the entire codebase for security vulnerabilities before Play Store submission
```

---

### 5. `/agent-deployment` - Deployment & DevOps Specialist
**Specialization:** Vercel deployment, environment variables, CI/CD, build optimization

**When to use:**
- Deploying to production (Vercel/Google Play)
- Setting up environment variables
- Optimizing build size and performance
- CI/CD pipeline configuration
- Troubleshooting deployment errors

**Example:**
```
/agent-deployment
Deploy the latest changes to Vercel and ensure all environment variables are configured correctly
```

---

## 📋 Agent Usage Guidelines

### How to Invoke Agents
Use the `/` prefix followed by the agent name in your message:

```
/agent-supabase
Please check if all database migrations are applied and RLS policies are active
```

### When to Use Sub-Agents vs. Main Claude
| Use Main Claude | Use Sub-Agent |
|----------------|---------------|
| Simple file edits | Complex multi-step tasks |
| Quick searches | Specialized domain expertise |
| Code reviews | Security audits |
| General questions | Integration-specific work |

### Multi-Agent Collaboration
For complex tasks, you can invoke multiple agents:

```
/agent-supabase /agent-firebase
Ensure user authentication tokens are synced between Supabase Auth and Firebase FCM
```

---

## 🔄 Agent Coordination

### Preventing Duplicate Work
- Each agent logs its work in `/AGENT_WORK_LOG.md`
- Before starting work, agents check this log
- Agents update the log immediately after completing tasks

### Agent Communication Protocol
1. **Before starting:** Check `AGENT_WORK_LOG.md` for recent work
2. **During work:** Update `todo.md` with current status
3. **After completion:** Log results in `AGENT_WORK_LOG.md`
4. **Handoff:** Tag next agent if follow-up work is needed

---

## 📝 Example Agent Workflow

```
User: /agent-supabase /agent-security
Set up the protection_assignments table with proper RLS policies

→ agent-supabase:
  1. Creates migration for protection_assignments table
  2. Adds RLS policies (CPOs can only see their own assignments)
  3. Tests database access patterns
  4. Logs work in AGENT_WORK_LOG.md
  5. Tags agent-security for audit

→ agent-security:
  1. Reviews RLS policies from AGENT_WORK_LOG.md
  2. Tests for security vulnerabilities
  3. Validates data access controls
  4. Provides security approval
  5. Updates AGENT_WORK_LOG.md with audit results
```

---

## 🎯 Agent Performance Tracking

Each agent maintains metrics in their work log:
- **Tasks Completed:** Count of successful completions
- **Average Time:** Time per task type
- **Error Rate:** Failed tasks requiring retry
- **Handoffs:** Tasks passed to other agents

---

## 🔧 Maintenance

### Adding New Agents
1. Create `/agent-name` command in `.claude/commands/`
2. Document agent purpose and specialization here
3. Add to `AGENT_WORK_LOG.md` tracking
4. Update both Claude instances

### Deprecating Agents
1. Mark as `[DEPRECATED]` in this file
2. Move command to `.claude/commands/deprecated/`
3. Update both Claude instances
4. Archive logs to `AGENT_WORK_LOG_ARCHIVE.md`

---

**Note:** This file is shared between both Claude Code instances to prevent duplicate work and ensure coordination.
