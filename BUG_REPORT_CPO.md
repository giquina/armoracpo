# BUG REPORT - Armora CPO App

**Generated:** 2025-10-02
**TypeScript Version:** 4.9.5
**React Version:** 19.2.0
**Status:** Production-ready app with recently added messaging system

---

## EXECUTIVE SUMMARY

**Total Bugs Found:** 15
**Critical Severity:** 2
**High Severity:** 4
**Medium Severity:** 6
**Low Severity:** 3

**TypeScript Compilation:** ✅ PASS (no errors)
**Test Suite Status:** ❌ FAIL (module resolution issue)

---

## CRITICAL SEVERITY BUGS

### 🔴 CRITICAL-01: Missing useEffect Dependency in MessageChat
**File:** `/workspaces/armoracpo/src/screens/Messages/MessageChat.tsx`
**Lines:** 18-21
**Category:** React Hooks / Memory Leak

**Issue:**
```typescript
useEffect(() => {
  if (!assignmentId) return;
  loadChatData();
}, [assignmentId]);
```

The `loadChatData` function is called inside `useEffect` but is not included in the dependency array. This violates the exhaustive-deps rule and can cause stale closures.

**Impact:**
- Stale closure bugs where `loadChatData` may reference outdated state
- Unpredictable behavior when component re-renders
- Potential infinite loops if `loadChatData` is added to dependencies without useCallback

**Fix:**
```typescript
const loadChatData = useCallback(async () => {
  try {
    if (!assignmentId) return;
    // ... rest of function
  } catch (error) {
    console.error('Error loading chat:', error);
  } finally {
    setLoading(false);
  }
}, [assignmentId]);

useEffect(() => {
  loadChatData();
}, [loadChatData]);
```

**Priority:** CRITICAL - Fix immediately before production deployment

---

### 🔴 CRITICAL-02: Test Suite Failure - Module Resolution
**File:** `/workspaces/armoracpo/src/App.test.tsx`
**Category:** Testing / Build Configuration

**Issue:**
```
Cannot find module 'react-router-dom' from 'src/App.tsx'
```

The test suite fails to resolve `react-router-dom` even though it's installed in package.json (v7.9.3).

**Impact:**
- No tests can run, blocking CI/CD pipelines
- Cannot verify code quality or catch regressions
- Production deployments lack test verification

**Root Cause:**
Jest configuration issue with React Router v7 module resolution.

**Fix:**
Add to `package.json`:
```json
"jest": {
  "moduleNameMapper": {
    "^react-router-dom$": "<rootDir>/node_modules/react-router-dom"
  },
  "transformIgnorePatterns": [
    "node_modules/(?!(react-router-dom)/)"
  ]
}
```

**Alternative Fix:**
Create `jest.config.js`:
```javascript
module.exports = {
  preset: 'react-scripts',
  moduleNameMapper: {
    '^react-router-dom$': require.resolve('react-router-dom')
  },
  transformIgnorePatterns: [
    'node_modules/(?!react-router-dom)'
  ]
};
```

**Priority:** CRITICAL - Blocks all testing

---

## HIGH SEVERITY BUGS

### 🟠 HIGH-01: Infinite useEffect Loop Risk in Messages.tsx
**File:** `/workspaces/armoracpo/src/screens/Messages/Messages.tsx`
**Lines:** 19-25
**Category:** React Hooks / Performance

**Issue:**
```typescript
useEffect(() => {
  loadConversations();

  // Refresh conversations every 30 seconds
  const interval = setInterval(loadConversations, 30000);
  return () => clearInterval(interval);
}, []);
```

The `loadConversations` function is not included in the dependency array, violating exhaustive-deps.

**Impact:**
- Stale closure accessing old state/props
- Polling interval references outdated function
- Race conditions on concurrent loads

**Fix:**
```typescript
const loadConversations = useCallback(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // ... rest of function
  } catch (error) {
    console.error('Error loading conversations:', error);
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  loadConversations();
  const interval = setInterval(loadConversations, 30000);
  return () => clearInterval(interval);
}, [loadConversations]);
```

**Priority:** HIGH - Can cause production bugs

---

### 🟠 HIGH-02: Uncontrolled Async Operations in MessageChat Subscription
**File:** `/workspaces/armoracpo/src/screens/Messages/MessageChat.tsx`
**Lines:** 23-37
**Category:** React Hooks / Async/Memory Leak

