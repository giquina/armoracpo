# 🔧 Comprehensive Fix Plan for ArmoraCPO TypeScript/ESLint Issues

**Generated:** 2025-10-07
**Total Issues:** 110 (28 TS errors + 34 ESLint warnings + 48 ESLint test errors)
**Estimated Total Fix Time:** 2-4 hours

---

## 📊 Executive Summary

| Category | Count | Priority | Est. Time | Status |
|----------|-------|----------|-----------|--------|
| Framer Motion Issues | 7 | 🟡 Medium | 5 min | ⏳ Pending |
| Type Definition Mismatches | 42 | 🔴 High | 90 min | ⏳ Pending |
| Unused Imports/Variables | 19 | 🟢 Low | 10 min | ⏳ Pending |
| React Hook Dependencies | 15 | 🟡 Medium | 45 min | ⏳ Pending |
| Testing Library Violations | 48 | 🟢 Low | 60 min | ⏳ Pending |
| Other TypeScript Errors | 4 | 🟡 Medium | 20 min | ⏳ Pending |

---

## 🎯 Phase 1: Quick Wins (30 minutes)

### Task 1.1: Fix Framer Motion Easing (5 min)
**Impact:** Resolves 7 TypeScript errors
**File:** `src/screens/Auth/Login.tsx`

**Current Code (Line 87-97):**
```typescript
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],  // ❌ Type error
    },
  },
};
```

**Fix:**
```typescript
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',  // ✅ Fixed
    },
  },
};
```

**Command:**
```bash
# Open file and replace line 94
sed -i "s/ease: \[0.4, 0, 0.2, 1\],/ease: 'easeOut',/" src/screens/Auth/Login.tsx
```

---

### Task 1.2: Remove Unused Imports (10 min)
**Impact:** Resolves 19 ESLint warnings
**Files:** 16 files with unused imports

**Command:**
```bash
# Auto-fix with ESLint
npx eslint src --ext .ts,.tsx --fix --rule 'no-unused-vars: error'
```

**Manual fixes if auto-fix doesn't catch all:**
- `src/components/common/Logo.tsx:67` - Remove `fontSize`
- `src/components/dashboard/RecentIncidentsWidget.tsx:5` - Remove `supabase`
- `src/components/jobs/JobDetailsModal.tsx:2,4` - Remove `FiDollarSign`, `BrowseJobCard`
- `src/components/layout/BottomNav.tsx:3-4` - Remove `FiDollarSign`, `FaDollarSign`

---

### Task 1.3: Fix Simple Typos (5 min)
**Impact:** Resolves 1 error
**File:** `src/components/dashboard/PerformanceMetricsCard.tsx`

**Line 39:**
```typescript
<FiStarh  // ❌ Typo
```

**Fix:**
```typescript
<FiStar  // ✅ Correct
```

**Command:**
```bash
sed -i 's/FiStarh/FiStar/g' src/components/dashboard/PerformanceMetricsCard.tsx
```

---

### Task 1.4: Fix EmptyState Action Prop (5 min)
**Impact:** Resolves 1 error
**File:** `src/screens/Messages/Messages.tsx:208`

**Current:**
```typescript
action={{
  label: 'Browse Available Assignments',
  onClick: () => navigate('/jobs')
}}
```

**Fix Option 1 (Update EmptyState to accept object):**
```typescript
// In EmptyState.tsx
interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  action?: EmptyStateAction;
}
```

**Fix Option 2 (Change Messages.tsx to use Button):**
```typescript
action={
  <Button onClick={() => navigate('/jobs')}>
    Browse Available Assignments
  </Button>
}
```

---

## 🔴 Phase 2: Type Definition Fixes (90 minutes)

### Task 2.1: Fix IncidentMediaAttachment (15 min)
**Impact:** Resolves 9 errors
**File:** `src/types/index.ts` (Lines 1244-1267)

**Changes:**
```typescript
export interface IncidentMediaAttachment {
  id: string;
  type: 'photo' | 'video' | 'audio' | 'document';
  url: string;
  thumbnail?: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  duration?: number;

  // ✅ Add/rename properties
  description?: string;  // ADD
  capturedAt: string;    // MOVE from metadata.capturedAt
  uploadedBy: string;
  uploadedAt: string;
  hash: string;

  // ✅ Rename gpsData to gpsCoordinates
  gpsCoordinates: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };

  chainOfCustody: Array<{
    action: string;
    timestamp: string;
    performedBy: {
      userId: string;
      userName: string;
      role: string;
    };
    location?: { latitude: number; longitude: number; };
  }>;
}
```

