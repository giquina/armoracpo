# ✅ Armora CPO - Development Todo List

## 🎯 Project Overview

Building the **Armora CPO** (Close Protection Officer) mobile app - the operator-side companion to the Armora client app. This is a professional security operations platform for SIA-licensed CPOs.

**Tech Stack:**
- React 19.1.1 + TypeScript
- Supabase (Database) + Firebase (Auth/Messaging)
- Vercel (Hosting)
- PWA with offline support

---

## 📋 Phase 1: Project Setup & Foundation

### **1.1 Initial Setup**
- [x] Analyze Armora client app architecture
- [x] Create project documentation structure
- [x] Create claude.md (build instructions)
- [x] Create agents.md (Claude Code agents)
- [x] Create suggestions.md (SIA terminology)
- [x] Create react.md (React best practices)
- [x] Create vercel.md (deployment guide)
- [x] Create supabase.md (backend setup)
- [x] Create firebase.md (auth & messaging)
- [x] Create todo.md (this file)
- [ ] Initialize React TypeScript project
- [ ] Configure TypeScript (tsconfig.json)
- [ ] Configure ESLint & Prettier
- [ ] Set up folder structure (/src/screens, /components, etc.)
- [ ] Install core dependencies (React Router, Supabase, Firebase)

### **1.2 Environment Configuration**
- [ ] Create .env.development
- [ ] Create .env.production
- [ ] Set up Supabase project
- [ ] Set up Firebase project
- [ ] Configure Vercel project
- [ ] Add all environment variables to Vercel

### **1.3 Base Configuration Files**
- [ ] Create vercel.json
- [ ] Create public/manifest.json (PWA)
- [ ] Create public/robots.txt
- [ ] Create .gitignore
- [ ] Create README.md (project overview)
- [ ] Set up Git repository

---

## 📋 Phase 2: Backend Setup

### **2.1 Supabase Database**
- [ ] Create users table
- [ ] Create cpo_profiles table
- [ ] Create assignments table
- [ ] Create assignment_timeline table
- [ ] Create cpo_qualifications table
- [ ] Create compliance_documents table
- [ ] Create earnings table
- [ ] Create messages table
- [ ] Create incident_reports table
- [ ] Create reviews table
- [ ] Create cpo_availability table
- [ ] Set up Row Level Security (RLS) policies
- [ ] Create database functions & triggers
- [ ] Set up PostGIS for location features
- [ ] Create database indexes
- [ ] Generate TypeScript types from schema

### **2.2 Supabase Storage**
- [ ] Create cpo-profiles bucket
- [ ] Create compliance-documents bucket
- [ ] Create incident-evidence bucket
- [ ] Create message-attachments bucket
- [ ] Configure storage RLS policies
- [ ] Test file upload/download

### **2.3 Firebase Setup**
- [ ] Enable Email/Password authentication
- [ ] Enable Google Sign-In
- [ ] Configure authorized domains
- [ ] Generate VAPID key for push notifications
- [ ] Create firebase-messaging-sw.js (service worker)
- [ ] Set up Cloud Messaging
- [ ] Test push notifications on device

### **2.4 API Services**
- [ ] Create src/services/supabase/client.ts
- [ ] Create src/services/supabase/realtime.ts
- [ ] Create src/services/supabase/storage.ts
- [ ] Create src/services/firebase/config.ts
- [ ] Create src/services/firebase/auth.ts
- [ ] Create src/services/firebase/messaging.ts
- [ ] Create API error handling utilities
- [ ] Write API service tests

---

## 📋 Phase 3: Core Features Implementation

### **3.1 Authentication Flow**
- [ ] Create SplashScreen component
- [ ] Create LoginScreen component
- [ ] Create RegisterScreen component (multi-step)
  - [ ] Step 1: Personal information
  - [ ] Step 2: SIA license verification
  - [ ] Step 3: Qualifications
  - [ ] Step 4: DBS check
  - [ ] Step 5: Professional photo
  - [ ] Step 6: Emergency contacts
  - [ ] Step 7: Bank details (encrypted)
- [ ] Create SIAVerificationScreen
- [ ] Create ForgotPasswordScreen
- [ ] Implement biometric authentication
- [ ] Create AuthContext (React Context)
- [ ] Create useAuth hook
- [ ] Add auth state persistence
- [ ] Add loading states
- [ ] Add error handling

### **3.2 Dashboard (Home Screen)**
- [ ] Create DashboardScreen component
- [ ] Create OperationalToggle component (Ready/Stand Down)
- [ ] Create ActiveAssignmentCard component
- [ ] Create QuickStats component
- [ ] Create ComplianceAlerts component
- [ ] Create TodaySchedule component
- [ ] Implement real-time updates
- [ ] Add pull-to-refresh
- [ ] Add offline indicator