**Issue:**
```typescript
useEffect(() => {
  if (!assignmentId || !userId) return;

  // Mark messages as read (NO AWAIT)
  messageService.markAllAsRead(assignmentId, userId);

  // Subscribe to new messages
  const unsubscribe = messageService.subscribeToMessages(assignmentId, (message) => {
    setMessages((prev) => [...prev, message]);
    // Mark new messages as read immediately (NO AWAIT)
    messageService.markAllAsRead(assignmentId, userId);
  });

  return () => unsubscribe();
}, [assignmentId, userId]);
```

**Problems:**
1. `messageService.markAllAsRead()` is async but not awaited (fire-and-forget)
2. No error handling for failed async operations
3. Callback inside subscription also calls async without await
4. If component unmounts before async completes, potential state update on unmounted component

**Impact:**
- Silent failures when marking messages as read
- Unread count may be incorrect
- Console warnings about state updates on unmounted components
- Race conditions

**Fix:**
```typescript
useEffect(() => {
  if (!assignmentId || !userId) return;

  let mounted = true;

  // Mark messages as read with proper error handling
  const markRead = async () => {
    try {
      await messageService.markAllAsRead(assignmentId, userId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  markRead();

  // Subscribe to new messages
  const unsubscribe = messageService.subscribeToMessages(assignmentId, (message) => {
    if (mounted) {
      setMessages((prev) => [...prev, message]);
      // Mark new messages as read with error handling
      messageService.markAllAsRead(assignmentId, userId).catch(error => {
        console.error('Error marking new message as read:', error);
      });
    }
  });

  return () => {
    mounted = false;
    unsubscribe();
  };
}, [assignmentId, userId]);
```

**Priority:** HIGH - Causes user-facing bugs (incorrect unread counts)

---

### 🟠 HIGH-03: Navigation Using window.location.href Instead of React Router
**Files:** Multiple
**Category:** React Router / UX

**Issue:**
Multiple components use `window.location.href` for navigation instead of React Router's `useNavigate`:

1. `/workspaces/armoracpo/src/screens/Auth/Login.tsx:51`
2. `/workspaces/armoracpo/src/screens/Jobs/ActiveJob.tsx:69`
3. `/workspaces/armoracpo/src/screens/Settings/Settings.tsx:35`
4. `/workspaces/armoracpo/src/screens/Dashboard/Dashboard.tsx:192,199,206,213,220`

**Example:**
```typescript
// BAD - causes full page reload
window.location.href = '/dashboard';

// BAD - in Dashboard.tsx
onClick={() => window.location.href = '/messages'}
```

**Impact:**
- Full page reloads destroy React state
- Loss of authenticated session context
- Poor UX with loading flashes
- Wasted bandwidth re-downloading JS bundles
- PWA offline mode broken

**Fix:**
```typescript
// Dashboard.tsx
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // ...

  <button onClick={() => navigate('/messages')}>
    💬 Messages
  </button>
};

// Login.tsx
navigate('/dashboard', { replace: true });

// Settings.tsx
if (window.confirm('Are you sure you want to sign out?')) {
  await authService.logout();
  navigate('/', { replace: true });
}
```

**Priority:** HIGH - Degrades UX and PWA functionality

---

### 🟠 HIGH-04: Missing Error Handling in BottomNav Polling
**File:** `/workspaces/armoracpo/src/components/layout/BottomNav.tsx`
**Lines:** 12-18
**Category:** Error Handling / Performance

**Issue:**
```typescript
useEffect(() => {
  loadUnreadCount();

  // Subscribe to message updates
  const interval = setInterval(loadUnreadCount, 30000);
  return () => clearInterval(interval);
}, []);
```

Problems:
1. Missing dependency `loadUnreadCount` in dependency array
2. If `loadUnreadCount` throws, interval continues running with errors every 30s
3. No loading state - could cause performance issues
4. Empty dependency array means stale closure

**Impact:**
- Console spam if API fails
- Unnecessary API calls during errors
- Stale data display
- Battery drain from failed polling

**Fix:**
```typescript
const loadUnreadCount = useCallback(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const count = await messageService.getTotalUnreadCount(user.id);
    setUnreadCount(count);
  } catch (error) {
    console.error('Error loading unread count:', error);
    // Don't update state on error to keep last known good value
  }
}, []);

useEffect(() => {
  loadUnreadCount();

  const interval = setInterval(() => {
    loadUnreadCount().catch(error => {
      console.error('Polling error:', error);
    });
  }, 30000);

  return () => clearInterval(interval);
}, [loadUnreadCount]);
```

**Priority:** HIGH - Performance and reliability issue

---

## MEDIUM SEVERITY BUGS