**Affected Services to Update:**
- `src/services/incidentPDFService.ts:543-545` - Use `capturedAt` instead of `metadata.capturedAt`
- `src/services/incidentPDFService.ts:544` - Use `gpsCoordinates` instead of `gpsData`
- `src/screens/Incidents/IncidentReportDetail.tsx:406` - `description` now available

---

### Task 2.2: Fix IncidentSignature (10 min)
**Impact:** Resolves 2 errors
**File:** `src/types/index.ts` (Lines 1292-1309)

**Changes:**
```typescript
export interface IncidentSignature {
  id: string;
  signatureData: string;

  // ✅ Flatten structure for easier access
  signerRole: 'cpo' | 'witness' | 'principal' | 'manager';
  signerName: string;
  signerId: string;

  signedAt: string;
  ipAddress: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  deviceInfo: string;
  statement?: string;
}
```

**Affected Service to Update:**
- `src/services/incidentPDFService.ts:618` - Use `signerRole` and `signerName` directly

---

### Task 2.3: Fix IncidentLawEnforcementDetails (5 min)
**Impact:** Resolves 2 errors
**File:** `src/types/index.ts` (Lines 1328-1343)

**Add Property:**
```typescript
export interface IncidentLawEnforcementDetails {
  reported: boolean;
  reportedAt?: string;
  responseTime?: string;  // ✅ ADD THIS
  forceName?: string;
  stationName?: string;
  // ... rest of properties
}
```

---

### Task 2.4: Fix ProtectionAssignment Type Conflicts (20 min)
**Impact:** Resolves 16 errors
**Files:** Multiple files with conflicting definitions

**Step 1: Remove duplicate from supabase.ts**
```bash
# src/lib/supabase.ts - Remove lines 48-79 (duplicate ProtectionAssignment interface)
```

**Step 2: Import from database.types.ts everywhere**
```typescript
// In all files using ProtectionAssignment
import { ProtectionAssignment } from '../types/database.types';
```

**Step 3: Fix mock data to match database schema**

**File:** `src/services/mockData.ts`

**Fix location structure (Lines 17-26, 47-52, 73-78):**
```typescript
// ❌ Current
pickup_location: {
  address: '10 Downing Street',
  latitude: 51.5034,
  longitude: -0.1276,
}

// ✅ Fixed
commencement_point: '10 Downing Street',
commencement_latitude: 51.5034,
commencement_longitude: -0.1276,
```

**Fix assignment_type enums (Lines 15, 45, 71):**
```typescript
// ❌ Current
assignment_type: 'Executive Protection'
assignment_type: 'Event Security'
assignment_type: 'Residential Security'

// ✅ Fixed
assignment_type: 'executive_protection'
assignment_type: 'event_security'
assignment_type: 'residential_security'
```

**Step 4: Fix mockAssignment.service.ts property names**

**File:** `src/services/mockAssignment.service.ts` (Lines 87, 105, 109-111)

```typescript
// ❌ Current
assignment.actual_start = new Date().toISOString();
assignment.actual_end = new Date().toISOString();
assignment.final_cost = Math.round(hours * assignment.hourly_rate * 100) / 100;

// ✅ Fixed
assignment.actual_start_time = new Date().toISOString();
assignment.actual_end_time = new Date().toISOString();
assignment.total_cost = Math.round(hours * assignment.base_rate * 100) / 100;
```

---

### Task 2.5: Fix AssignmentMessage Type Issues (10 min)
**Impact:** Resolves 5 errors

**File:** `src/lib/supabase.ts` (Lines 115-123)

**Add Property:**
```typescript
export interface AssignmentMessage {
  id: string;
  assignment_id: string;
  sender_type: 'principal' | 'cpo';
  sender_id: string;
  message: string;
  read: boolean;
  read_at?: string;  // ✅ ADD THIS
  created_at: string;
}
```

**Fix mock data sender_type:**

**File:** `src/services/mockData.ts` (Lines 130, 148)
```typescript
// ❌ Current
sender_type: 'client',

// ✅ Fixed
sender_type: 'principal',
```

**File:** `src/services/mockMessage.service.ts` (Line 35)
```typescript
// Update function signature
async sendMessage(
  assignmentId: string,
  senderId: string,
  senderType: 'principal' | 'cpo',  // Changed from 'cpo' | 'client'
  messageText: string
)
```

---