### **3.3 Assignments Management**
- [ ] Create AssignmentsScreen (3 tabs)
- [ ] **Available Assignments Tab:**
  - [ ] AssignmentList component
  - [ ] AssignmentCard component
  - [ ] Filters (distance, pay, type)
  - [ ] Sort options
  - [ ] Map view toggle
  - [ ] Accept/Decline buttons
  - [ ] 30-second auto-decline timer
  - [ ] Real-time assignment updates
- [ ] **Active Assignments Tab:**
  - [ ] ActiveAssignmentDetails component
  - [ ] Navigation integration
  - [ ] Contact buttons (Principal/Dispatch)
  - [ ] Incident report button
  - [ ] SOS button (always visible)
  - [ ] Timeline component
  - [ ] Check-in/Check-out with geofencing
- [ ] **Assignment History Tab:**
  - [ ] HistoryList component
  - [ ] Filter by date/type
  - [ ] Export to PDF/CSV
  - [ ] View assignment details
  - [ ] Ratings display
- [ ] Create AssignmentContext
- [ ] Create useAssignments hook
- [ ] Implement assignment acceptance flow
- [ ] Implement assignment completion flow

### **3.4 CPO Profile**
- [ ] Create ProfileScreen component
- [ ] Create PersonalInfo section
- [ ] Create SIALicense section
- [ ] Create Qualifications section
- [ ] Create SkillsMatrix component
- [ ] Create ProfessionalDetails section
- [ ] Create AvailabilityCalendar component
- [ ] Create EmergencyContacts section
- [ ] Create PaymentInfo section (encrypted)
- [ ] Implement photo upload
- [ ] Implement document upload
- [ ] Add form validation
- [ ] Create useProfile hook

### **3.5 Compliance Center**
- [ ] Create ComplianceScreen component
- [ ] Create ComplianceScore dashboard
- [ ] Create SIALicense component
- [ ] Create DBSCheck component
- [ ] Create Insurance component
- [ ] Create TrainingModules component
- [ ] Implement document upload
- [ ] Implement expiry reminders (90/60/30/7 days)
- [ ] Create compliance scoring algorithm
- [ ] Add renewal tracking
- [ ] Create useCompliance hook

### **3.6 Earnings & Payments**
- [ ] Create EarningsScreen component
- [ ] Create EarningsSummary dashboard
- [ ] Create PaymentHistory list
- [ ] Create Invoices component
- [ ] Create BankDetails component (encrypted)
- [ ] Implement daily/weekly/monthly views
- [ ] Create earnings chart (visualization)
- [ ] Implement invoice generation (PDF)
- [ ] Add export to CSV
- [ ] Integrate Stripe Connect
- [ ] Create useEarnings hook

### **3.7 Schedule & Availability**
- [ ] Create ScheduleScreen component
- [ ] Create Calendar component
- [ ] Create AvailabilitySettings component
- [ ] Implement weekly availability
- [ ] Implement date blocking
- [ ] Add preferred assignment types
- [ ] Add coverage areas (postal codes)
- [ ] Create useSchedule hook

### **3.8 Communication Hub**
- [ ] Create MessagesScreen component
- [ ] Create ConversationList component
- [ ] Create ChatThread component
- [ ] Implement assignment-specific messaging
- [ ] Add dispatch communication
- [ ] Add principal messaging (secure)
- [ ] Implement voice notes
- [ ] Implement photo sharing
- [ ] Add read receipts
- [ ] Implement push notifications for messages
- [ ] Add message encryption
- [ ] Create useMessages hook

### **3.9 Navigation & GPS**
- [ ] Create NavigationScreen component
- [ ] Create RouteMap component
- [ ] Create TurnByTurn component
- [ ] Integrate Google Maps / Apple Maps
- [ ] Implement background location tracking
- [ ] Add geofencing for auto check-in
- [ ] Add route optimization
- [ ] Add traffic updates
- [ ] Add ETA calculation
- [ ] Create useGeolocation hook
- [ ] Create useNavigation hook

### **3.10 Settings**
- [ ] Create SettingsScreen component
- [ ] Create AccountSettings section
- [ ] Create OperationalSettings section
- [ ] Create NotificationSettings section
- [ ] Create AppPreferences section
- [ ] Create PrivacySecurity section
- [ ] Create Support section
- [ ] Implement biometric lock
- [ ] Add language selection
- [ ] Add dark/light mode toggle
- [ ] Create useSettings hook

---

## 📋 Phase 4: Advanced Features

### **4.1 Incident Reporting**
- [ ] Create IncidentReportScreen component
- [ ] Implement photo capture
- [ ] Implement video recording
- [ ] Implement voice notes
- [ ] Add GPS auto-tagging
- [ ] Add witness information
- [ ] Add actions taken section
- [ ] Add police notification option
- [ ] Implement chain of custody
- [ ] Generate incident PDF report
- [ ] Create useIncidentReport hook