### 🟡 MEDIUM-01: Potential Null Pointer in Dashboard
**File:** `/workspaces/armoracpo/src/screens/Dashboard/Dashboard.tsx`
**Lines:** 34
**Category:** TypeScript / Null Safety

**Issue:**
```typescript
const { data: activeData } = await supabase
  .from('protection_assignments')
  .select('*')
  .eq('cpo_id', cpoData?.id) // cpoData might be null
  .in('status', ['assigned', 'en_route', 'active'])
```

If `cpoData` is null/undefined, `cpoData?.id` returns undefined, causing the query to fail silently.

**Impact:**
- Query fails with no error shown to user
- Dashboard shows no active assignment even if one exists
- Silent failure mode confuses debugging

**Fix:**
```typescript
if (cpoData) {
  setCpo(cpoData);

  // Get active assignment
  const { data: activeData } = await supabase
    .from('protection_assignments')
    .select('*')
    .eq('cpo_id', cpoData.id)
    .in('status', ['assigned', 'en_route', 'active'])
    .order('scheduled_start_time', { ascending: true })
    .limit(1);

  if (activeData && activeData.length > 0) {
    setActiveAssignment(activeData[0]);
  }
}
```

**Priority:** MEDIUM - Edge case but impacts functionality

---

### 🟡 MEDIUM-02: Race Condition in Assignment Acceptance
**File:** `/workspaces/armoracpo/src/screens/Jobs/AvailableJobs.tsx`
**Lines:** 40-72
**Category:** Race Condition / UX

**Issue:**
```typescript
const acceptAssignment = async (assignmentId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get CPO profile
    const { data: cpoData } = await supabase
      .from('protection_officers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!cpoData) return;

    // Accept assignment
    const { error } = await supabase
      .from('protection_assignments')
      .update({
        cpo_id: cpoData.id,
        status: 'assigned'
      })
      .eq('id', assignmentId);
```

Problems:
1. No optimistic locking check (should verify status='pending' AND cpo_id IS NULL)
2. Multiple CPOs can click simultaneously
3. No UI feedback during async operation (button still clickable)
4. Generic error message doesn't explain race condition

**Impact:**
- Multiple CPOs think they accepted the same job
- Confusion and poor UX
- One CPO gets assignment, others get generic error

**Fix:**
```typescript
const [acceptingId, setAcceptingId] = useState<string | null>(null);

const acceptAssignment = async (assignmentId: string) => {
  if (acceptingId) return; // Prevent double-click

  setAcceptingId(assignmentId);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: cpoData } = await supabase
      .from('protection_officers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!cpoData) return;

    // Accept with optimistic locking
    const { data, error } = await supabase
      .from('protection_assignments')
      .update({
        cpo_id: cpoData.id,
        status: 'assigned'
      })
      .eq('id', assignmentId)
      .eq('status', 'pending')
      .is('cpo_id', null)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to accept assignment. Please try again.');
    }

    if (!data) {
      throw new Error('This assignment has already been accepted by another CPO.');
    }

    loadAvailableAssignments();
    alert('Assignment accepted! View it in your active assignments.');
  } catch (err: any) {
    console.error('Error accepting assignment:', err);
    alert(err.message || 'Failed to accept assignment. Please try again.');
  } finally {
    setAcceptingId(null);
  }
};

// In button:
<button
  onClick={() => acceptAssignment(assignment.id)}
  className="btn btn-success btn-full"
  disabled={acceptingId === assignment.id}
  style={{ marginTop: 'var(--spacing-md)' }}
>
  {acceptingId === assignment.id ? 'Accepting...' : 'Accept Assignment'}
</button>
```

**Priority:** MEDIUM - Affects UX and causes confusion

---

### 🟡 MEDIUM-03: Missing Keys in .map() Rendering
**File:** `/workspaces/armoracpo/src/screens/Jobs/ActiveJob.tsx`
**Lines:** 223-225
**Category:** React / Performance

**Issue:**
```typescript
{assignment.required_certifications && assignment.required_certifications.map((cert: string) => (
  <span key={cert} className="badge badge-secondary">{cert}</span>
))}
```

Using the array item value as key is acceptable IF values are guaranteed unique. However, if `required_certifications` contains duplicates, React will have key conflicts.

**Impact:**
- React warnings in console if duplicates exist
- Incorrect component recycling
- Visual glitches during updates

**Fix:**
```typescript
{assignment.required_certifications && assignment.required_certifications.map((cert: string, index: number) => (
  <span key={`cert-${index}-${cert}`} className="badge badge-secondary">{cert}</span>
))}
```

**Priority:** MEDIUM - Minor but should be fixed

