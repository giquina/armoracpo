# QA Testing Checklist - ArmoraCPO

> **Version:** 1.0.0
> **Last Updated:** 2025-10-08
> **Purpose:** Comprehensive manual QA testing checklist for ArmoraCPO Close Protection Officer platform

---

## Table of Contents

1. [Pre-Testing Setup](#pre-testing-setup)
2. [Authentication & Authorization](#authentication--authorization)
3. [Job Management](#job-management)
4. [Messaging System](#messaging-system)
5. [Incident Reporting](#incident-reporting)
6. [GPS Location Tracking](#gps-location-tracking)
7. [Push Notifications](#push-notifications)
8. [Offline Mode](#offline-mode)
9. [Daily Occurrence Book (DOB)](#daily-occurrence-book-dob)
10. [UI/UX & Responsiveness](#uiux--responsiveness)
11. [Performance Testing](#performance-testing)
12. [Security Testing](#security-testing)
13. [Cross-Browser Compatibility](#cross-browser-compatibility)
14. [Bug Reporting Template](#bug-reporting-template)

---

## Pre-Testing Setup

### Environment Configuration

- [ ] Verify `.env` file contains all required environment variables
- [ ] Confirm Supabase connection is active (`REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`)
- [ ] Verify Firebase FCM configuration (all `REACT_APP_FIREBASE_*` variables)
- [ ] Confirm Sentry DSN is configured for error tracking
- [ ] Check that dev mode can be enabled: `sessionStorage.setItem('devMode', 'true')`

### Test Data Requirements

- [ ] At least 2 test CPO accounts (one verified, one pending)
- [ ] At least 1 test admin account
- [ ] 5+ test assignments in various states (pending, assigned, active, completed, cancelled)
- [ ] Sample incident reports with different severity levels
- [ ] Test messages in assignment threads
- [ ] Sample DOB entries (auto-logged and manual)

### Testing Devices

- [ ] Desktop Chrome (latest)
- [ ] Desktop Firefox (latest)
- [ ] Desktop Safari (latest)
- [ ] Mobile iOS Safari
- [ ] Mobile Android Chrome
- [ ] Tablet (iPad/Android)

---

## Authentication & Authorization

### Login Flow

#### Test Case: Successful Login
- [ ] Navigate to landing page (`/`)
- [ ] Click "SIGN IN" button
- [ ] Enter valid CPO credentials (`test.cpo@armoracpo.com`)
- [ ] Submit login form
- [ ] **Expected:** Redirect to `/dashboard`
- [ ] **Expected:** User menu visible in header (data-testid="user-menu")
- [ ] **Expected:** Welcome message displays CPO name

#### Test Case: Invalid Credentials
- [ ] Navigate to login page
- [ ] Enter invalid email/password combination
- [ ] Submit form
- [ ] **Expected:** Error message "Invalid login credentials" displayed
- [ ] **Expected:** No redirect occurs
- [ ] **Expected:** Password field cleared for security

#### Test Case: Empty Field Validation
- [ ] Navigate to login page
- [ ] Leave email field empty, click submit
- [ ] **Expected:** "Email is required" validation error
- [ ] Leave password field empty, click submit
- [ ] **Expected:** "Password is required" validation error

#### Test Case: SIA Verification Check
- [ ] Login with unverified CPO account
- [ ] **Expected:** Warning message about pending verification
- [ ] **Expected:** Limited access to features (cannot accept jobs)
- [ ] Login with verified CPO account
- [ ] **Expected:** Full access to all features

### Signup Flow

#### Test Case: New CPO Registration
- [ ] Navigate to signup page (`/signup`)
- [ ] Enter valid details:
  - Full name: "Test CPO New"
  - Email: unique email address
  - Password: meets requirements (8+ chars, uppercase, number, special)
  - SIA License Number: valid format (SIA + 9 digits)
- [ ] Submit form
- [ ] **Expected:** Success message "Check your email to verify your account"
- [ ] **Expected:** Email sent to provided address
- [ ] **Expected:** User redirected to verification pending page

#### Test Case: Duplicate Email Registration
- [ ] Attempt to register with existing email
- [ ] **Expected:** Error "Email already registered"
- [ ] **Expected:** Form not submitted

#### Test Case: Password Requirements
- [ ] Test password with < 8 characters
- [ ] **Expected:** Validation error displayed
- [ ] Test password without uppercase letter
- [ ] **Expected:** Validation error displayed
- [ ] Test password without number
- [ ] **Expected:** Validation error displayed
- [ ] Test password without special character
- [ ] **Expected:** Validation error displayed

### Session Management

#### Test Case: Session Persistence
- [ ] Login successfully
- [ ] Refresh browser (F5)
- [ ] **Expected:** User remains logged in
- [ ] **Expected:** No redirect to login page
- [ ] Close browser tab and reopen
- [ ] Navigate to app URL
- [ ] **Expected:** User still authenticated

#### Test Case: Session Timeout
- [ ] Login successfully
- [ ] Wait for session timeout (Supabase default: 1 hour)
- [ ] Attempt to perform action (e.g., view jobs)
- [ ] **Expected:** Session expired message
- [ ] **Expected:** Redirect to login page

#### Test Case: Logout Flow
- [ ] Login successfully
- [ ] Click user menu (data-testid="user-menu")
- [ ] Click "Logout" button
- [ ] **Expected:** Redirect to landing page (`/`)
- [ ] **Expected:** All session data cleared
- [ ] **Expected:** Cannot access protected routes

### Protected Routes

#### Test Case: Unauthenticated Access
- [ ] Ensure logged out
- [ ] Navigate to `/dashboard`
- [ ] **Expected:** Redirect to `/login`
- [ ] Navigate to `/jobs`
- [ ] **Expected:** Redirect to `/login`
- [ ] Navigate to `/incidents/new`
- [ ] **Expected:** Redirect to `/login`

#### Test Case: Authenticated Access
- [ ] Login successfully
- [ ] Navigate to `/dashboard`
- [ ] **Expected:** Dashboard loads successfully
- [ ] Navigate to `/jobs`
- [ ] **Expected:** Jobs page loads successfully
- [ ] Navigate to `/profile`
- [ ] **Expected:** Profile page loads successfully

---

## Job Management

### Browse Available Jobs

#### Test Case: View Available Jobs List
- [ ] Login as verified CPO
- [ ] Navigate to "Jobs" section
- [ ] **Expected:** List of available assignments displayed
- [ ] **Expected:** Each job shows:
  - Job title
  - Location (pickup and dropoff)
  - Scheduled start time
  - Duration estimate
  - Hourly rate
  - Assignment type badge
  - Threat level indicator

#### Test Case: Filter Jobs
- [ ] Apply assignment type filter (e.g., "Executive Protection")
- [ ] **Expected:** Only matching jobs displayed
- [ ] Apply threat level filter (e.g., "High")
- [ ] **Expected:** Only high-threat jobs displayed
- [ ] Apply location filter (e.g., "London")
- [ ] **Expected:** Only jobs in London area displayed
- [ ] Clear all filters
- [ ] **Expected:** All jobs displayed again

#### Test Case: Sort Jobs
- [ ] Sort by "Nearest First"
- [ ] **Expected:** Jobs sorted by distance from CPO location
- [ ] Sort by "Highest Rate"
- [ ] **Expected:** Jobs sorted by hourly rate (descending)
- [ ] Sort by "Soonest Start"
- [ ] **Expected:** Jobs sorted by scheduled start time (ascending)

### Job Details

#### Test Case: View Job Details
- [ ] Click on a job from the list
- [ ] **Expected:** Job details modal/page opens
- [ ] **Expected:** Displays all job information:
  - Principal name and photo
  - Pickup location with map
  - Dropoff location with map
  - Scheduled times
  - Special instructions
  - Required certifications
  - Payment details (rate, estimated total)
  - Assignment type and threat level

#### Test Case: View Job Location on Map
- [ ] Open job details
- [ ] **Expected:** Map displays pickup location marker
- [ ] **Expected:** Map displays dropoff location marker (if available)
- [ ] **Expected:** Route preview shown (if both locations available)
- [ ] Test map interactions (zoom, pan)
- [ ] **Expected:** Map responsive to interactions

### Accept Job

#### Test Case: Accept Available Job
- [ ] Open job details for "pending" assignment
- [ ] Click "Accept Job" button
- [ ] **Expected:** Confirmation modal appears
- [ ] Confirm acceptance
- [ ] **Expected:** Job status changes to "assigned"
- [ ] **Expected:** Job moves to "My Assignments" section
- [ ] **Expected:** Success notification displayed
- [ ] **Expected:** Real-time database update (check in Supabase)

#### Test Case: Cannot Accept Multiple Jobs Simultaneously
- [ ] Accept first job
- [ ] Attempt to accept second job with overlapping time
- [ ] **Expected:** Warning message "You already have an assignment during this time"
- [ ] **Expected:** Cannot accept conflicting job

#### Test Case: Accept Job - Unverified CPO
- [ ] Login with unverified CPO account
- [ ] Attempt to accept job
- [ ] **Expected:** Error "Your account must be verified to accept assignments"
- [ ] **Expected:** Link to verification status page

### Active Job Flow

#### Test Case: Start Journey (En Route)
- [ ] Navigate to accepted assignment
- [ ] Click "Start Journey" button
- [ ] **Expected:** GPS location permission requested (if not granted)
- [ ] Grant location permission
- [ ] **Expected:** Assignment status changes to "en_route"
- [ ] **Expected:** Real-time GPS tracking starts
- [ ] **Expected:** Auto DOB entry logged "Journey started"
- [ ] **Expected:** Principal receives notification (if FCM enabled)

#### Test Case: Arrive at Pickup
- [ ] While "en_route", click "Arrived at Pickup"
- [ ] **Expected:** Confirmation modal appears
- [ ] Confirm arrival
- [ ] **Expected:** Auto DOB entry logged with GPS coordinates
- [ ] **Expected:** Arrival time recorded
- [ ] **Expected:** Principal notified

#### Test Case: Start Assignment
- [ ] Click "Start Assignment" button (after arrival)
- [ ] **Expected:** Assignment status changes to "active"
- [ ] **Expected:** Auto DOB entry logged "Assignment started"
- [ ] **Expected:** Timer starts for duration tracking
- [ ] **Expected:** Real-time location updates every 30 seconds (verify in Supabase)

#### Test Case: Complete Assignment
- [ ] While assignment "active", click "Complete Assignment"
- [ ] **Expected:** Completion form appears
- [ ] Enter completion notes
- [ ] Click "Complete"
- [ ] **Expected:** Assignment status changes to "completed"
- [ ] **Expected:** Auto DOB entry logged "Assignment completed"
- [ ] **Expected:** Final location saved
- [ ] **Expected:** Payment calculation displayed
- [ ] **Expected:** Assignment summary shown

#### Test Case: Cancel Assignment
- [ ] Open assigned/en_route assignment
- [ ] Click "Cancel Assignment" button
- [ ] **Expected:** Cancellation reason modal appears
- [ ] Select cancellation reason
- [ ] Enter notes
- [ ] Confirm cancellation
- [ ] **Expected:** Assignment status changes to "cancelled"
- [ ] **Expected:** DOB entry logged with cancellation reason
- [ ] **Expected:** Principal and coordinator notified

### Assignment History

#### Test Case: View Completed Assignments
- [ ] Navigate to "My Assignments" → "Completed"
- [ ] **Expected:** List of completed assignments displayed
- [ ] **Expected:** Each shows completion date, principal, location, earnings
- [ ] Click on completed assignment
- [ ] **Expected:** Full assignment details displayed (read-only)
- [ ] **Expected:** Can view DOB entries
- [ ] **Expected:** Can export assignment summary PDF

---

## Messaging System

### Message List

#### Test Case: View Message Threads
- [ ] Navigate to "Messages" section
- [ ] **Expected:** List of message threads displayed
- [ ] **Expected:** Each thread shows:
  - Assignment details
  - Last message preview
  - Timestamp
  - Unread indicator (if applicable)
  - Principal/client name and avatar

#### Test Case: Unread Message Indicator
- [ ] Have another user send message
- [ ] **Expected:** Red badge appears on Messages icon
- [ ] **Expected:** Unread count displayed
- [ ] Open message thread
- [ ] **Expected:** Unread indicator disappears
- [ ] **Expected:** Badge count decreases

### Message Chat

#### Test Case: Send Message
- [ ] Open message thread for active assignment
- [ ] Type message in input field
- [ ] Click "Send" button
- [ ] **Expected:** Message appears in chat instantly
- [ ] **Expected:** Message saved to database (verify in Supabase)
- [ ] **Expected:** Recipient receives real-time update
- [ ] **Expected:** Timestamp displayed correctly

#### Test Case: Receive Message
- [ ] Have another user send message to CPO
- [ ] **Expected:** Message appears in real-time (no refresh needed)
- [ ] **Expected:** Notification sound/visual (if enabled)
- [ ] **Expected:** Push notification (if app in background)

#### Test Case: Message Validation
- [ ] Attempt to send empty message
- [ ] **Expected:** Send button disabled or error shown
- [ ] Type message exceeding character limit (if any)
- [ ] **Expected:** Character count warning displayed
- [ ] **Expected:** Cannot exceed limit

#### Test Case: Quick Reply Templates
- [ ] Click "Quick Replies" button (if available)
- [ ] **Expected:** List of template messages displayed
- [ ] Select template (e.g., "On my way")
- [ ] **Expected:** Template text inserted into message field
- [ ] **Expected:** Can edit before sending

#### Test Case: Read Receipts
- [ ] Send message to client
- [ ] **Expected:** Message shows "Sent" status
- [ ] When client reads message
- [ ] **Expected:** Message shows "Read" status
- [ ] **Expected:** Timestamp of read displayed

#### Test Case: Typing Indicator
- [ ] Start typing message
- [ ] **Expected:** Recipient sees "CPO is typing..." indicator
- [ ] Stop typing
- [ ] **Expected:** Typing indicator disappears after 3 seconds

### Message Attachments (if implemented)

#### Test Case: Send Image
- [ ] Click attachment button
- [ ] Select image from device
- [ ] **Expected:** Image preview displayed
- [ ] Add optional caption
- [ ] Send message
- [ ] **Expected:** Image uploaded to Supabase Storage
- [ ] **Expected:** Image displayed in chat with thumbnail
- [ ] **Expected:** Click to view full size

---

## Incident Reporting

### Create Incident Report

#### Test Case: New Incident Report
- [ ] Navigate to "Incidents" → "New Report"
- [ ] **Expected:** Incident report form displayed
- [ ] **Expected:** Auto-generated incident number displayed (IR-YYYYMMDD-XXXX)
- [ ] **Expected:** Current GPS location pre-filled
- [ ] **Expected:** Assignment details pre-filled (if reporting during assignment)

#### Test Case: Incident Classification
- [ ] Select incident type (e.g., "Threat")
- [ ] **Expected:** Type-specific fields appear
- [ ] Select severity level (Low/Medium/High/Critical)
- [ ] **Expected:** Severity badge color updates
- [ ] **Expected:** Required fields adjust based on severity

#### Test Case: Incident Details Entry
- [ ] Enter incident title
- [ ] Enter detailed description (minimum 50 characters)
- [ ] Select incident date and time
- [ ] **Expected:** Cannot select future date
- [ ] Enter location details
- [ ] **Expected:** Can manually adjust GPS coordinates
- [ ] **Expected:** Map preview updates

#### Test Case: Media Upload
- [ ] Click "Add Photo" button
- [ ] Select photo from device
- [ ] **Expected:** GPS metadata extracted and displayed
- [ ] **Expected:** Image preview with EXIF data shown
- [ ] **Expected:** Timestamp and location automatically tagged
- [ ] Add second photo
- [ ] **Expected:** Multiple photos supported
- [ ] **Expected:** Photos ordered by timestamp
- [ ] Upload video (if supported)
- [ ] **Expected:** Video upload progress shown
- [ ] **Expected:** File size validation (max 50MB)

#### Test Case: GPS-Tagged Media Chain of Custody
- [ ] Upload photo with GPS metadata
- [ ] **Expected:** Exact GPS coordinates extracted
- [ ] **Expected:** Timestamp extracted from EXIF
- [ ] **Expected:** SHA-256 hash calculated and displayed
- [ ] **Expected:** Chain of custody log entry created
- [ ] Verify in database
- [ ] **Expected:** `media_files` table contains all metadata

#### Test Case: Witness Statements
- [ ] Click "Add Witness" button
- [ ] Enter witness name
- [ ] Enter witness contact information
- [ ] Enter witness statement
- [ ] **Expected:** GDPR consent checkbox displayed
- [ ] **Expected:** Cannot save without consent
- [ ] Check GDPR consent
- [ ] Save witness details
- [ ] **Expected:** Witness added to report
- [ ] Add second witness
- [ ] **Expected:** Multiple witnesses supported

#### Test Case: Digital Signatures
- [ ] Navigate to "Signatures" section
- [ ] Sign as CPO
- [ ] **Expected:** Signature pad responsive
- [ ] **Expected:** Can clear and re-sign
- [ ] Save CPO signature
- [ ] **Expected:** Signature image saved
- [ ] **Expected:** Timestamp and officer ID recorded
- [ ] Request principal signature (if present)
- [ ] **Expected:** Principal signature pad displayed
- [ ] **Expected:** Name and timestamp captured

#### Test Case: Submit Incident Report
- [ ] Complete all required fields
- [ ] Click "Submit Report" button
- [ ] **Expected:** Validation checks pass
- [ ] **Expected:** Confirmation modal displayed
- [ ] Confirm submission
- [ ] **Expected:** Report status changes to "submitted"
- [ ] **Expected:** Report becomes immutable (cannot edit)
- [ ] **Expected:** Success notification displayed
- [ ] **Expected:** Report saved to database

#### Test Case: Incomplete Report Validation
- [ ] Leave required field empty (e.g., incident type)
- [ ] Attempt to submit
- [ ] **Expected:** Validation error highlighted
- [ ] **Expected:** Cannot submit until fixed
- [ ] Missing CPO signature
- [ ] **Expected:** Error "CPO signature required"

### View Incident Reports

#### Test Case: Incident Reports List
- [ ] Navigate to "Incidents" → "My Reports"
- [ ] **Expected:** List of all incident reports displayed
- [ ] **Expected:** Sortable by date, severity, status
- [ ] **Expected:** Filter by incident type
- [ ] **Expected:** Search by incident number or keywords

#### Test Case: View Incident Report Details
- [ ] Click on incident report from list
- [ ] **Expected:** Full report displayed (read-only if submitted)
- [ ] **Expected:** All fields populated correctly
- [ ] **Expected:** Media files displayed with metadata
- [ ] **Expected:** Witness statements shown
- [ ] **Expected:** Signatures displayed

#### Test Case: Export Incident Report PDF
- [ ] Open submitted incident report
- [ ] Click "Export PDF" button
- [ ] **Expected:** PDF generation starts
- [ ] **Expected:** Loading indicator displayed
- [ ] **Expected:** PDF downloads successfully
- [ ] Open PDF file
- [ ] **Expected:** All report data included
- [ ] **Expected:** Images embedded correctly
- [ ] **Expected:** Signatures visible
- [ ] **Expected:** Legal compliance footer included
- [ ] **Expected:** 7-year retention notice displayed

### Incident Report Immutability

#### Test Case: Cannot Edit Submitted Report
- [ ] Open submitted incident report
- [ ] **Expected:** All fields are read-only
- [ ] **Expected:** No "Edit" button available
- [ ] **Expected:** Message displayed: "Submitted reports cannot be modified"
- [ ] Verify in database
- [ ] **Expected:** Database triggers prevent updates

#### Test Case: Draft Reports Can Be Edited
- [ ] Create incident report but don't submit
- [ ] Save as draft
- [ ] Close report
- [ ] Re-open draft report
- [ ] **Expected:** Can edit all fields
- [ ] **Expected:** "Submit" button available
- [ ] Make changes and save
- [ ] **Expected:** Changes saved successfully

---

## GPS Location Tracking

### Real-Time Location Updates

#### Test Case: Enable Location Services
- [ ] Login and navigate to dashboard
- [ ] **Expected:** Location permission prompt appears (first time)
- [ ] Grant location permission
- [ ] **Expected:** Success message "Location enabled"
- [ ] **Expected:** CPO location marker appears on map
- [ ] Deny location permission
- [ ] **Expected:** Warning "Location services required for assignments"
- [ ] **Expected:** Limited functionality notice

#### Test Case: Real-Time Location Broadcasting
- [ ] Accept assignment
- [ ] Start journey (en_route)
- [ ] **Expected:** GPS location updates every 30 seconds
- [ ] Verify in Supabase:
  - Check `officer_location_history` table
  - Verify timestamp updates
  - Verify lat/lng accuracy
- [ ] **Expected:** Location visible to coordinator/principal
- [ ] Move to different location
- [ ] **Expected:** Map updates in real-time

#### Test Case: Location History Tracking
- [ ] Complete assignment
- [ ] Navigate to assignment details
- [ ] View "Location History"
- [ ] **Expected:** Timeline of all GPS points displayed
- [ ] **Expected:** Can replay journey on map
- [ ] **Expected:** Timestamps accurate
- [ ] Export location history
- [ ] **Expected:** CSV/JSON download available

#### Test Case: Geofence Alerts (if implemented)
- [ ] Approach pickup location
- [ ] **Expected:** Notification when within 500m
- [ ] Arrive at pickup location
- [ ] **Expected:** Auto-detect arrival
- [ ] **Expected:** Prompt to confirm "Arrived at Pickup"
- [ ] Leave designated area during assignment
- [ ] **Expected:** Alert to coordinator (if configured)

### Location Accuracy

#### Test Case: High Accuracy Mode
- [ ] Enable high accuracy GPS
- [ ] **Expected:** Location updates more frequently
- [ ] **Expected:** Accuracy within 10-20 meters
- [ ] **Expected:** Battery usage warning displayed
- [ ] Disable high accuracy
- [ ] **Expected:** Standard GPS mode (updates every 30s)

#### Test Case: Poor GPS Signal
- [ ] Move to area with poor GPS signal (indoors/underground)
- [ ] **Expected:** Warning message "GPS signal weak"
- [ ] **Expected:** Last known location displayed
- [ ] **Expected:** Timestamp shows last update
- [ ] Return to area with good signal
- [ ] **Expected:** GPS updates resume automatically

---

## Push Notifications

### FCM Setup

#### Test Case: Notification Permission Request
- [ ] Login for first time
- [ ] **Expected:** Push notification permission prompt appears
- [ ] Grant permission
- [ ] **Expected:** FCM token registered in database
- [ ] Verify in Supabase `protection_officers.fcm_token`
- [ ] **Expected:** Token value present
- [ ] Deny permission
- [ ] **Expected:** Warning "Notifications disabled - you may miss important updates"

#### Test Case: FCM Token Registration
- [ ] Login successfully
- [ ] Check browser console for FCM token
- [ ] **Expected:** Token logged (in dev mode)
- [ ] Verify token sent to backend
- [ ] **Expected:** Token saved in `protection_officers.fcm_token`
- [ ] Logout and login again
- [ ] **Expected:** Token refreshed (if changed)

### Notification Types

#### Test Case: New Assignment Notification
- [ ] Have admin create new assignment
- [ ] **Expected:** Push notification received
- [ ] **Expected:** Notification shows:
  - Title: "New Assignment Available"
  - Body: Assignment location and time
  - Click action: Opens job details
- [ ] Click notification
- [ ] **Expected:** App opens to job details page

#### Test Case: Message Notification
- [ ] Have client send message
- [ ] **Expected:** Push notification received (if app in background)
- [ ] **Expected:** Notification shows:
  - Title: "New Message from [Client Name]"
  - Body: Message preview (first 50 chars)
- [ ] Click notification
- [ ] **Expected:** App opens to message thread

#### Test Case: Emergency Notification
- [ ] Trigger emergency panic button (if implemented)
- [ ] **Expected:** High priority notification sent
- [ ] **Expected:** Notification sound/vibration
- [ ] **Expected:** Notification persists until acknowledged
- [ ] **Expected:** Coordinator receives alert

#### Test Case: Assignment Status Notification
- [ ] Assignment status changes (e.g., cancelled by client)
- [ ] **Expected:** Notification received
- [ ] **Expected:** Clear message about status change
- [ ] Click notification
- [ ] **Expected:** Opens relevant assignment details

### Notification Settings

#### Test Case: Manage Notification Preferences
- [ ] Navigate to "Settings" → "Notifications"
- [ ] **Expected:** List of notification types displayed
- [ ] Toggle "New Assignments" off
- [ ] **Expected:** Preference saved
- [ ] Have new assignment created
- [ ] **Expected:** No push notification received
- [ ] Toggle "New Assignments" back on
- [ ] **Expected:** Notifications resume

#### Test Case: Do Not Disturb Mode
- [ ] Enable "Do Not Disturb" mode
- [ ] Set time range (e.g., 10 PM - 7 AM)
- [ ] **Expected:** No notifications during this time
- [ ] **Expected:** Emergency notifications still received
- [ ] Disable "Do Not Disturb"
- [ ] **Expected:** All notifications resume

---

## Offline Mode

### Service Worker & Caching

#### Test Case: Service Worker Registration
- [ ] Open app in browser
- [ ] Check browser DevTools → Application → Service Workers
- [ ] **Expected:** Service worker registered and active
- [ ] **Expected:** Status: "activated and is running"
- [ ] Check Cache Storage
- [ ] **Expected:** Static assets cached (JS, CSS, images)

#### Test Case: Offline App Loading
- [ ] Visit app while online
- [ ] Enable offline mode (DevTools → Network → Offline)
- [ ] Refresh page
- [ ] **Expected:** App shell loads from cache
- [ ] **Expected:** Header and navigation visible
- [ ] **Expected:** "You are offline" banner displayed

#### Test Case: View Cached Data Offline
- [ ] While online, view assignments list
- [ ] View assignment details
- [ ] View messages
- [ ] Enable offline mode
- [ ] Navigate to assignments
- [ ] **Expected:** Previously viewed data displayed
- [ ] **Expected:** Data loaded from IndexedDB
- [ ] Open previously viewed assignment
- [ ] **Expected:** Full details displayed

#### Test Case: Offline Actions Queued
- [ ] Enable offline mode
- [ ] Attempt to send message
- [ ] **Expected:** Message queued
- [ ] **Expected:** "Message will be sent when online" notification
- [ ] Attempt to update assignment status
- [ ] **Expected:** Action queued
- [ ] **Expected:** Pending indicator shown
- [ ] Return online
- [ ] **Expected:** Queued actions synced automatically
- [ ] **Expected:** Success confirmation displayed

#### Test Case: Offline Data Sync
- [ ] Go offline
- [ ] Make local changes (e.g., add DOB entry)
- [ ] **Expected:** Changes saved to IndexedDB
- [ ] Return online
- [ ] **Expected:** Auto-sync initiated
- [ ] **Expected:** Loading indicator during sync
- [ ] **Expected:** Success message "Data synced"
- [ ] Verify in Supabase database
- [ ] **Expected:** Changes persisted

#### Test Case: Conflict Resolution
- [ ] Go offline
- [ ] Update assignment notes locally
- [ ] Have another user update same assignment
- [ ] Return online
- [ ] **Expected:** Conflict detection triggered
- [ ] **Expected:** Conflict resolution UI displayed
- [ ] Choose "Keep my version"
- [ ] **Expected:** Local changes take priority
- [ ] **Expected:** Other user's changes discarded (with warning)

---

## Daily Occurrence Book (DOB)

### Auto-Logging

#### Test Case: Assignment Start Auto-Log
- [ ] Accept assignment
- [ ] Click "Start Journey"
- [ ] **Expected:** DOB entry auto-created
- [ ] **Expected:** Entry contains:
  - Event: "Assignment commenced"
  - Timestamp (exact time)
  - GPS coordinates (pickup location)
  - Assignment ID reference

#### Test Case: Location Change Auto-Log
- [ ] During active assignment, move significant distance (> 1km)
- [ ] **Expected:** DOB entry auto-created
- [ ] **Expected:** Entry contains:
  - Event: "Location changed"
  - Previous location
  - New location
  - Distance traveled
  - Timestamp

#### Test Case: Assignment End Auto-Log
- [ ] Complete assignment
- [ ] **Expected:** DOB entry auto-created
- [ ] **Expected:** Entry contains:
  - Event: "Assignment completed"
  - Completion time
  - Final location
  - Total duration

### Manual Entries

#### Test Case: Create Manual DOB Entry
- [ ] During assignment, click "Add DOB Entry"
- [ ] **Expected:** Entry form displayed
- [ ] Select event type (e.g., "Observation", "Incident")
- [ ] Enter description
- [ ] **Expected:** Current GPS location pre-filled
- [ ] **Expected:** Current timestamp pre-filled
- [ ] Save entry
- [ ] **Expected:** Entry added to DOB log
- [ ] **Expected:** Entry marked as "Manual"

#### Test Case: Manual Entry Validation
- [ ] Attempt to create entry without description
- [ ] **Expected:** Validation error "Description required"
- [ ] Enter description < 10 characters
- [ ] **Expected:** Validation error "Minimum 10 characters"
- [ ] Enter valid description
- [ ] **Expected:** Entry saved successfully

### DOB Immutability

#### Test Case: Cannot Edit Submitted DOB Entry
- [ ] View previously submitted DOB entry
- [ ] **Expected:** All fields read-only
- [ ] **Expected:** No "Edit" button available
- [ ] **Expected:** Message: "DOB entries are immutable once submitted"
- [ ] Attempt to edit via database
- [ ] **Expected:** Database triggers prevent updates

#### Test Case: Draft DOB Entries
- [ ] Create DOB entry but don't submit
- [ ] Save as draft
- [ ] Re-open draft
- [ ] **Expected:** Can edit fields
- [ ] Submit entry
- [ ] **Expected:** Entry becomes immutable

### DOB Export

#### Test Case: Export DOB for Assignment
- [ ] Complete assignment
- [ ] Navigate to DOB section
- [ ] Click "Export DOB"
- [ ] **Expected:** Export format options (PDF, CSV)
- [ ] Select PDF
- [ ] **Expected:** PDF generation starts
- [ ] **Expected:** Download successful
- [ ] Open PDF
- [ ] **Expected:** All entries listed chronologically
- [ ] **Expected:** GPS coordinates included
- [ ] **Expected:** Auto/Manual entries clearly marked
- [ ] **Expected:** Legal compliance header/footer

---

## UI/UX & Responsiveness

### Mobile Responsiveness

#### Test Case: iPhone SE (375x667)
- [ ] Open app on iPhone SE
- [ ] **Expected:** Header stacks appropriately
- [ ] **Expected:** Navigation menu accessible
- [ ] **Expected:** Forms fit screen width
- [ ] **Expected:** Buttons minimum 44x44 touch target
- [ ] Test all major screens (dashboard, jobs, messages)
- [ ] **Expected:** No horizontal scrolling
- [ ] **Expected:** Text readable without zooming

#### Test Case: iPhone 12 Pro (390x844)
- [ ] Test landscape orientation
- [ ] **Expected:** Layout adjusts gracefully
- [ ] **Expected:** Map view expands
- [ ] **Expected:** Message chat optimized for landscape

#### Test Case: iPad (768x1024)
- [ ] Open app on iPad
- [ ] **Expected:** Two-column layout where appropriate
- [ ] **Expected:** Sidebar navigation visible
- [ ] **Expected:** Message list + chat side-by-side
- [ ] Test split-screen mode (iPad)
- [ ] **Expected:** App remains functional at 50% width

#### Test Case: Desktop (1920x1080)
- [ ] Open app on desktop
- [ ] **Expected:** Max-width container (prevents excessive stretching)
- [ ] **Expected:** Appropriate whitespace
- [ ] **Expected:** Multi-column layouts utilized
- [ ] **Expected:** Hover states on interactive elements

### Accessibility

#### Test Case: Keyboard Navigation
- [ ] Navigate entire app using only keyboard (Tab, Enter, Arrow keys)
- [ ] **Expected:** Focus indicators visible
- [ ] **Expected:** Logical tab order
- [ ] **Expected:** Can submit forms with Enter key
- [ ] **Expected:** Can close modals with Escape key

#### Test Case: Screen Reader Compatibility
- [ ] Enable screen reader (VoiceOver/TalkBack)
- [ ] Navigate app
- [ ] **Expected:** All buttons have descriptive labels
- [ ] **Expected:** Form inputs have associated labels
- [ ] **Expected:** Images have alt text
- [ ] **Expected:** Status messages announced

#### Test Case: Color Contrast
- [ ] Use contrast checker tool
- [ ] **Expected:** Text meets WCAG AA standard (4.5:1 minimum)
- [ ] **Expected:** Status badges readable
- [ ] **Expected:** Button text contrasts with background
- [ ] Test with color blindness simulator
- [ ] **Expected:** Information not conveyed by color alone

### Animation & Transitions

#### Test Case: Page Transitions
- [ ] Navigate between screens
- [ ] **Expected:** Smooth transitions (Framer Motion)
- [ ] **Expected:** No jarring jumps
- [ ] **Expected:** Loading states during async operations
- [ ] **Expected:** Skeleton screens for content loading

#### Test Case: Reduce Motion Preference
- [ ] Enable "Reduce Motion" in OS settings
- [ ] Navigate app
- [ ] **Expected:** Animations disabled/simplified
- [ ] **Expected:** Instant transitions
- [ ] **Expected:** No vestibular triggers

---

## Performance Testing

### Page Load Performance

#### Test Case: Initial Page Load
- [ ] Clear browser cache
- [ ] Navigate to app root
- [ ] Open DevTools Performance tab
- [ ] Record page load
- [ ] **Expected:** First Contentful Paint < 1.5s
- [ ] **Expected:** Time to Interactive < 3.5s
- [ ] **Expected:** Largest Contentful Paint < 2.5s

#### Test Case: JavaScript Bundle Size
- [ ] Build production app (`npm run build`)
- [ ] Check bundle size
- [ ] **Expected:** Main bundle < 300KB (gzipped)
- [ ] **Expected:** Code splitting implemented
- [ ] **Expected:** Lazy loading for routes

#### Test Case: Image Optimization
- [ ] Check Network tab for image requests
- [ ] **Expected:** Images served in modern formats (WebP)
- [ ] **Expected:** Responsive images (srcset)
- [ ] **Expected:** Lazy loading below the fold

### Runtime Performance

#### Test Case: Scroll Performance
- [ ] Open long list (100+ items)
- [ ] Scroll rapidly
- [ ] **Expected:** 60fps maintained
- [ ] **Expected:** No jank or stuttering
- [ ] **Expected:** Virtual scrolling (if list > 50 items)

#### Test Case: Real-Time Updates Performance
- [ ] Have 10+ messages sent rapidly
- [ ] **Expected:** UI updates smoothly
- [ ] **Expected:** No lag in message display
- [ ] **Expected:** No memory leaks (check DevTools Memory)

#### Test Case: Memory Usage
- [ ] Open app
- [ ] Navigate through all major sections
- [ ] Check Memory tab in DevTools
- [ ] **Expected:** Memory usage stable (no continuous growth)
- [ ] **Expected:** Cleanup after component unmount
- [ ] Force garbage collection
- [ ] **Expected:** Memory reclaimed

### Network Performance

#### Test Case: API Request Optimization
- [ ] Open Network tab
- [ ] Navigate to dashboard
- [ ] **Expected:** Parallel API requests (not sequential)
- [ ] **Expected:** Response caching where appropriate
- [ ] **Expected:** Request deduplication (same endpoint)

#### Test Case: Real-Time Subscription Efficiency
- [ ] Subscribe to assignment updates
- [ ] **Expected:** Single WebSocket connection
- [ ] **Expected:** Efficient message format (minimal payload)
- [ ] **Expected:** Cleanup on unmount (no orphaned subscriptions)

---

## Security Testing

### Authentication Security

#### Test Case: Password Security
- [ ] Inspect login request in Network tab
- [ ] **Expected:** Password sent over HTTPS
- [ ] **Expected:** Password not logged in console
- [ ] **Expected:** Password not stored in localStorage (only session token)

#### Test Case: Session Token Security
- [ ] Login successfully
- [ ] Check localStorage/sessionStorage
- [ ] **Expected:** Token stored securely (httpOnly cookie preferred)
- [ ] **Expected:** Token not exposed in URL
- [ ] Copy token and use in different browser
- [ ] **Expected:** Cannot reuse token across devices (if configured)

#### Test Case: CSRF Protection
- [ ] Attempt to submit form from external site
- [ ] **Expected:** Request rejected (CSRF token invalid)
- [ ] **Expected:** Error message displayed

### Data Access Control

#### Test Case: Row Level Security (RLS)
- [ ] Login as CPO 1
- [ ] Attempt to access CPO 2's assignments (direct API call)
- [ ] **Expected:** 403 Forbidden or empty response
- [ ] **Expected:** RLS policy enforced
- [ ] Attempt to modify CPO 2's data
- [ ] **Expected:** 403 Forbidden

#### Test Case: Sensitive Data Exposure
- [ ] Inspect API responses in Network tab
- [ ] **Expected:** No passwords in responses
- [ ] **Expected:** No full credit card numbers
- [ ] **Expected:** No SIA license numbers in plain text (if encrypted)
- [ ] **Expected:** No unnecessary PII exposed

### Input Validation

#### Test Case: XSS Prevention
- [ ] Enter `<script>alert('XSS')</script>` in message field
- [ ] Send message
- [ ] **Expected:** Script not executed
- [ ] **Expected:** Text displayed as plain text (escaped)
- [ ] Enter `<img src=x onerror=alert('XSS')>` in DOB description
- [ ] **Expected:** Tag sanitized/escaped

#### Test Case: SQL Injection Prevention
- [ ] Enter `' OR 1=1 --` in search field
- [ ] **Expected:** Treated as literal string
- [ ] **Expected:** No database errors
- [ ] **Expected:** Parameterized queries used (verify in backend logs)

#### Test Case: File Upload Security
- [ ] Attempt to upload malicious file (e.g., .exe renamed to .jpg)
- [ ] **Expected:** File type validation fails
- [ ] **Expected:** Only allowed types accepted (jpg, png, mp4)
- [ ] Upload oversized file (> 50MB)
- [ ] **Expected:** File size validation fails
- [ ] **Expected:** Clear error message

---

## Cross-Browser Compatibility

### Chrome (Latest)
- [ ] All core features functional
- [ ] No console errors
- [ ] GPS location works
- [ ] Push notifications work
- [ ] Service worker registers successfully

### Firefox (Latest)
- [ ] All core features functional
- [ ] No console errors
- [ ] GPS location works
- [ ] Push notifications work
- [ ] Service worker registers successfully

### Safari (Latest)
- [ ] All core features functional
- [ ] No console errors
- [ ] GPS location works (with permission)
- [ ] Push notifications work (if supported)
- [ ] Service worker registers (if supported)
- [ ] Date/time pickers display correctly

### Edge (Latest)
- [ ] All core features functional
- [ ] No console errors
- [ ] GPS location works
- [ ] Push notifications work

### Mobile Safari (iOS)
- [ ] All core features functional
- [ ] Touch interactions responsive
- [ ] GPS location accurate
- [ ] No zoom issues on input focus
- [ ] Viewport meta tag configured correctly

### Mobile Chrome (Android)
- [ ] All core features functional
- [ ] Touch interactions responsive
- [ ] GPS location accurate
- [ ] Push notifications work
- [ ] Add to Home Screen works

---

## Bug Reporting Template

```markdown
### Bug Report

**Title:** [Concise description of the issue]

**Priority:** [Critical / High / Medium / Low]

**Environment:**
- App Version: [e.g., 1.0.0]
- Browser: [e.g., Chrome 120.0.6099]
- OS: [e.g., Windows 11, iOS 17.2]
- Device: [e.g., Desktop, iPhone 14 Pro]

**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [And so on...]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots/Videos:**
[Attach if applicable]

**Console Errors:**
```
[Paste any console errors here]
```

**Network Requests:**
[Include failed API requests, status codes]

**Additional Context:**
- User Type: [CPO / Admin / Client]
- Account Status: [Verified / Unverified]
- Was user online/offline when bug occurred?
- Does the issue persist after clearing cache?
- Has the issue been reproduced by others?

**Possible Fix/Workaround:**
[If known]
```

---

## Testing Sign-Off

### QA Engineer Sign-Off

| Test Category | Pass/Fail | Issues Found | Notes |
|--------------|-----------|--------------|-------|
| Authentication & Authorization | | | |
| Job Management | | | |
| Messaging System | | | |
| Incident Reporting | | | |
| GPS Location Tracking | | | |
| Push Notifications | | | |
| Offline Mode | | | |
| Daily Occurrence Book | | | |
| UI/UX & Responsiveness | | | |
| Performance | | | |
| Security | | | |
| Cross-Browser Compatibility | | | |

**QA Engineer:** ___________________________
**Date:** _______________
**Signature:** ___________________________

**Overall Assessment:**
- [ ] Ready for Production
- [ ] Ready with Minor Issues
- [ ] Major Issues - Not Ready
- [ ] Critical Issues - Requires Immediate Attention

**Critical Issues Count:** ______
**High Priority Issues Count:** ______
**Medium Priority Issues Count:** ______
**Low Priority Issues Count:** ______

**Recommendations:**
[Provide recommendations for release or further testing]

---

## Appendix

### Useful Testing Commands

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run specific test file
npm test -- ComponentName.test.tsx

# Run tests with coverage
npm test -- --coverage

# Build production app
npm run build

# Start development server
npm start
```

### Test Data Accounts

See `tests/setup/test-data-seed.sql` for comprehensive test data setup.

**Test CPO Account:**
- Email: `test.cpo@armoracpo.com`
- Password: `TestPassword123!`
- Status: Verified

**Test Admin Account:**
- Email: `test.admin@armoracpo.com`
- Password: `AdminPassword123!`

### Useful DevTools Settings

**Simulate Offline:**
1. Open DevTools (F12)
2. Network tab → Throttling dropdown → Offline

**Simulate Slow Network:**
1. Open DevTools (F12)
2. Network tab → Throttling dropdown → Slow 3G

**Simulate Location:**
1. Open DevTools (F12)
2. Console → Three dots → Sensors
3. Set custom location (London: 51.5074, -0.1278)

**Enable DevMode:**
```javascript
sessionStorage.setItem('devMode', 'true');
```

---

**Document Version:** 1.0.0
**Last Updated:** 2025-10-08
**Maintained By:** QA Team - ArmoraCPO
