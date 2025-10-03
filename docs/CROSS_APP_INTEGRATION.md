# 🔗 Armora Platform - Cross-App Integration Guide

**Repositories:** `armora` (Client App) + `armoracpo` (CPO App)

This document outlines how the two Armora applications should integrate and synchronize to provide a seamless security platform experience.

---

## 📋 Quick Reference

### Repository Structure
```
armora (github.com/giquina/armora)
├─ Principals/Clients request protection
├─ Book security services
├─ Track CPOs in real-time
└─ Rate and pay for services

armoracpo (github.com/giquina/armoracpo)
├─ CPOs/Officers browse and accept jobs
├─ Manage assignments and earnings
├─ Professional compliance tracking
└─ Incident reporting and documentation
```

### Shared Backend
- **Supabase:** `https://jmzvrqwjmlnvxojculee.supabase.co`
- **Firebase:** Project `armora-protection`
- **Stripe:** Payment processing

---

## 🔄 Critical Integration Points

### 1. Assignment Lifecycle Synchronization

**Flow:** Principal creates → CPO accepts → Both track → Principal pays → CPO receives payment

```
┌──────────────┐                    ┌──────────────┐
│ Client App   │                    │   CPO App    │
└──────┬───────┘                    └──────┬───────┘
       │                                   │
       │ 1. Create Assignment              │
       │    status: pending                │
       ├──────────────────────────────────>│
       │                                   │
       │                    2. Accept      │
       │                    status: assigned
       │<──────────────────────────────────┤
       │                                   │
       │ 3. Real-time updates              │
       │    (location, status, messages)   │
       │<─────────────────────────────────>│
       │                                   │
       │ 4. Mark Complete        5. Confirm│
       │    Both trigger         completion│
       │    payment capture                │
       │<─────────────────────────────────>│
       │                                   │
       │ 6. Payment split                  │
       │    Principal charged              │
       │    Platform fee: 15%              │
       │    CPO payout: 85%                │
       └───────────────────────────────────┘
```

**Shared Table:** `protection_assignments`

```sql
status: 'pending' | 'assigned' | 'en_route' | 'active' | 'completed' | 'cancelled'
```

### 2. Real-Time Messaging

**Feature:** In-app chat between principal and CPO during active assignments

**Shared Table:** `assignment_messages`

```typescript
interface AssignmentMessage {
  id: string;
  assignment_id: string;
  sender_type: 'principal' | 'cpo';
  sender_id: string;
  message: string;
  read: boolean;
  created_at: string;
}
```

**Implementation:**
- **Client App:** Chat screen shows messages from CPO
- **CPO App:** Chat screen shows messages from principal
- **Both:** Real-time subscriptions via Supabase
- **Both:** Send push notifications on new message

### 3. Live Location Tracking

**Feature:** During `en_route` and `active` status, principal can see CPO's location

**Shared Table:** `assignment_location_tracking` (recommended)