### **4.2 Daily Occurrence Book (DOB)**
- [ ] Create DOB component
- [ ] Auto-log timeline events
- [ ] Allow manual entries
- [ ] Link to incident reports
- [ ] Add GPS per entry
- [ ] Implement digital signature
- [ ] Export DOB to PDF
- [ ] Make entries immutable

### **4.3 Real-time Features**
- [ ] Implement WebSocket connections
- [ ] Real-time assignment dispatch
- [ ] Real-time location sharing
- [ ] Real-time messaging
- [ ] Real-time status updates
- [ ] Handle reconnection logic
- [ ] Implement offline queue
- [ ] Create useRealtime hook

### **4.4 Emergency Features**
- [ ] Create SOS button (floating, always visible)
- [ ] Implement duress code
- [ ] Add silent alarm
- [ ] Implement emergency contacts cascade
- [ ] Add automatic police contact (opt-in)
- [ ] Implement location streaming during SOS
- [ ] Add incident auto-recording
- [ ] Create useEmergency hook

### **4.5 Performance Optimization**
- [ ] Implement lazy loading for screens
- [ ] Add React.memo to expensive components
- [ ] Implement virtual scrolling (react-window)
- [ ] Optimize images (WebP, compression)
- [ ] Add code splitting
- [ ] Implement service worker caching
- [ ] Add offline support
- [ ] Minimize bundle size
- [ ] Achieve 60fps animations

---

## 📋 Phase 5: UI/UX & Design

### **5.1 Design System**
- [ ] Create design tokens (colors, spacing, typography)
- [ ] Match Armora client app design (Navy + Gold)
- [ ] Create global styles
- [ ] Implement 8px grid system
- [ ] Create theme.css with CSS variables
- [ ] Create component library
- [ ] Add touch-friendly interactions (44px min)
- [ ] Implement dark mode

### **5.2 Common Components**
- [ ] Button component
- [ ] Input component
- [ ] Card component
- [ ] Modal component
- [ ] Toast/Snackbar component
- [ ] LoadingSpinner component
- [ ] ErrorBoundary component
- [ ] BottomNavigation component
- [ ] Header component
- [ ] Badge component
- [ ] StatusIndicator component
- [ ] ProgressBar component

### **5.3 Mobile Optimization**
- [ ] Test on 320px width (minimum)
- [ ] Test on various screen sizes
- [ ] Optimize for 3G networks
- [ ] Prevent text zoom (font-size ≥ 16px)
- [ ] Add swipe gestures
- [ ] Implement pull-to-refresh
- [ ] Add haptic feedback (vibration)
- [ ] Optimize battery usage

### **5.4 Accessibility**
- [ ] Semantic HTML throughout
- [ ] ARIA labels and roles
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Color contrast 4.5:1+ (WCAG AA)
- [ ] Focus indicators visible
- [ ] Skip navigation links
- [ ] Error messages descriptive
- [ ] Test with screen reader

---

## 📋 Phase 6: Testing

### **6.1 Unit Tests**
- [ ] Test authentication service
- [ ] Test API services
- [ ] Test custom hooks
- [ ] Test utility functions
- [ ] Test form validation
- [ ] Achieve >80% code coverage

### **6.2 Component Tests**
- [ ] Test AssignmentCard
- [ ] Test LoginScreen
- [ ] Test DashboardScreen
- [ ] Test all critical components
- [ ] Test error states
- [ ] Test loading states

### **6.3 Integration Tests**
- [ ] Test authentication flow
- [ ] Test assignment acceptance flow
- [ ] Test messaging flow
- [ ] Test incident reporting
- [ ] Test payment flow

### **6.4 E2E Tests (Playwright)**
- [ ] Test complete user journey
- [ ] Test CPO registration
- [ ] Test assignment lifecycle
- [ ] Test offline functionality
- [ ] Test push notifications
- [ ] Test on real devices (iOS/Android)

### **6.5 Performance Testing**
- [ ] Run Lighthouse audit (target: >90)
- [ ] Measure Core Web Vitals
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1
- [ ] Test on slow 3G
- [ ] Analyze bundle size
- [ ] Profile React performance

---

## 📋 Phase 7: PWA & Offline Support

### **7.1 PWA Configuration**
- [ ] Create manifest.json
- [ ] Generate app icons (all sizes)
- [ ] Create splash screens
- [ ] Implement service worker
- [ ] Configure cache strategies
- [ ] Test install prompts
- [ ] Test offline functionality
- [ ] Add background sync

### **7.2 Service Worker**
- [ ] Cache static assets
- [ ] Cache API responses
- [ ] Implement offline fallback
- [ ] Add background sync for messages
- [ ] Queue offline actions
- [ ] Handle push notifications
- [ ] Implement update strategy

---

## 📋 Phase 8: Deployment & DevOps

