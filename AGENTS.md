# Agent Workflow Guide

This file provides practical guidance on using Claude Code agents (sub-tasks) when working with this React TypeScript mobile app repository.

## When to Use Agents

Delegate to sub-agents when you have **independent, parallelizable tasks** that don't depend on each other's results:

### Good Use Cases
- **Multi-file updates**: Updating similar patterns across multiple screens (e.g., adding DevPanel to all screens)
- **Parallel code review**: Reviewing multiple independent components or screens simultaneously
- **Research tasks**: Gathering information from different parts of the codebase at the same time
- **Testing multiple screens**: Running tests or checks across different feature areas
- **Documentation generation**: Creating docs for different modules in parallel
- **Bulk refactoring**: Applying the same pattern changes to multiple files

### When NOT to Use Agents
- **Sequential tasks**: When task B depends on the output of task A
- **Single file edits**: Simple changes to one file
- **Exploratory work**: When you need to understand the codebase first
- **Complex interdependent changes**: When files interact in ways that require coordinated updates

## Common Agent Patterns

### Pattern 1: Multi-Screen Updates

When you need to apply the same change across multiple screens:

```
Task: Add analytics tracking to all authentication screens

Agent 1: Update Login.tsx
Agent 2: Update Signup.tsx
Agent 3: Update Welcome.tsx
```

**When to use**: Applying consistent changes to 3+ independent screen files.

### Pattern 2: Component Library Updates

When updating multiple UI components with similar changes:

```
Task: Add error boundary to all dashboard widgets

Agent 1: Update QuickStatsWidget.tsx
Agent 2: Update RecentActivityFeed.tsx
Agent 3: Update UpcomingAssignmentsWidget.tsx
Agent 4: Update RecentIncidentsWidget.tsx
```

**When to use**: Updating 4+ components with the same pattern.

### Pattern 3: Parallel Code Review

When reviewing different feature areas:

```
Task: Review all screens for accessibility compliance

Agent 1: Review Auth screens (Login, Signup, Welcome)
Agent 2: Review Dashboard and Incidents screens
Agent 3: Review Jobs and Earnings screens
Agent 4: Review Profile and Settings screens
```

**When to use**: Reviewing 10+ files organized by feature area.

### Pattern 4: Multi-Service Research

When gathering information from different parts of the codebase:

```
Task: Document all Firebase service integrations

Agent 1: Research authentication services
Agent 2: Research Cloud Messaging implementation
Agent 3: Research storage usage patterns
Agent 4: Research realtime database usage
```

**When to use**: Investigating independent service integrations or API usage.

### Pattern 5: Testing Across Features

When running tests or validation across multiple areas:

```
Task: Verify proper error handling across all API services

Agent 1: Check Auth API error handling
Agent 2: Check Jobs API error handling
Agent 3: Check Incidents API error handling
Agent 4: Check Messages API error handling
```

**When to use**: Validating a cross-cutting concern across multiple services.

## Project-Specific Patterns

### This Codebase Structure

```
src/
├── screens/          # 14 main screen directories
├── components/       # Organized by feature (dashboard, jobs, incidents, etc.)
├── contexts/         # React contexts for state management
├── services/         # API and Firebase services
└── utils/           # Utility functions
```

### Screen Organization Pattern

Screens are organized by feature area:
- **Auth**: Login, Signup (authentication flow)
- **Dashboard**: Main dashboard view
- **Jobs**: Jobs, AvailableJobs, ActiveJob, JobHistory
- **Incidents**: IncidentReports, IncidentReportDetail, NewIncidentReport
- **Messages**: Messages, MessageChat
- **Profile**: Profile management
- **Settings**: App settings
- **Compliance**: SIA compliance tracking
- **Earnings**: Payment and earnings history
- **DOB**: Daily Occurrence Book
- **Welcome/Splash**: Onboarding screens

### Typical Multi-Screen Agent Tasks

For this codebase, common multi-screen tasks include:

1. **Adding DevPanel to screens** (done)
2. **Updating Firebase imports** across screens
3. **Adding error boundaries** to all screens
4. **Implementing loading states** consistently
5. **Adding analytics tracking** to screen views
6. **Updating theme variables** across styled components