### Task 2.6: Fix Chain of Custody Type (10 min)
**Impact:** Resolves 1 error
**File:** `src/services/incidentService.ts:270`

**Current:**
```typescript
performedBy: cpoId,  // ❌ Type 'string'
```

**Fix:**
```typescript
performedBy: {
  userId: cpoId,
  userName: cpoProfile.full_name,
  role: 'cpo',
},
```

---

### Task 2.7: Fix PDF GState Constructor (10 min)
**Impact:** Resolves 1 error
**File:** `src/services/incidentPDFService.ts:715`

**Current:**
```typescript
this.doc.setGState(new this.doc.GState({ opacity: 0.1 }));  // ❌ Error
```

**Fix:**
```typescript
// Check jsPDF documentation for correct usage
const gState = this.doc.GState ? new this.doc.GState({ opacity: 0.1 }) : null;
if (gState) {
  this.doc.setGState(gState);
}
```

Or simpler:
```typescript
// Use setFillOpacity and setStrokeOpacity instead
this.doc.setFillOpacity(0.1);
this.doc.setStrokeOpacity(0.1);
```

---

### Task 2.8: Fix Mock Message Service (10 min)
**Impact:** Resolves 2 errors
**File:** `src/services/mockMessage.service.ts` (Lines 53, 77)

**Current:**
```typescript
message.read_at = new Date().toISOString();  // ❌ Property doesn't exist
```

**Fix (Option 1 - Add to interface):**
Already covered in Task 2.5

**Fix (Option 2 - Use correct property):**
```typescript
message.read = true;  // Use boolean instead
```

---

## 🟡 Phase 3: React Hook Dependencies (45 minutes)

### Task 3.1: Add Missing Dependencies or Use useCallback (45 min)
**Impact:** Resolves 15 warnings
**Files:** 13 files with missing dependencies

**Strategy:**
For each warning, choose one of three approaches:

1. **Add to dependency array** (if function is stable)
2. **Wrap in useCallback** (if function is defined in component)
3. **Suppress with ESLint comment** (if intentional)

**Example Fix:**

**File:** `src/components/dashboard/RecentIncidentsWidget.tsx:19`

**Current:**
```typescript
useEffect(() => {
  loadRecentIncidents();
}, []);  // ⚠️ Missing dependency: 'loadRecentIncidents'
```

**Fix Option 1 (Add to deps):**
```typescript
useEffect(() => {
  loadRecentIncidents();
}, [loadRecentIncidents]);
```

**Fix Option 2 (Wrap in useCallback):**
```typescript
const loadRecentIncidents = useCallback(async () => {
  // ... function body
}, []);

useEffect(() => {
  loadRecentIncidents();
}, [loadRecentIncidents]);
```

**Fix Option 3 (Suppress if intentional):**
```typescript
useEffect(() => {
  loadRecentIncidents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

**Complete List of Files to Fix:**
1. `src/components/animations/PullToRefresh.tsx:85`
2. `src/components/dashboard/RecentIncidentsWidget.tsx:19`
3. `src/components/incidents/IncidentReportForm.tsx:143,152`
4. `src/contexts/AppContext.tsx:248`
5. `src/hooks/useDOBAutoLogging.ts:127`
6. `src/screens/Auth/Signup.tsx:395`
7. `src/screens/DOB/DailyOccurrenceBook.tsx:28,32`
8. `src/screens/Incidents/IncidentReportDetail.tsx:28`
9. `src/screens/Incidents/IncidentReports.tsx:29`
10. `src/screens/Jobs/AvailableJobs.tsx:44`
11. `src/screens/Splash/Splash.tsx:20`

---

## 🟢 Phase 4: Testing Library Best Practices (60 minutes)

### Task 4.1: Update Test Files (60 min)
**Impact:** Resolves 48 ESLint test errors
**Priority:** Low (doesn't affect production)

**Common Patterns to Fix:**

**Pattern 1: Replace container.querySelector**
```typescript
// ❌ Before
const element = container.querySelector('.my-class');

// ✅ After
const element = screen.getByRole('button', { name: /my button/i });
```

**Pattern 2: Avoid DOM node access**
```typescript
// ❌ Before
expect(container.firstChild).toHaveClass('className');

// ✅ After
const element = screen.getByTestId('my-element');
expect(element).toHaveClass('className');
```

**Pattern 3: Remove conditional expects**
```typescript
// ❌ Before
if (modal) {
  expect(modal).toBeInTheDocument();
}