```sql
CREATE TABLE assignment_location_tracking (
  id UUID PRIMARY KEY,
  assignment_id UUID REFERENCES protection_assignments(id),
  cpo_id UUID REFERENCES protection_officers(id),
  location GEOGRAPHY(POINT, 4326),
  speed_kmh NUMERIC,
  heading_degrees INTEGER,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

**Implementation:**
- **CPO App:** Broadcasts location every 5-10 seconds while active
- **Client App:** Subscribes to location updates, displays on map
- **Privacy:** CPO can disable broadcasting when off-duty

### 4. Payment Flow Coordination

**Challenge:** Ensure secure payment from principal to platform to CPO

**Recommended Flow:**

```
1. Principal confirms booking
   → Stripe: Create PaymentIntent (authorize, don't capture)
   → DB: payment record (status: authorized)

2. CPO accepts
   → No payment action yet

3. Assignment completed
   → Both apps confirm completion
   → Stripe: Capture payment
   → Split: 15% platform fee, 85% to CPO
   → DB: payment record (status: completed)

4. Payout to CPO
   → Stripe: Transfer to CPO's Stripe Connect account
   → DB: payment record (status: paid)
```

**Shared Table:** `payments`

---

## 📊 Schema Alignment Needed

### Critical Mismatches Identified

| Item | CPO App Expects | Client App May Have | Resolution Needed |
|------|----------------|---------------------|-------------------|
| **Assignment Status** | `assigned`, `en_route` | May use `confirmed` | ✅ Align on single enum |
| **CPO Table** | `protection_officers` | Same | ✅ Already aligned |
| **Name Fields** | `first_name`, `last_name` | May use `full_name` | ⚠️ Verify and align |
| **Location Storage** | `pickup_latitude`, `pickup_longitude` | May use PostGIS Geography | ⚠️ Decide on standard |
| **Payments Table** | `payment_records` or `payments` | `payments` | ⚠️ Use consistent name |

### Recommended Actions:

1. **Run Database Schema Audit**
   ```bash
   # Connect to Supabase and verify actual production schema
   psql "postgresql://[connection_string]" -c "\d protection_assignments"
   ```

2. **Align TypeScript Interfaces**
   - Both repos should use identical type definitions
   - Consider monorepo with shared `@armora/types` package

3. **Test Integration**
   - Create test assignment in client app
   - Accept in CPO app
   - Verify data consistency

---

## 🎨 UI/UX Consistency

### Shared Design Tokens

Both apps should use **identical CSS variables**:

```css
/* Shared: src/styles/global.css */
:root {
  /* Brand */
  --armora-navy: #0a0a1a;
  --armora-gold: #ffd700;
  
  /* Status Colors */
  --status-pending: #fbbf24;
  --status-active: #10b981;
  --status-completed: #3b82f6;
  --status-cancelled: #ef4444;
}
```

### Terminology Alignment

**CRITICAL:** Both apps MUST use identical professional security terminology:

| ✅ Use | ❌ Don't Use |
|--------|-------------|
| Close Protection Officer (CPO) | Driver |
| Principal | Passenger |
| Assignment / Detail | Ride / Trip |
| Operational / Stand Down | Online / Offline |

See `docs/suggestions.md` for complete terminology guide.

---

## 🔐 Row Level Security (RLS) Policies

**Critical:** Ensure proper data isolation between users

### Principals can only see:
- Their own assignments
- CPO public profiles (when browsing)
- Messages for their assignments

### CPOs can only see:
- Pending (unassigned) assignments
- Their own accepted assignments
- Messages for their assignments
- Their own profile and earnings

### Example RLS Policy:

```sql
-- CPOs can see pending assignments or their own
CREATE POLICY "cpos_read_assignments"
ON protection_assignments FOR SELECT
USING (
  (status = 'pending' AND cpo_id IS NULL)
  OR
  (cpo_id IN (
    SELECT id FROM protection_officers WHERE user_id = auth.uid()
  ))
);
```

---

## 🚀 Quick Integration Wins

### Week 1: Shared Types Package

**Goal:** Create single source of truth for TypeScript types

```bash
# Option A: NPM package
npm create @armora/shared-types

# Option B: Copy identical types to both repos
# Ensure src/types/shared.ts is identical in both repos
```

### Week 2: Assignment Status Sync

**Goal:** Both apps use same status update service

```typescript
// Shared service for status updates
export class AssignmentStatusService {
  static async updateStatus(
    assignmentId: string,
    newStatus: AssignmentStatus,
    updatedBy: { userId: string; userType: 'principal' | 'cpo' }
  ) {
    // Validate transition
    // Update database
    // Notify other party
    // Return updated assignment
  }
}
```

### Week 3: Real-Time Messaging

**Goal:** Enable principal ↔ CPO chat

1. Both apps implement same messaging UI component
2. Subscribe to `assignment_messages` table
3. Send push notifications on new message
4. Mark messages as read

---

## 📅 Full Integration Roadmap

### Phase 1: Foundation (2 weeks)
- [ ] Audit database schema in both apps
- [ ] Fix schema mismatches
- [ ] Create shared TypeScript types
- [ ] Align RLS policies

### Phase 2: Real-Time Features (2 weeks)
- [ ] Assignment lifecycle synchronization
- [ ] Real-time messaging
- [ ] Live location tracking
- [ ] Push notifications

### Phase 3: Payment Integration (1 week)
- [ ] Payment authorization (client app)
- [ ] Payment capture on completion
- [ ] CPO payout processing
- [ ] Payment reconciliation

### Phase 4: Testing & Launch (1 week)
- [ ] End-to-end integration tests
- [ ] User acceptance testing
- [ ] Production deployment
- [ ] Monitoring and analytics

---

## 🔍 Testing Checklist

### Manual Integration Test

1. **Create Assignment (Client App)**
   - [ ] Principal creates protection request
   - [ ] Payment is authorized (not captured)
   - [ ] Assignment appears in database

2. **Accept Assignment (CPO App)**
   - [ ] Assignment appears in available jobs
   - [ ] CPO can accept
   - [ ] Status changes to `assigned`
   - [ ] Principal receives notification

3. **During Assignment**
   - [ ] Messaging works both ways
   - [ ] CPO location visible to principal
   - [ ] Status updates sync to both apps
   - [ ] Real-time updates < 1 second latency

4. **Complete Assignment**
   - [ ] Both apps can confirm completion
   - [ ] Payment is captured
   - [ ] CPO sees earnings updated
   - [ ] Principal can rate CPO

5. **Payment Flow**
   - [ ] Principal charged correct amount
   - [ ] Platform fee deducted (15%)
   - [ ] CPO receives payout (85%)
   - [ ] Transaction records match

---

## 🎯 Success Metrics

Track these to measure integration health:

- **Real-time Sync Latency:** Target < 500ms
- **Message Delivery Rate:** Target > 99%
- **Location Update Lag:** Target < 2 seconds
- **Payment Success Rate:** Target > 99.9%
- **Assignment Status Consistency:** Target 100%

---

## 📚 Additional Resources

- **SIA Compliance:** See `docs/suggestions.md`
- **Database Schema:** See `docs/supabase.md`
- **Firebase Setup:** See `docs/firebase.md`
- **Deployment:** See `docs/DEPLOYMENT.md`

---

## 🏁 Next Steps

1. **Immediate Actions:**
   - Verify Supabase anon key is same in both apps
   - Check database schema for mismatches
   - Align status enum values

2. **Short-term (1-2 weeks):**
   - Implement shared TypeScript types
   - Test assignment lifecycle end-to-end
   - Fix any RLS policy issues

3. **Medium-term (1 month):**
   - Complete real-time integrations
   - Launch payment flow
   - Monitor and optimize

---

**Document Version:** 1.0  
**Last Updated:** October 3, 2025  
**Status:** Integration planning phase  
**Contact:** Development team for questions