## Examples

### Example 1: Adding Feature to Multiple Screens

**Scenario**: Add a new error toast notification system to all main screens.

**Without agents** (sequential):
```
1. Update Dashboard.tsx
2. Update Jobs.tsx
3. Update Incidents.tsx
4. Update Messages.tsx
... (10+ more files, taking 15-20 minutes)
```

**With agents** (parallel):
```
Agent 1: Update Dashboard, Welcome, Splash screens
Agent 2: Update Auth screens (Login, Signup)
Agent 3: Update Jobs screens (Jobs, AvailableJobs, ActiveJob, JobHistory)
Agent 4: Update Incidents screens (IncidentReports, IncidentReportDetail, NewIncidentReport)
Agent 5: Update remaining screens (Messages, Profile, Settings, Compliance, Earnings, DOB)
```

**Result**: 5 agents complete in ~3-5 minutes instead of 15-20 minutes sequentially.

### Example 2: Code Review Across Components

**Scenario**: Review all dashboard components for performance issues.

**Without agents**:
```
1. Manually review each component file
2. Check for unnecessary re-renders
3. Identify missing React.memo or useMemo
4. Document findings
... (time-consuming and error-prone)
```

**With agents**:
```
Agent 1: Review dashboard widgets (QuickStatsWidget, QuickStatsCard, RecentActivityFeed)
Agent 2: Review assignment components (ActiveAssignmentCard, UpcomingAssignmentsWidget)
Agent 3: Review insight components (PerformanceInsights, EarningsSummary)
Agent 4: Review dashboard-specific UI (AvailabilityToggle, SIAVerificationBadge)
```

**Result**: Comprehensive review completed in parallel, with each agent focusing on a specific area.

### Example 3: Research and Documentation

**Scenario**: Document all API integration points for deployment.

**Without agents**:
```
1. Search through all services
2. Identify API endpoints
3. Document authentication methods
4. Note error handling patterns
5. List environment variables needed
... (tedious manual documentation)
```

**With agents**:
```
Agent 1: Research and document Auth API integration (login, signup, token management)
Agent 2: Research and document Jobs API integration (fetching, filtering, applications)
Agent 3: Research and document Incidents API integration (reports, media upload, signatures)
Agent 4: Research and document Messages API integration (realtime chat, notifications)
Agent 5: Research and document Firebase Cloud Messaging setup and usage
```

**Result**: Complete API documentation generated in parallel, each agent specializing in one service area.

## Best Practices

1. **Group by independence**: Only parallelize truly independent tasks
2. **Balance workload**: Distribute similar amounts of work to each agent
3. **Keep context focused**: Each agent should have a clear, specific task
4. **Use for repetitive tasks**: Agents excel at applying the same pattern multiple times
5. **Avoid over-parallelization**: Don't create 20 agents for 20 files; group into 4-5 logical areas
6. **Consider dependencies**: If files import each other, they may need coordinated updates
7. **Review agent outputs**: Always verify that parallel changes maintain consistency

## Anti-Patterns to Avoid

1. **Sequential dependencies**: Don't use agents when task B needs task A's result
2. **Micro-agents**: Don't create 1 agent per file for 2-line changes
3. **Complex coordination**: Don't parallelize when files have complex interdependencies
4. **Exploratory tasks**: Don't use agents when you're still understanding the codebase
5. **Context-heavy changes**: Don't parallelize when each change requires understanding the whole system

## Agent Decision Tree

```
Do I have 3+ similar tasks?
├─ No → Do it yourself sequentially
└─ Yes
    │
    Are the tasks independent?
    ├─ No → Do it yourself sequentially
    └─ Yes
        │
        Does each task require different context?
        ├─ Yes → Consider using agents (4-6 agents max)
        └─ No → Do it yourself (copy-paste pattern)
```

## Related Documentation

- See `/docs/agents.md` for conceptual agent patterns and validation workflows
- See `/docs/00-START-HERE.md` for project overview and setup
- See `/docs/react.md` for React-specific patterns in this codebase

---

**Remember**: Agents are most valuable for parallelizing independent, repetitive tasks. When in doubt, start sequential and refactor to parallel only when the pattern becomes clear.