// ✅ After
expect(screen.queryByRole('dialog')).toBeInTheDocument();
```

**Files to Update:**
1. `src/components/common/__tests__/LoadingScreen.test.tsx` (9 violations)
2. `src/components/common/__tests__/Logo.test.tsx` (10 violations)
3. `src/components/errors/__tests__/ErrorDisplay.test.tsx` (12 violations)
4. `src/components/ui/__tests__/Card.test.tsx` (5 violations)
5. `src/components/ui/__tests__/FormInput.test.tsx` (2 violations)
6. `src/components/ui/__tests__/Modal.test.tsx` (4 violations)
7. `src/components/ui/__tests__/StatusBadge.test.tsx` (4 violations)

---

## 📝 Implementation Order

### Sprint 1: Critical Fixes (Day 1 - 2 hours)
- ✅ Phase 1: Quick Wins (30 min)
- ✅ Phase 2: Type Definition Fixes (90 min)

**Deliverable:** Zero blocking type errors, app builds cleanly

### Sprint 2: Code Quality (Day 2 - 1.5 hours)
- ✅ Phase 3: React Hook Dependencies (45 min)
- ✅ Phase 4: Testing Library (60 min) - Optional

**Deliverable:** Clean ESLint output, improved code quality

---

## 🚀 Execution Commands

### Pre-Flight Checks
```bash
# Check current error count
npm run build 2>&1 | grep -c "error"

# Type check only
npx tsc --noEmit

# ESLint check
npx eslint src --ext .ts,.tsx
```

### Automated Fixes
```bash
# Auto-fix ESLint issues
npx eslint src --ext .ts,.tsx --fix

# Format code
npx prettier --write "src/**/*.{ts,tsx}"
```

### Verification
```bash
# Build and verify
npm run build

# Run tests
npm test -- --watchAll=false

# Type check
npx tsc --noEmit

# Full check
npm run build && npm test -- --watchAll=false
```

---

## 📊 Success Metrics

### Before Fix
- ❌ TypeScript Errors: 28
- ⚠️ ESLint Warnings: 34
- ⚠️ Test Violations: 48
- **Total Issues: 110**

### After Phase 1 (Quick Wins)
- ✅ TypeScript Errors: 20 (-8)
- ✅ ESLint Warnings: 15 (-19)
- ⚠️ Test Violations: 48
- **Total Issues: 83**

### After Phase 2 (Type Fixes)
- ✅ TypeScript Errors: 0 (-20)
- ✅ ESLint Warnings: 15
- ⚠️ Test Violations: 48
- **Total Issues: 63**

### After Phase 3 (Hook Deps)
- ✅ TypeScript Errors: 0
- ✅ ESLint Warnings: 0 (-15)
- ⚠️ Test Violations: 48
- **Total Issues: 48**

### After Phase 4 (Tests) - Optional
- ✅ TypeScript Errors: 0
- ✅ ESLint Warnings: 0
- ✅ Test Violations: 0 (-48)
- **Total Issues: 0** 🎉

---

## 🎯 Priority Recommendations

### Must Fix Before Production (P0)
1. ✅ Task 2.1: IncidentMediaAttachment
2. ✅ Task 2.2: IncidentSignature
3. ✅ Task 2.4: ProtectionAssignment
4. ✅ Task 2.5: AssignmentMessage

### Should Fix Soon (P1)
1. ✅ Task 1.1: Framer Motion
2. ✅ Task 2.3: IncidentLawEnforcementDetails
3. ✅ Task 2.6: Chain of Custody
4. ✅ Task 3: React Hook Dependencies

### Nice to Have (P2)
1. ✅ Task 1.2: Unused Imports
2. ✅ Task 1.3: Fix Typos
3. ✅ Task 4: Testing Library

---

## 🔄 Ongoing Maintenance

### Pre-commit Hook Setup
```bash
# Install husky
npm install --save-dev husky

# Setup pre-commit hook
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run type-check"
```

### Add to package.json scripts
```json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "validate": "npm run type-check && npm run lint && npm test -- --watchAll=false"
  }
}
```

---

## 📚 References

- [Framer Motion Easing Documentation](https://www.framer.com/motion/transition/#easing)
- [TypeScript Handbook - Type Assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)
- [React Testing Library Best Practices](https://testing-library.com/docs/queries/about/)
- [ESLint React Hooks Rules](https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks)

---

**Created by:** Claude Code Agent
**Last Updated:** 2025-10-07
**Version:** 1.0.0
