# End-to-End Testing Guide
## Armora Client → CPO Integration Testing

This guide provides step-by-step instructions for testing the complete workflow from protection request creation to CPO acceptance and messaging.

---

## Overview

This E2E test validates the entire user journey:

1. **Client App** → Principal creates protection request
2. **Backend** → Request appears in database (Supabase)
3. **CPO App** → CPO sees request in Available Jobs
4. **CPO App** → CPO accepts assignment
5. **Both Apps** → Real-time updates via Supabase subscriptions
6. **Messaging** → CPO and client can message each other

---

## Prerequisites

### Required Software
- Node.js 16+ installed
- npm or yarn package manager
- Two browser windows or devices (to run both apps simultaneously)

### Required Credentials

#### Client App Test User
You'll need a registered user account in the Armora client app. If you don't have one:
1. Open the client app at http://localhost:3000
2. Sign up with a test email (e.g., `testclient@example.com`)
3. Complete the questionnaire

#### CPO App Test User
You'll need a verified CPO account. The CPO must:
- Have `verification_status: 'verified'` in the database
- Be a registered protection officer in the `protection_officers` table
- Have valid SIA credentials (can be test data)

**Sample CPO Test Credentials:**
- Email: `testcpo@example.com`
- Password: (set during registration)
- Note: The CPO must be manually verified in the database or via admin panel

---

## Environment Setup

### 1. Clone Both Repositories

```bash
# Client app
cd /workspaces/armora

# CPO app
cd /workspaces/armoracpo
```

### 2. Verify Environment Variables

Both apps must connect to the **same Supabase instance**.

**Client App** (`/workspaces/armora/.env`):
```bash
REACT_APP_SUPABASE_URL=https://jmzvrqwjmlnvxojculee.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**CPO App** (`/workspaces/armoracpo/.env`):
```bash
REACT_APP_SUPABASE_URL=https://jmzvrqwjmlnvxojculee.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Important:** The URLs and keys must be identical for both apps to share the same backend.

### 3. Install Dependencies

```bash
# Client app
cd /workspaces/armora
npm install

# CPO app
cd /workspaces/armoracpo
npm install
```

---

## Running the Test

### Step 1: Start Both Applications

#### Terminal 1 - Client App
```bash
cd /workspaces/armora
npm start
```
- Client app runs on: **http://localhost:3000**

#### Terminal 2 - CPO App
```bash
cd /workspaces/armoracpo
PORT=3001 npm start
```
- CPO app runs on: **http://localhost:3001**

> **Tip:** Use different browser profiles or incognito windows to run both apps side-by-side.

---

### Step 2: Login to Client App

1. Open **http://localhost:3000**
2. Click **"Sign In"** or **"Create Account"**
3. Login with your test client credentials
4. You should see the dashboard

---

### Step 3: Create Test Protection Request

On the client app dashboard, you'll see a **Testing Tools** section (orange border with test icon):

1. Scroll to the **"TESTING TOOLS"** section
2. Click **"Create Test Protection Request"** button
3. Wait for confirmation message: **"Test Request Created!"**
4. Note the assignment ID displayed (first 8 characters)

**What happens:**
- A mock protection assignment is created with:
  - Status: `pending`
  - Type: `close_protection`
  - Pickup: "Test Location A - Mock Request"
  - Destination: "Test Location B - Mock Request"
  - Scheduled: +10 minutes from now
  - Special Instructions: "TEST ASSIGNMENT - Created via mock request button for E2E testing"

---

### Step 4: Login to CPO App

1. Open **http://localhost:3001** (in a different browser window/tab)
2. Login with your verified CPO credentials
3. You should see the CPO dashboard

---

### Step 5: View Available Jobs

1. In the CPO app, navigate to **"Jobs"** tab (bottom navigation)
2. Click **"Available Assignments"**
3. You should see the test request you just created
4. Look for the **orange "TEST" badge** next to the assignment title

**What you should see:**
- Assignment type: "Close Protection"
- Threat level: "LOW"
- Principal: "Test Principal"
- Location: "Test Location A - Mock Request"
- Destination: "Test Location B - Mock Request"
- Duration: 2h
- Rate: £35/hr
- Special instructions showing "TEST ASSIGNMENT..."

---

### Step 6: Accept the Assignment

1. Click **"Accept Assignment"** button on the test request
2. Wait for confirmation alert: "Assignment accepted! View it in your active assignments."
3. The assignment should disappear from "Available Assignments"

**What happens:**
- Assignment status changes from `pending` → `assigned`
- `cpo_id` field is populated with your CPO ID
- Real-time subscription triggers update in client app

---

### Step 7: Verify in Client App