---

### 🟡 MEDIUM-04: Unhandled Promise Rejection in handleSendMessage
**File:** `/workspaces/armoracpo/src/screens/Messages/MessageChat.tsx`
**Lines:** 78-91
**Category:** Error Handling

**Issue:**
```typescript
const handleSendMessage = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!newMessage.trim() || !assignmentId || !userId || sending) return;

  setSending(true);
  try {
    await messageService.sendMessage(assignmentId, userId, 'cpo', newMessage.trim());
    setNewMessage('');
  } catch (error: any) {
    alert(error.message || 'Failed to send message'); // User-facing alert
  } finally {
    setSending(false);
  }
};
```

Problems:
1. `alert()` is blocking and poor UX
2. Message is cleared on success but subscription may not fire immediately
3. No visual confirmation of sent message

**Impact:**
- Jarring alert() popup interrupts flow
- User uncertain if message sent
- Poor mobile UX

**Fix:**
```typescript
const [sendError, setSendError] = useState<string | null>(null);

const handleSendMessage = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!newMessage.trim() || !assignmentId || !userId || sending) return;

  setSending(true);
  setSendError(null);
  try {
    const sentMessage = await messageService.sendMessage(assignmentId, userId, 'cpo', newMessage.trim());
    setNewMessage('');
    // Optimistically add to messages immediately
    setMessages(prev => [...prev, sentMessage]);
  } catch (error: any) {
    setSendError(error.message || 'Failed to send message');
  } finally {
    setSending(false);
  }
};

// In render:
{sendError && (
  <div style={{
    color: 'var(--color-danger)',
    fontSize: 'var(--font-size-sm)',
    padding: 'var(--spacing-sm)'
  }}>
    {sendError}
  </div>
)}
```

**Priority:** MEDIUM - UX improvement needed

---

### 🟡 MEDIUM-05: Polling Inefficiency in Messages.tsx
**File:** `/workspaces/armoracpo/src/screens/Messages/Messages.tsx`
**Lines:** 19-25
**Category:** Performance

**Issue:**
```typescript
useEffect(() => {
  loadConversations();

  // Refresh conversations every 30 seconds
  const interval = setInterval(loadConversations, 30000);
  return () => clearInterval(interval);
}, []);
```

The component polls for conversations every 30 seconds, making N+1 queries (one per assignment for lastMessage and unreadCount).

**Impact:**
- Expensive database queries every 30s
- Battery drain on mobile
- Wasted bandwidth
- Scaling issues with many assignments

**Fix:**
Replace polling with real-time subscriptions:
```typescript
useEffect(() => {
  loadConversations();

  // Subscribe to message changes instead of polling
  const channel = supabase
    .channel('messages-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'assignment_messages',
      },
      () => {
        // Refresh conversations when any message changes
        loadConversations();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [loadConversations]);
```

**Priority:** MEDIUM - Performance optimization

---

### 🟡 MEDIUM-06: Missing Loading State in BottomNav
**File:** `/workspaces/armoracpo/src/components/layout/BottomNav.tsx`
**Lines:** 10
**Category:** UX

**Issue:**
```typescript
const [unreadCount, setUnreadCount] = useState(0);
```

The unread count badge shows immediately but initial value is 0 until first load completes. This creates a flash of incorrect information.

**Impact:**
- Badge shows "0" then updates to real count
- Visual flicker
- User confusion (did I read all messages?)

**Fix:**
```typescript
const [unreadCount, setUnreadCount] = useState<number | null>(null);

// In render:
{navItems.map((item) => {
  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
  const badgeValue = item.badge;

  return (
    <button key={item.path} /* ... */>
      <div style={{ position: 'relative' }}>
        <span style={{ fontSize: 'var(--font-size-xl)' }}>{item.icon}</span>
        {badgeValue !== undefined && badgeValue !== null && badgeValue > 0 && (
          <div style={/* badge styles */}>
            {badgeValue > 9 ? '9+' : badgeValue}
          </div>
        )}
      </div>
    </button>
  );
})}
```

**Priority:** MEDIUM - Minor UX issue

---

## LOW SEVERITY BUGS

### 🟢 LOW-01: Console.error Statements Left in Production
**Files:** Multiple (18 occurrences)
**Category:** Code Quality / Security

**Issue:**
Production code contains `console.error()` statements that expose internal error details:

- `/workspaces/armoracpo/src/App.tsx:48`
- `/workspaces/armoracpo/src/screens/Messages/MessageChat.tsx:72`
- `/workspaces/armoracpo/src/screens/Messages/Messages.tsx:74`
- And 15 more occurrences across components

