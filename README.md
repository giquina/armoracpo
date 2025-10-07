# Armora CPO

**Close Protection Officer Operations App**

A professional web application designed for SIA-licensed Close Protection Officers (CPOs) to manage their security assignments, compliance, and operations within the Armora protection services ecosystem.

> **Note:** This is NOT a taxi or rideshare application. This is a professional security operations platform for qualified CPOs providing close protection services.

---

## Overview

Armora CPO is a Progressive Web App (PWA) that enables Close Protection Officers to:

- View and manage protection assignments
- Track real-time GPS locations during active duties
- Maintain SIA license compliance and documentation
- Monitor earnings and payment history
- Submit incident reports and maintain Daily Occurrence Book (DOB)
- Receive real-time push notifications for assignment updates
- Manage professional profiles and qualifications

Built specifically for the UK security industry, this application follows SIA (Security Industry Authority) compliance standards and professional terminology.

---

## Features

### Assignment Management
- View available protection assignments in real-time
- Accept or decline assignment requests
- Track active assignment status and duration
- Access assignment history and completed jobs
- GPS navigation to assignment locations

### Compliance & Documentation
- SIA license tracking with expiration alerts
- Digital Daily Occurrence Book (DOB)
- Incident reporting with photo/video evidence
- Compliance document storage and management
- Professional qualification tracking

### Earnings & Payments
- Real-time earnings dashboard
- Payment history and transaction tracking
- Invoice generation and export (PDF)
- Earnings analytics and reporting

### Communication
- Secure messaging with principals
- Assignment-specific communication threads
- Push notifications for critical updates
- Emergency contact management

### Professional Profile
- CPO profile management
- Specialization and skill tracking
- Performance metrics and ratings
- Availability scheduling

---

## Tech Stack

### Frontend
- **React** 19.2.0 - Modern UI framework
- **TypeScript** 5.7.2 - Type-safe development
- **React Router** 7.9.3 - Client-side routing
- **Zustand** 5.0.8 - State management
- **Framer Motion** 12.23.22 - Animations and transitions

### Backend & Services
- **Supabase** 2.58.0 - PostgreSQL database, authentication, real-time subscriptions
- **Firebase** 12.3.0 - Push notifications via Cloud Messaging (FCM)
- **Stripe** - Payment processing (8.0.0 with React integration)

### Maps & Location
- **Leaflet** 1.9.4 - Interactive maps
- **React Leaflet** 5.0.0 - React integration for maps

### Data Visualization
- **Chart.js** 4.5.0 - Analytics and charts
- **React ChartJS 2** 5.3.0 - React wrapper

### Forms & UI
- **React Hook Form** 7.63.0 - Form validation and management
- **React Icons** 5.5.0 - Icon library
- **React Dropzone** 14.3.8 - File upload handling
- **React Image Crop** 11.0.10 - Image manipulation

### Development & Testing
- **Playwright** 1.48.2 - End-to-end testing
- **Testing Library** - Unit and integration testing
- **TypeScript ESLint** - Code quality

### Deployment
- **Vercel** 48.2.2 - Production hosting with automatic deployments
- **PWA** - Progressive Web App capabilities for mobile installation

---

## Getting Started

### Prerequisites