Switch back to the **client app** (http://localhost:3000):

1. Check for real-time updates (assignment should now show as "assigned")
2. Navigate to "Active Protection" or "My Assignments"
3. You should see the accepted assignment with CPO details

**Expected real-time behavior:**
- Assignment status updates automatically
- CPO information appears (name, photo, vehicle details)
- No page refresh required

---

### Step 8: Test Messaging (Optional)

If the messaging feature is implemented:

1. **In CPO App:** Navigate to the accepted assignment
2. Click **"Messages"** or **"Contact Principal"**
3. Send a test message: "On my way to pickup location"
4. **In Client App:** Open the assignment
5. You should see the CPO's message appear in real-time
6. Reply from the client side
7. **In CPO App:** Verify the reply appears

---

### Step 9: Progress Through Assignment Workflow

Test the full assignment lifecycle:

#### In CPO App:
1. **Start En Route:**
   - Click "Start Journey" or update status to `en_route`
   - Verify status change in client app

2. **Arrive at Pickup:**
   - Click "Begin Protection" or update status to `active`
   - Verify in client app

3. **Complete Assignment:**
   - Click "Complete Assignment"
   - Status changes to `completed`
   - Assignment moves to history

#### In Client App:
- Verify all status changes appear in real-time
- Check notifications (if implemented)
- View assignment history after completion

---

### Step 10: Clean Up (Optional)

To reset for another test:

1. Delete the test assignment from database (Supabase dashboard)
2. Or create a new test request (they're marked with TEST badge)
3. Test requests won't affect production data

---

## Troubleshooting

### Problem: "No Assignments Available" in CPO App

**Possible Causes:**
1. Assignment already accepted by another CPO
2. Assignment filtered out (wrong type selected)
3. Real-time subscription not working

**Solutions:**
- Click "All" filter to show all assignment types
- Refresh the page
- Check browser console for errors
- Verify both apps use same Supabase URL
- Create a new test request from client app

---

### Problem: "Assignment is no longer available" when accepting

**Cause:** Race condition - another CPO accepted it first

**Solution:**
- This is expected behavior (prevents double-booking)
- Create a new test request
- Accept it immediately before others can

---

### Problem: Real-time updates not working

**Possible Causes:**
1. Supabase real-time not enabled for tables
2. Network/firewall blocking websocket connections
3. Subscription code not running

**Solutions:**
1. Check Supabase dashboard → Database → Replication
2. Enable real-time for `protection_assignments` table
3. Check browser console for websocket errors
4. Try refreshing the page manually

---

### Problem: CPO login fails with "Unverified Account"

**Cause:** CPO account has `verification_status: 'pending'` or `'rejected'`

**Solution:**
Update the CPO record in Supabase:
```sql
UPDATE protection_officers
SET verification_status = 'verified'
WHERE email = 'testcpo@example.com';
```

---

### Problem: Test button doesn't appear in client app

**Possible Causes:**
1. Not logged in
2. Component not imported correctly
3. Build cache issue

**Solutions:**
- Ensure you're logged in (not guest mode)
- Clear browser cache and refresh
- Check browser console for import errors
- Restart the dev server: `npm start`

---

### Problem: Assignment created but missing fields

**Cause:** Mock data doesn't match required database schema

**Solution:**
- Check `/workspaces/armora/src/components/Testing/MockRequestButton.tsx`
- Verify all required fields are present in `assignmentData`
- Compare with `ProtectionAssignment` interface in `/workspaces/armoracpo/src/lib/supabase.ts`

---

### Problem: Can't run apps on different ports

**Solution:**
```bash
# Client app (default port 3000)
cd /workspaces/armora
npm start

# CPO app (custom port 3001)
cd /workspaces/armoracpo
PORT=3001 npm start

# Alternative: Use environment variable
cd /workspaces/armoracpo
export PORT=3001
npm start
```

---

## Database Verification

### View Test Assignments in Supabase

1. Open Supabase dashboard: https://app.supabase.com/
2. Select your project: `jmzvrqwjmlnvxojculee`
3. Go to **Table Editor** → `protection_assignments`
4. Filter by: `special_instructions` contains "TEST ASSIGNMENT"
5. Verify assignment details match what you created

### Check CPO Assignment Link

```sql
SELECT
  pa.id,
  pa.status,
  pa.principal_name,
  pa.pickup_location,
  po.first_name,
  po.last_name
FROM protection_assignments pa
LEFT JOIN protection_officers po ON pa.cpo_id = po.id
WHERE pa.special_instructions LIKE '%TEST ASSIGNMENT%'
ORDER BY pa.created_at DESC;
```

This query shows:
- Assignment details
- Current status
- Assigned CPO (if accepted)

---

## Testing Checklist

Use this checklist to ensure complete E2E coverage:

### Setup
- [ ] Both apps running on different ports
- [ ] Same Supabase instance configured
- [ ] Client user logged in
- [ ] CPO user logged in and verified

### Create Request
- [ ] Test request created successfully
- [ ] Assignment ID returned
- [ ] "TEST" badge visible in success message

### View in CPO App
- [ ] Assignment appears in Available Jobs
- [ ] "TEST" badge visible next to title
- [ ] All assignment details correct
- [ ] Scheduled time shows +10 minutes

### Accept Assignment
- [ ] Accept button works
- [ ] Success confirmation shown
- [ ] Assignment removed from available list
- [ ] Assignment appears in active assignments

### Real-time Updates
- [ ] Client app shows status change without refresh
- [ ] CPO details appear in client app
- [ ] Status updates propagate both ways

### Messaging (if implemented)
- [ ] CPO can send messages
- [ ] Client receives messages in real-time
- [ ] Client can reply
- [ ] CPO receives replies

### Status Workflow
- [ ] Status: pending → assigned works
- [ ] Status: assigned → en_route works
- [ ] Status: en_route → active works
- [ ] Status: active → completed works
- [ ] Completed assignments move to history

### Error Handling
- [ ] Double-accept prevented (race condition)
- [ ] Network errors handled gracefully
- [ ] Invalid data rejected
- [ ] Permissions enforced (RLS)

---

## Advanced Testing Scenarios

### Test Multiple CPOs Racing to Accept

1. Open CPO app in 2-3 different browsers/profiles
2. Login as different verified CPOs
3. Create a test request from client app
4. All CPOs click "Accept" simultaneously
5. Only ONE should succeed
6. Others should see "Assignment is no longer available"

### Test Real-time Sync Across Devices

1. Login to client app on desktop
2. Login to same client on mobile
3. Create test request on desktop
4. Verify it appears on mobile instantly
5. Accept on CPO app
6. Verify both client devices update

### Test Offline Behavior

1. Create test request
2. Disable network on CPO app
3. Re-enable network
4. Verify assignment appears (reconnection)

---

## Performance Benchmarks

Expected performance metrics:

- **Request Creation:** < 1 second
- **Real-time Update Propagation:** < 2 seconds
- **Assignment Acceptance:** < 500ms
- **Page Load (Client App):** < 3 seconds
- **Page Load (CPO App):** < 2 seconds

---

## Security Testing

### Verify Row Level Security (RLS)

1. **Test CPO Isolation:**
   - CPO A should NOT see CPO B's assignments
   - CPO should only see assigned or pending assignments

2. **Test Principal Isolation:**
   - Principal A should NOT see Principal B's assignments
   - Principal should only see their own requests

3. **Test Status Transitions:**
   - Verify only assigned CPO can update assignment status
   - Verify principal cannot modify CPO-only fields

---

## Production Deployment Testing

Before deploying to production:

1. **Remove Test Button:**
   - Comment out or remove `<MockRequestButton />` from Dashboard
   - Only use in development/staging environments

2. **Clean Test Data:**
   - Delete all assignments with "TEST ASSIGNMENT" in special_instructions
   - Query: `DELETE FROM protection_assignments WHERE special_instructions LIKE '%TEST ASSIGNMENT%'`

3. **Verify Environment Variables:**
   - Production Supabase URL set correctly
   - Firebase configuration for production
   - Stripe keys point to live environment

---

## Continuous Integration

### Automated E2E Tests (Future Enhancement)

Consider adding Cypress or Playwright tests:

```javascript
// Example Cypress test
describe('E2E: Protection Request Flow', () => {
  it('creates request in client, accepts in CPO app', () => {
    // Login to client
    cy.visit('http://localhost:3000')
    cy.login('testclient@example.com', 'password')

    // Create test request
    cy.get('[data-testid="create-test-request"]').click()
    cy.get('[data-testid="assignment-id"]').should('be.visible')

    // Switch to CPO app
    cy.visit('http://localhost:3001')
    cy.login('testcpo@example.com', 'password')

    // Accept assignment
    cy.get('[data-testid="available-jobs"]').click()
    cy.contains('TEST').parent().within(() => {
      cy.get('[data-testid="accept-button"]').click()
    })

    // Verify acceptance
    cy.contains('Assignment accepted').should('be.visible')
  })
})
```

---

## Support

### Getting Help

If you encounter issues not covered in this guide:

1. **Check Browser Console:** Look for JavaScript errors
2. **Check Network Tab:** Verify API calls to Supabase
3. **Check Supabase Logs:** Database query errors
4. **Review Code:**
   - Client: `/workspaces/armora/src/components/Testing/MockRequestButton.tsx`
   - CPO: `/workspaces/armoracpo/src/screens/Jobs/AvailableJobs.tsx`

### Development Team Contacts

- **Backend/Database Issues:** Check Supabase dashboard
- **Frontend Issues:** Browser DevTools console
- **Real-time Issues:** Verify Supabase real-time enabled

---

## Changelog

### Version 1.0.0 (Current)
- Initial E2E testing guide
- Mock request button implementation
- TEST badge indicator for CPO app
- Basic troubleshooting steps

### Future Enhancements
- Automated Cypress/Playwright tests
- Performance monitoring
- Load testing with multiple concurrent requests
- Advanced messaging scenarios
- Push notification testing

---

## Additional Resources

- **Supabase Docs:** https://supabase.com/docs
- **React Query:** https://tanstack.com/query/latest
- **Firebase Cloud Messaging:** https://firebase.google.com/docs/cloud-messaging
- **Armora Project Docs:** `/workspaces/armoracpo/docs/`

---

**Happy Testing! 🧪**