**Impact:**
- Exposes internal error details in production
- Clutters user console
- May reveal sensitive information
- Unprofessional appearance

**Fix:**
Create error logging service:
```typescript
// src/utils/logger.ts
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  error: (message: string, error?: any) => {
    if (isDevelopment) {
      console.error(message, error);
    }
    // In production, send to error tracking service
    // Sentry.captureException(error);
  },
  warn: (message: string) => {
    if (isDevelopment) {
      console.warn(message);
    }
  },
  info: (message: string) => {
    if (isDevelopment) {
      console.log(message);
    }
  }
};

// Usage:
import { logger } from '../../utils/logger';
logger.error('Error loading chat:', error);
```

**Priority:** LOW - Should fix before production but not breaking

---

### 🟢 LOW-02: Missing Type Safety in Service Layer
**File:** `/workspaces/armoracpo/src/services/assignmentService.ts`
**Lines:** 86
**Category:** TypeScript

**Issue:**
```typescript
const updates: any = { status };
```

Using `any` defeats TypeScript's type safety.

**Impact:**
- Loss of type checking
- Potential runtime errors
- Harder to maintain

**Fix:**
```typescript
interface AssignmentUpdate {
  status: 'en_route' | 'active' | 'completed' | 'cancelled';
  actual_start_time?: string;
  actual_end_time?: string;
}

async updateAssignmentStatus(
  assignmentId: string,
  status: 'en_route' | 'active' | 'completed' | 'cancelled'
) {
  const updates: AssignmentUpdate = { status };

  if (status === 'active') {
    updates.actual_start_time = new Date().toISOString();
  } else if (status === 'completed') {
    updates.actual_end_time = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('protection_assignments')
    .update(updates)
    .eq('id', assignmentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

**Priority:** LOW - Improves code quality

---

### 🟢 LOW-03: Inconsistent Error Messages
**File:** `/workspaces/armoracpo/src/screens/Jobs/AvailableJobs.tsx`
**Lines:** 66, 70
**Category:** UX / i18n

**Issue:**
```typescript
alert('Assignment accepted! View it in your active assignments.');
// vs
alert('Failed to accept assignment. Please try again.');
```

Different message styles and no centralized error/success messaging system.

**Impact:**
- Inconsistent UX
- Hard to internationalize later
- Alert() is poor mobile UX

**Fix:**
Create toast notification system or use consistent inline messages.

**Priority:** LOW - UX polish

---

## RECOMMENDATIONS

### Immediate Actions (Before Production)
1. ✅ Fix CRITICAL-01: Add useCallback to loadChatData
2. ✅ Fix CRITICAL-02: Configure Jest for React Router v7
3. ✅ Fix HIGH-01: Add useCallback to loadConversations
4. ✅ Fix HIGH-02: Handle async operations in subscription properly
5. ✅ Fix HIGH-03: Replace all window.location.href with navigate()

### Short-term Improvements
1. Add error boundary components for graceful error handling
2. Replace alert() with toast notifications
3. Implement optimistic locking for all race-prone operations
4. Add loading states for all async operations
5. Create centralized logging service

### Long-term Enhancements
1. Add Sentry or similar error tracking
2. Implement React Query for better data fetching/caching
3. Add E2E tests with Cypress or Playwright
4. Migrate from polling to full real-time subscriptions
5. Add performance monitoring

### Testing Strategy
1. Fix Jest configuration immediately
2. Add unit tests for all services
3. Add integration tests for critical user flows
4. Add E2E tests for messaging and assignment acceptance
5. Set up CI/CD to block merges if tests fail

---

## SEVERITY DEFINITIONS

- **CRITICAL:** Blocks functionality, causes crashes, or creates security vulnerabilities
- **HIGH:** Causes user-facing bugs, performance issues, or violates best practices
- **MEDIUM:** Degrades UX, creates edge case bugs, or reduces maintainability
- **LOW:** Code quality issues, minor UX polish, or future-proofing

---

## TESTING COMMANDS

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Run tests (currently failing)
npm test

# Check for useEffect dependency issues
npx eslint --plugin react-hooks --rule 'react-hooks/exhaustive-deps: error' src/**/*.tsx

# Build for production
npm run build

# Check bundle size
npm run build && npx source-map-explorer 'build/static/js/*.js'
```

---

**Report generated by:** Claude Code (Sonnet 4.5)
**Working directory:** /workspaces/armoracpo
**Branch:** main
**Last commit:** 29b60ab - chore: Add Android TWA build configuration and gitignore rules