- **Node.js** 16.x or higher
- **npm** or **yarn** package manager
- Git for version control

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/giquina/armoracpo.git
   cd armoracpo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see [Environment Setup](#environment-setup))

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

---

## Available Scripts

### Development
```bash
npm start
```
Runs the app in development mode on [http://localhost:3000](http://localhost:3000).
The page will reload when you make changes. You may also see lint errors in the console.

### Production Build
```bash
npm run build
```
Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

### Testing
```bash
npm test
```
Launches the test runner in interactive watch mode.

```bash
npm run test:e2e
```
Runs end-to-end tests using Playwright.

---

## Environment Setup

### Required Environment Variables

Create a `.env` file in the root directory (or configure in Vercel Dashboard for production):

```bash
# Supabase Configuration
# Get from: Supabase Dashboard → Settings → API
REACT_APP_SUPABASE_URL=https://jmzvrqwjmlnvxojculee.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Firebase Configuration
# Get from: Firebase Console → Project Settings → General
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=armora-protection.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=armora-protection
REACT_APP_FIREBASE_STORAGE_BUCKET=armora-protection.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=785567849849
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id_here

# Firebase Cloud Messaging - VAPID Key
# Get from: Firebase Console → Cloud Messaging → Web Push certificates
REACT_APP_FIREBASE_VAPID_KEY=your_firebase_vapid_key_here
```

### Getting Credentials

1. **Supabase:**
   - Dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Navigate to: Settings → API
   - Copy the `anon/public` key

2. **Firebase:**
   - Console: [https://console.firebase.google.com](https://console.firebase.google.com)
   - Select project: `armora-protection`
   - Navigate to: Project Settings → General → Your apps
   - Copy the web app configuration

3. **VAPID Key (Push Notifications):**
   - Firebase Console → Project Settings → Cloud Messaging
   - Web Push certificates section
   - Generate or copy existing key pair

### Security Notes

- **NEVER** commit `.env` files to version control (already in `.gitignore`)
- Use `.env.example` as a template for required variables
- For production, set environment variables in Vercel Dashboard
- Rotate credentials immediately if exposed

---

## Project Structure

```
armoracpo/
├── public/              # Static assets and PWA manifest
├── src/
│   ├── components/      # Reusable React components
│   │   ├── common/      # Shared UI components
│   │   ├── dev/         # Development tools (DevPanel)
│   │   └── ...          # Feature-specific components
│   ├── contexts/        # React Context providers
│   │   └── AuthContext.tsx
│   ├── screens/         # Page-level components
│   │   ├── Auth/        # Login, Signup
│   │   ├── Dashboard/   # Main dashboard
│   │   ├── Jobs/        # Assignment management
│   │   ├── Incidents/   # Incident reporting
│   │   ├── DOB/         # Daily Occurrence Book
│   │   ├── Earnings/    # Payment & earnings
│   │   ├── Profile/     # CPO profile
│   │   ├── Settings/    # App settings
│   │   └── ...          # Other screens
│   ├── services/        # API and service integrations
│   │   ├── auth.service.ts      # Authentication
│   │   ├── supabase.ts          # Supabase client
│   │   ├── firebase.service.ts  # Firebase/FCM
│   │   └── ...
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── styles/          # Global styles
│   ├── App.tsx          # Main application component
│   └── index.tsx        # Application entry point
├── supabase/            # Database migrations and schemas
│   └── migrations/      # SQL migration files
├── docs/                # Comprehensive documentation
├── .env.example         # Environment variable template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── vercel.json          # Vercel deployment config
```

---

## Deployment

### Production Deployment

The application is deployed on **Vercel** with automatic deployments from the `main` branch.

**Production URL:** [https://armoracpo.vercel.app](https://armoracpo.vercel.app)

### Deployment Steps

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **Automatic Deployment:**
   - Vercel automatically detects the push
   - Builds and deploys the application
   - Typically completes in 2-3 minutes

3. **Manual Deployment (if needed):**
   ```bash
   npx vercel --prod
   ```

### Environment Variables (Production)

Set environment variables in **Vercel Dashboard:**

1. Go to: [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project: `armoracpo`
3. Navigate to: Settings → Environment Variables
4. Add all variables from `.env.example` with production values

### PWA Installation

The app is installable as a Progressive Web App:

1. Visit the production URL on a mobile device
2. Tap the browser menu
3. Select "Add to Home Screen" or "Install App"
4. Launch from home screen like a native app

---

## Documentation

### Developer Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Complete development guide for Claude Code users
- **[docs/00-START-HERE.md](./docs/00-START-HERE.md)** - Master index and quick start
- **[docs/PROJECT-STATUS.md](./docs/PROJECT-STATUS.md)** - Current project status and roadmap
- **[docs/claude.md](./docs/claude.md)** - Comprehensive build instructions
- **[docs/supabase.md](./docs/supabase.md)** - Database schema and Supabase integration
- **[docs/firebase.md](./docs/firebase.md)** - Firebase setup and push notifications
- **[docs/vercel.md](./docs/vercel.md)** - Deployment configuration
- **[docs/react.md](./docs/react.md)** - React best practices and patterns

### Technical Guides

- **[docs/RLS_DEPLOYMENT.md](./docs/RLS_DEPLOYMENT.md)** - Row-level security deployment
- **[docs/INFRASTRUCTURE-FINDINGS.md](./docs/INFRASTRUCTURE-FINDINGS.md)** - Infrastructure analysis
- **[docs/cli-reference.md](./docs/cli-reference.md)** - Command-line reference

### Planning & Tasks

- **[docs/todo.md](./docs/todo.md)** - Development task list (300+ tasks)
- **[docs/suggestions.md](./docs/suggestions.md)** - SIA compliance and feature suggestions

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────┐
│         ARMORA ECOSYSTEM                │
├─────────────────────────────────────────┤
│                                          │
│  ┌──────────────┐   ┌──────────────┐   │
│  │ Client App   │   │   CPO App    │   │
│  │ (Principals) │   │  (Officers)  │   │
│  └──────┬───────┘   └──────┬───────┘   │
│         │                   │           │
│         └─────────┬─────────┘           │
│                   │                     │
│         ┌─────────▼─────────┐          │
│         │  SHARED BACKEND   │          │
│         ├───────────────────┤          │
│         │  Supabase         │          │
│         │  (PostgreSQL)     │          │
│         │  + Real-time      │          │
│         │                   │          │
│         │  Firebase         │          │
│         │  (FCM)            │          │
│         │                   │          │
│         │  Stripe           │          │
│         │  (Payments)       │          │
│         └───────────────────┘          │
└─────────────────────────────────────────┘
```

### Security

- **Row-Level Security (RLS)** enforced on all database tables
- CPOs can only access their own data and assigned jobs
- Secure authentication via Supabase Auth
- HTTPS enforced for all connections
- Content Security Policy (CSP) headers configured
- Environment variables for sensitive credentials

---

## Browser Support

### Production
- \>0.2% market share
- Not dead browsers
- Not Opera Mini

### Development
- Latest Chrome
- Latest Firefox
- Latest Safari

### PWA Support
- Chrome/Edge (Android, Desktop)
- Safari (iOS, macOS)
- Firefox (limited PWA features)

---

## Contributing

This project follows professional security industry standards:

1. **SIA Compliance:** All features must comply with UK Security Industry Authority regulations
2. **Professional Terminology:** Use CPO-specific language (assignments, not "gigs"; principals, not "customers")
3. **TypeScript:** All code must be type-safe
4. **Testing:** Include tests for new features
5. **Documentation:** Update relevant docs with changes

---

## License

MIT License

Copyright (c) 2021 Supabase, Inc. and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Support & Resources

### Key URLs
- **Production App:** [https://armoracpo.vercel.app](https://armoracpo.vercel.app)
- **Supabase Dashboard:** [https://supabase.com/dashboard](https://supabase.com/dashboard)
- **Firebase Console:** [https://console.firebase.google.com/project/armora-protection](https://console.firebase.google.com/project/armora-protection)
- **Vercel Dashboard:** [https://vercel.com/dashboard](https://vercel.com/dashboard)

### Industry Standards
- **SIA (Security Industry Authority):** [https://www.sia.homeoffice.gov.uk](https://www.sia.homeoffice.gov.uk)
- UK close protection industry regulations and compliance

---

## Project Status

**Current Phase:** Production Deployment & Feature Enhancement
**Version:** 0.1.0
**Last Updated:** October 2025

### Recent Updates
- DevPanel navigation added to all screens for rapid development
- Professional UI overhaul (Splash, Welcome, Login screens)
- Firebase Cloud Messaging activated
- Authentication system enhanced
- Production deployment on Vercel active

### Upcoming Features
- Enhanced GPS tracking with route history
- Advanced analytics dashboard
- Multi-language support
- Offline mode capabilities
- Enhanced compliance reporting

---

**Built with professionalism for professional Close Protection Officers.**