### **8.1 Vercel Deployment**
- [ ] Set up Vercel project
- [ ] Configure build settings
- [ ] Add environment variables
- [ ] Set up custom domain (cpo.armora.app)
- [ ] Configure SSL certificate
- [ ] Enable Vercel Analytics
- [ ] Enable Speed Insights

### **8.2 CI/CD Pipeline**
- [ ] Set up GitHub Actions
- [ ] Auto-run tests on PR
- [ ] Auto-deploy to preview (develop branch)
- [ ] Auto-deploy to production (main branch)
- [ ] Add deployment notifications

### **8.3 Monitoring & Analytics**
- [ ] Set up error tracking (Sentry)
- [ ] Set up performance monitoring
- [ ] Set up Firebase Analytics
- [ ] Track key user events
- [ ] Monitor API usage
- [ ] Set up alerting

---

## 📋 Phase 9: Documentation

### **9.1 Code Documentation**
- [ ] Add JSDoc comments to functions
- [ ] Document complex logic
- [ ] Create API documentation
- [ ] Document database schema
- [ ] Create component storybook

### **9.2 User Documentation**
- [ ] Create CPO user guide
- [ ] Create video tutorials
- [ ] Create FAQ section
- [ ] Create troubleshooting guide
- [ ] Create onboarding flow

### **9.3 Developer Documentation**
- [ ] Update README.md
- [ ] Create SETUP.md
- [ ] Create CONTRIBUTING.md
- [ ] Create API.md
- [ ] Create DEPLOYMENT.md
- [ ] Create SECURITY.md

---

## 📋 Phase 10: Launch Preparation

### **10.1 Pre-Launch Checklist**
- [ ] All features implemented and tested
- [ ] No critical bugs
- [ ] Performance targets met
- [ ] Security audit passed
- [ ] Accessibility audit passed
- [ ] Legal compliance verified (GDPR, SIA)
- [ ] Privacy policy created
- [ ] Terms & conditions created
- [ ] Beta testing complete
- [ ] User feedback incorporated

### **10.2 App Store Preparation (Future)**
- [ ] Set up Capacitor for native builds
- [ ] Create iOS app
- [ ] Create Android app
- [ ] Prepare app store listings
- [ ] Create screenshots
- [ ] Write app descriptions
- [ ] Submit for review

### **10.3 Marketing & Launch**
- [ ] Create landing page
- [ ] Prepare social media content
- [ ] Create demo video
- [ ] Reach out to CPO community
- [ ] Partner with security companies
- [ ] Launch announcement

---

## 📋 Phase 11: Post-Launch

### **11.1 Maintenance**
- [ ] Monitor error logs
- [ ] Monitor performance metrics
- [ ] Monitor user feedback
- [ ] Fix bugs as reported
- [ ] Update dependencies regularly
- [ ] Security patches

### **11.2 Feature Enhancements**
- [ ] Multi-officer coordination
- [ ] Threat assessment module
- [ ] Advance Security Reconnaissance (ASR)
- [ ] Training & CPD tracking
- [ ] Compliance score gamification
- [ ] Principal preferences profiles
- [ ] Vehicle & equipment checks
- [ ] Secure document vault

### **11.3 Integrations**
- [ ] Integration with SIA database
- [ ] Integration with police systems
- [ ] Integration with security companies
- [ ] Integration with training providers
- [ ] Integration with insurance providers

---

## 🎯 Success Metrics

### **Technical Metrics**
- [ ] Lighthouse score >90 (all categories)
- [ ] Core Web Vitals pass
- [ ] <3s load time on 3G
- [ ] <200KB initial bundle (gzipped)
- [ ] >80% test coverage
- [ ] 0 critical security vulnerabilities

### **User Metrics** (Post-Launch)
- [ ] 1000+ active CPOs
- [ ] 90%+ assignment acceptance rate
- [ ] <5% incident report rate
- [ ] 4.5+ star average rating
- [ ] <1% SOS false alarms
- [ ] 95%+ compliance rate

---

## 🚀 Current Status

**Phase:** 1 - Project Setup & Foundation
**Completion:** 50% (documentation complete, code setup pending)

**Next Steps:**
1. Initialize React TypeScript project
2. Set up folder structure
3. Configure TypeScript & ESLint
4. Create Supabase project and database
5. Create Firebase project
6. Start building authentication flow

---

## 📝 Notes

- **Priority:** Security and compliance features
- **Focus:** Mobile-first, 320px baseline
- **Testing:** Real devices required for GPS, notifications
- **SIA Terminology:** Always use correct security industry terms
- **Performance:** 60fps animations, <3s load time
- **Accessibility:** WCAG 2.1 AA compliance mandatory

---

**Last Updated:** 2025-10-01
**Maintained by:** Development Team

Keep this todo list updated as tasks are completed! ✅
