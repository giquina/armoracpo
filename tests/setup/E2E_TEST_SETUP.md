# E2E Test Setup Guide - ArmoraCPO

> **Version:** 1.0.0
> **Last Updated:** 2025-10-08
> **Framework:** Playwright 1.56.0

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation & Setup](#installation--setup)
4. [Test Data Configuration](#test-data-configuration)
5. [Running Tests](#running-tests)
6. [Writing New Tests](#writing-new-tests)
7. [Debugging Tests](#debugging-tests)
8. [CI/CD Integration](#cicd-integration)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Overview

This guide covers end-to-end (E2E) testing for ArmoraCPO using Playwright. E2E tests simulate real user interactions across the entire application stack, ensuring critical user journeys work correctly.

### What We Test

- **Authentication flows** (login, signup, logout, password reset)
- **Job management** (browse, accept, start, complete assignments)
- **Messaging system** (send/receive messages, real-time updates)
- **Incident reporting** (create, submit, export reports)
- **GPS location tracking** (enable, track, view history)
- **Offline functionality** (service worker, data sync)
- **Cross-browser compatibility** (Chromium, Firefox, WebKit)

### Test Structure

```
tests/
├── e2e/
│   ├── auth.spec.ts              # Authentication tests
│   ├── jobs.spec.ts              # Job management tests
│   ├── messaging.spec.ts         # Messaging tests
│   ├── incidents.spec.ts         # Incident reporting tests
│   ├── location.spec.ts          # GPS tracking tests
│   ├── offline.spec.ts           # Offline mode tests
│   ├── fixtures/
│   │   └── test-data.ts          # Test data constants
│   └── helpers/
│       ├── auth-helper.ts        # Authentication utilities
│       ├── job-helper.ts         # Job management utilities
│       └── db-helper.ts          # Database utilities
├── setup/
│   ├── test-data-seed.sql        # Database seed script
│   └── E2E_TEST_SETUP.md         # This file
├── smoke.spec.ts                 # Quick smoke tests
└── playwright.config.ts          # Playwright configuration
```

---

## Prerequisites

### Required Software

1. **Node.js** (v18 or later)
   ```bash
   node --version  # Should be v18+
   ```

2. **npm** (v9 or later)
   ```bash
   npm --version  # Should be v9+
   ```

3. **Git** (for version control)
   ```bash
   git --version
   ```

### Required Access

- [ ] Supabase test/staging database access
- [ ] Firebase test project (for FCM notifications)
- [ ] Supabase project URL and anon key
- [ ] Test user credentials (see test-data-seed.sql)

### Environment Setup

1. **Test Environment Variables**

   Create a `.env.test` file (or use `.env` for local testing):

   ```bash
   # Supabase Test Environment
   REACT_APP_SUPABASE_URL=https://your-test-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your_test_anon_key

   # Firebase Test Project
   REACT_APP_FIREBASE_API_KEY=your_test_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-test-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-test-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-test-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_VAPID_KEY=your_vapid_key

   # Sentry (optional for testing, can use dummy value)
   REACT_APP_SENTRY_DSN=https://dummy@sentry.io/12345
   REACT_APP_SENTRY_ENVIRONMENT=test

   # Test Base URL (defaults to localhost:3000)
   BASE_URL=http://localhost:3000
   ```

2. **Playwright Environment Variables**

   Playwright also supports a `.env` file in the root directory. It will automatically load these variables.

---

## Installation & Setup

### Step 1: Install Dependencies

```bash
# Install all project dependencies (including Playwright)
npm install

# Install Playwright browsers (Chromium, Firefox, WebKit)
npx playwright install

# Optional: Install only Chromium (faster for development)
npx playwright install chromium
```

### Step 2: Verify Playwright Installation

```bash
# Check Playwright version
npx playwright --version

# List installed browsers
npx playwright list
```

Expected output:
```
Version 1.56.0

chromium 130.0.6723.19
firefox 131.0
webkit 18.0
```

### Step 3: Setup Test Database

**Option A: Using Supabase Dashboard**

1. Login to your test Supabase project
2. Navigate to SQL Editor
3. Copy contents of `tests/setup/test-data-seed.sql`
4. Execute the script
5. Verify data in Table Editor

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your test project
supabase link --project-ref your-test-project-ref

# Run seed script
supabase db reset  # WARNING: Resets entire database
# OR
psql $DATABASE_URL -f tests/setup/test-data-seed.sql
```

### Step 4: Create Test User Accounts

Since Supabase Auth users must be created via the Auth API or Dashboard, create these test accounts manually:

**Via Supabase Dashboard:**

1. Navigate to Authentication → Users
2. Click "Add User" for each test account:

   **CPO Test Accounts:**
   - Email: `john.smith@armoracpo.test`
     - Password: `TestPassword123!`
     - Confirm email immediately (toggle in dashboard)

   - Email: `sarah.johnson@armoracpo.test`
     - Password: `TestPassword123!`
     - Confirm email immediately

   - Email: `david.williams@armoracpo.test`
     - Password: `TestPassword123!`
     - Leave email unconfirmed (for testing unverified state)

   **Principal Test Accounts:**
   - Email: `robert.davies@client.test`
     - Password: `ClientPassword123!`

   - Email: `amanda.taylor@client.test`
     - Password: `ClientPassword123!`

3. After creating auth users, update the seed script with actual `user_id` values:
   - Copy User ID from Supabase Auth dashboard
   - Update corresponding `user_id` fields in `test-data-seed.sql`
   - Re-run seed script

**Via Supabase API (Automated):**

Create a setup script `tests/setup/create-test-users.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Need service role key
);

async function createTestUsers() {
  const users = [
    { email: 'john.smith@armoracpo.test', password: 'TestPassword123!' },
    { email: 'sarah.johnson@armoracpo.test', password: 'TestPassword123!' },
    // ... add all test users
  ];

  for (const user of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true
    });

    if (error) {
      console.error(`Error creating ${user.email}:`, error);
    } else {
      console.log(`Created ${user.email} with ID: ${data.user.id}`);
    }
  }
}

createTestUsers();
```

Run with:
```bash
npx ts-node tests/setup/create-test-users.ts
```

### Step 5: Verify Test Setup

Run a quick smoke test to verify everything is working:

```bash
npm run test:e2e -- smoke.spec.ts
```

If successful, you should see:
```
✓ tests/smoke.spec.ts:3:1 › should load the landing page (XXXms)
```

---

## Test Data Configuration

### Test Users

The following test users are created by the seed script:

| User | Email | Password | Role | Status |
|------|-------|----------|------|--------|
| John Smith | john.smith@armoracpo.test | TestPassword123! | CPO | Verified |
| Sarah Johnson | sarah.johnson@armoracpo.test | TestPassword123! | CPO | Verified |
| David Williams | david.williams@armoracpo.test | TestPassword123! | CPO | Pending |
| Michael Brown | michael.brown@armoracpo.test | TestPassword123! | CPO | Rejected |
| Robert Davies | robert.davies@client.test | ClientPassword123! | Principal | Active |
| Amanda Taylor | amanda.taylor@client.test | ClientPassword123! | Principal | Active |

### Test Assignments

7 test assignments in various states:

| ID | Title | Status | CPO | Principal |
|----|-------|--------|-----|-----------|
| a1111111... | Airport Transfer - VIP | pending | - | Robert |
| a2222222... | Museum Visit | assigned | John | Robert |
| a3333333... | Conference Security | en_route | Sarah | Amanda |
| a4444444... | Executive Day Protection | active | John | Robert |
| a5555555... | Airport Pickup | completed | Sarah | Amanda |
| a6666666... | Residential Security | cancelled | John | Robert |
| a7777777... | Political Figure Protection | pending | - | Amanda |

### Test Messages, Incidents, DOB Entries

See `test-data-seed.sql` for comprehensive test data including:
- 7 test messages across different assignments
- 3 incident reports (submitted, draft)
- 9 DOB entries (auto-logged and manual)
- 8 GPS location history records
- 2 payment records

---

## Running Tests

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- auth.spec.ts

# Run tests matching pattern
npm run test:e2e -- --grep "login"

# Run tests in headed mode (see browser)
npm run test:e2e -- --headed

# Run tests in UI mode (interactive debugging)
npm run test:e2e -- --ui

# Run tests in specific browser
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit
```

### Advanced Options

```bash
# Run with debug mode
npm run test:e2e -- --debug

# Run with trace enabled (for debugging failures)
npm run test:e2e -- --trace on

# Run tests in parallel (faster)
npm run test:e2e -- --workers=4

# Run tests with retries (for flaky tests)
npm run test:e2e -- --retries=2

# Generate HTML report
npm run test:e2e -- --reporter=html

# Run specific test by line number
npm run test:e2e -- auth.spec.ts:33
```

### Environment-Specific Testing

```bash
# Test against staging environment
BASE_URL=https://staging.armoracpo.com npm run test:e2e

# Test against production (read-only tests only!)
BASE_URL=https://armoracpo.com npm run test:e2e -- --grep "@readonly"

# Test with specific viewport size
npm run test:e2e -- --config viewport.width=375 --config viewport.height=667
```

---

## Writing New Tests

### Test File Template

Create a new test file in `tests/e2e/`:

```typescript
import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth-helper';
import { TEST_USERS } from './fixtures/test-data';

test.describe('Feature Name', () => {
  let auth: AuthHelper;

  test.beforeEach(async ({ page }) => {
    auth = new AuthHelper(page);
    await auth.goto();
  });

  test('should perform expected action', async ({ page }) => {
    // Arrange
    await auth.loginAsCPO();

    // Act
    await page.click('button:has-text("Action")');

    // Assert
    await expect(page.getByText('Expected Result')).toBeVisible();
  });

  test('should handle error case', async ({ page }) => {
    // Test error scenarios
  });
});
```

### Using Test Helpers

**Authentication Helper:**

```typescript
import { AuthHelper } from './helpers/auth-helper';

test('example', async ({ page }) => {
  const auth = new AuthHelper(page);

  await auth.goto(); // Navigate to landing page
  await auth.loginAsCPO(); // Login as test CPO
  await auth.loginAsAdmin(); // Login as test admin
  await auth.logout(); // Logout

  const isLoggedIn = await auth.isLoggedIn(); // Check login status
});
```

**Custom Helper Example:**

Create `tests/e2e/helpers/job-helper.ts`:

```typescript
import { Page, expect } from '@playwright/test';

export class JobHelper {
  constructor(private page: Page) {}

  async navigateToJobs() {
    await this.page.click('nav a:has-text("Jobs")');
    await this.page.waitForURL('**/jobs');
  }

  async acceptJob(jobTitle: string) {
    await this.page.click(`text=${jobTitle}`);
    await this.page.click('button:has-text("Accept Job")');
    await this.page.click('button:has-text("Confirm")');
    await expect(this.page.getByText('Job accepted')).toBeVisible();
  }

  async startAssignment(assignmentId: string) {
    await this.page.goto(`/assignments/${assignmentId}`);
    await this.page.click('button:has-text("Start Journey")');
    await expect(this.page.getByText('En Route')).toBeVisible();
  }
}
```

### Test Data Fixtures

Add test data to `tests/e2e/fixtures/test-data.ts`:

```typescript
export const TEST_ASSIGNMENTS = {
  pending: {
    id: 'a1111111-1111-1111-1111-111111111111',
    title: 'Airport Transfer - VIP Protection',
  },
  active: {
    id: 'a4444444-4444-4444-4444-444444444444',
    title: 'Executive Day Protection',
  },
};

export const TEST_LOCATIONS = {
  london: {
    lat: 51.5074,
    lng: -0.1278,
    address: 'London, UK',
  },
};
```

### Page Object Model (POM)

For complex pages, use the Page Object Model:

Create `tests/e2e/pages/jobs-page.ts`:

```typescript
import { Page, Locator } from '@playwright/test';

export class JobsPage {
  readonly page: Page;
  readonly jobsGrid: Locator;
  readonly filterButton: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.jobsGrid = page.locator('[data-testid="jobs-grid"]');
    this.filterButton = page.locator('button:has-text("Filter")');
    this.sortDropdown = page.locator('select[name="sort"]');
  }

  async goto() {
    await this.page.goto('/jobs');
  }

  async filterByType(type: string) {
    await this.filterButton.click();
    await this.page.click(`text=${type}`);
    await this.page.click('button:has-text("Apply")');
  }

  async getJobCount(): Promise<number> {
    return await this.jobsGrid.locator('.job-card').count();
  }
}
```

Use in tests:

```typescript
import { JobsPage } from './pages/jobs-page';

test('should filter jobs', async ({ page }) => {
  const jobsPage = new JobsPage(page);
  await jobsPage.goto();
  await jobsPage.filterByType('Executive Protection');

  const count = await jobsPage.getJobCount();
  expect(count).toBeGreaterThan(0);
});
```

---

## Debugging Tests

### Playwright Inspector

The best tool for debugging failing tests:

```bash
# Run test with inspector
npm run test:e2e -- --debug

# Run specific test with inspector
npm run test:e2e -- auth.spec.ts:33 --debug
```

Inspector features:
- Step through test execution
- Pause and resume
- Inspect DOM at each step
- See network requests
- View console logs

### Trace Viewer

For post-mortem debugging:

```bash
# Run with trace enabled
npm run test:e2e -- --trace on

# View trace after test failure
npx playwright show-trace trace.zip
```

Trace viewer shows:
- Screenshot at each step
- DOM snapshot
- Network activity
- Console logs
- Test source

### Screenshots & Videos

Capture screenshots and videos for failed tests:

Update `playwright.config.ts`:

```typescript
export default defineConfig({
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

Screenshots saved to: `test-results/`

### Console Logs

Capture console output during tests:

```typescript
test('debug test', async ({ page }) => {
  page.on('console', msg => {
    console.log('Browser console:', msg.text());
  });

  // Your test code
});
```

### Network Debugging

Monitor network requests:

```typescript
test('debug network', async ({ page }) => {
  page.on('request', request => {
    console.log('Request:', request.url());
  });

  page.on('response', response => {
    console.log('Response:', response.status(), response.url());
  });

  // Your test code
});
```

### Breakpoints in VS Code

1. Install "Playwright Test for VSCode" extension
2. Set breakpoints in test code
3. Run test in debug mode (F5)
4. Step through code with debugger

### Common Debugging Commands

```bash
# Show verbose output
npm run test:e2e -- --verbose

# Show browser console in terminal
npm run test:e2e -- --reporter=list

# Save HAR file for network analysis
npm run test:e2e -- --save-har=trace.har

# Run test with slow motion (easier to follow)
npm run test:e2e -- --headed --slow-mo=1000
```

---

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium

      - name: Setup test environment
        run: |
          echo "REACT_APP_SUPABASE_URL=${{ secrets.TEST_SUPABASE_URL }}" >> .env
          echo "REACT_APP_SUPABASE_ANON_KEY=${{ secrets.TEST_SUPABASE_ANON_KEY }}" >> .env
          # Add other env vars

      - name: Build app
        run: npm run build

      - name: Start app
        run: npm start &

      - name: Wait for app to be ready
        run: npx wait-on http://localhost:3000

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BASE_URL: http://localhost:3000

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/
          retention-days: 7

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
e2e-tests:
  image: mcr.microsoft.com/playwright:v1.56.0-focal
  stage: test
  script:
    - npm ci
    - npm run build
    - npm start &
    - npx wait-on http://localhost:3000
    - npm run test:e2e
  artifacts:
    when: always
    paths:
      - test-results/
      - playwright-report/
    expire_in: 1 week
  only:
    - main
    - develop
    - merge_requests
```

### Vercel (Preview Deployments)

Test against Vercel preview deployments:

```yaml
# In GitHub Actions
- name: Get Preview URL
  id: preview
  run: echo "url=$(vercel inspect --token=${{ secrets.VERCEL_TOKEN }})" >> $GITHUB_OUTPUT

- name: Run E2E tests against preview
  run: npm run test:e2e
  env:
    BASE_URL: ${{ steps.preview.outputs.url }}
```

### Docker

Run tests in Docker container:

`Dockerfile.test`:

```dockerfile
FROM mcr.microsoft.com/playwright:v1.56.0-focal

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

CMD ["npm", "run", "test:e2e"]
```

Run:

```bash
docker build -f Dockerfile.test -t armoracpo-e2e .
docker run --env-file .env.test armoracpo-e2e
```

---

## Troubleshooting

### Common Issues & Solutions

#### 1. Tests Failing with "Timeout Exceeded"

**Symptom:** Tests fail with `Timeout 30000ms exceeded`

**Solutions:**

```typescript
// Option 1: Increase timeout for specific test
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});

// Option 2: Increase global timeout in playwright.config.ts
export default defineConfig({
  timeout: 60000, // 60 seconds
});

// Option 3: Wait for specific condition
await page.waitForSelector('[data-testid="loaded"]', { timeout: 10000 });
```

#### 2. "Element Not Found" Errors

**Symptom:** `Error: Element not found: button:has-text("Login")`

**Solutions:**

```typescript
// Option 1: Wait for element explicitly
await page.waitForSelector('button:has-text("Login")');
await page.click('button:has-text("Login")');

// Option 2: Use more specific selector
await page.click('[data-testid="login-button"]');

// Option 3: Check if element is visible first
const isVisible = await page.isVisible('button:has-text("Login")');
if (isVisible) {
  await page.click('button:has-text("Login")');
}

// Option 4: Use better selector strategy
await page.getByRole('button', { name: 'Login' }).click();
```

#### 3. Flaky Tests (Intermittent Failures)

**Symptom:** Tests pass sometimes, fail other times

**Solutions:**

```typescript
// Option 1: Add proper waits
await page.waitForLoadState('networkidle');
await page.waitForSelector('[data-testid="content"]');

// Option 2: Use auto-waiting assertions
await expect(page.getByText('Success')).toBeVisible(); // Auto-waits

// Option 3: Retry failed tests
// In playwright.config.ts
export default defineConfig({
  retries: 2, // Retry failed tests up to 2 times
});

// Option 4: Add explicit delays (last resort)
await page.waitForTimeout(1000); // Wait 1 second
```

#### 4. Authentication State Not Persisting

**Symptom:** User gets logged out between tests

**Solutions:**

```typescript
// Option 1: Reuse authentication state
test.use({ storageState: 'auth.json' });

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  const auth = new AuthHelper(page);
  await auth.loginAsCPO();
  await page.context().storageState({ path: 'auth.json' });
});

// Option 2: Use test.describe.serial for dependent tests
test.describe.serial('Authenticated flow', () => {
  test('login', async ({ page }) => { /* ... */ });
  test('use app', async ({ page }) => { /* ... */ }); // Still logged in
});
```

#### 5. Database State Issues

**Symptom:** Tests fail because data is missing or modified

**Solutions:**

```bash
# Option 1: Reset database before test runs
npm run db:reset && npm run test:e2e

# Option 2: Create isolated test data per test
test('example', async ({ page }) => {
  const testUser = await createTestUser(); // Create fresh user
  // Use testUser in test
  await cleanupTestUser(testUser.id); // Clean up after
});

# Option 3: Use transactions (if supported)
test('example with transaction', async ({ page }) => {
  await db.transaction(async (trx) => {
    // All DB operations in transaction
    // Automatically rolled back after test
  });
});
```

#### 6. Supabase Real-Time Issues

**Symptom:** Real-time updates not working in tests

**Solutions:**

```typescript
// Wait for real-time subscription
test('real-time message', async ({ page }) => {
  await page.goto('/messages/123');

  // Trigger message from another source
  await sendTestMessage('123', 'Hello');

  // Wait for message to appear via real-time
  await expect(page.getByText('Hello')).toBeVisible({ timeout: 5000 });
});

// Alternative: Poll for updates
await page.waitForFunction(
  async () => {
    const messages = document.querySelectorAll('.message');
    return messages.length > 0;
  },
  { timeout: 5000 }
);
```

#### 7. GPS/Location Permissions

**Symptom:** Tests fail when requesting location

**Solutions:**

```typescript
// Grant geolocation permission
test('location test', async ({ browser }) => {
  const context = await browser.newContext({
    geolocation: { latitude: 51.5074, longitude: -0.1278 },
    permissions: ['geolocation']
  });

  const page = await context.newPage();
  // Test code
});

// Or in playwright.config.ts
export default defineConfig({
  use: {
    geolocation: { latitude: 51.5074, longitude: -0.1278 },
    permissions: ['geolocation'],
  },
});
```

#### 8. File Upload Issues

**Symptom:** File uploads fail in tests

**Solutions:**

```typescript
// Upload file
const fileInput = await page.locator('input[type="file"]');
await fileInput.setInputFiles('path/to/test-image.jpg');

// Upload multiple files
await fileInput.setInputFiles([
  'path/to/image1.jpg',
  'path/to/image2.jpg'
]);

// Generate file on the fly
await fileInput.setInputFiles({
  name: 'test.txt',
  mimeType: 'text/plain',
  buffer: Buffer.from('test content'),
});
```

#### 9. Network Request Failures

**Symptom:** API requests fail during tests

**Solutions:**

```typescript
// Option 1: Mock API responses
await page.route('**/api/assignments', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ assignments: [] }),
  });
});

// Option 2: Wait for specific request
await page.waitForResponse(response =>
  response.url().includes('/api/assignments') && response.status() === 200
);

// Option 3: Check network errors
page.on('requestfailed', request => {
  console.error('Request failed:', request.url());
});
```

#### 10. Environment Variable Issues

**Symptom:** Tests can't access environment variables

**Solutions:**

```bash
# Option 1: Use .env file
echo "REACT_APP_SUPABASE_URL=..." > .env
npm run test:e2e

# Option 2: Pass env vars directly
REACT_APP_SUPABASE_URL=... npm run test:e2e

# Option 3: Use dotenv in playwright.config.ts
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL,
  },
});
```

### Debug Checklist

When a test fails, check:

1. [ ] Is the app running? (`http://localhost:3000`)
2. [ ] Are environment variables set correctly?
3. [ ] Is test data seeded in database?
4. [ ] Are test users created in Supabase Auth?
5. [ ] Is Supabase URL/key correct?
6. [ ] Are browser permissions granted (location, notifications)?
7. [ ] Is network stable (not offline)?
8. [ ] Check browser console for errors
9. [ ] Check network tab for failed requests
10. [ ] Run test with `--debug` flag

### Getting Help

If issues persist:

1. **Check Playwright Docs:** https://playwright.dev/docs/intro
2. **Search GitHub Issues:** https://github.com/microsoft/playwright/issues
3. **Check Test Logs:** `test-results/` directory
4. **Enable Verbose Logging:**
   ```bash
   DEBUG=pw:api npm run test:e2e
   ```
5. **Share trace file** with team: `npx playwright show-trace trace.zip`

---

## Best Practices

### 1. Write Stable Selectors

```typescript
// ❌ Bad: Fragile selectors
await page.click('.button-123');
await page.click('div > div > button:nth-child(3)');

// ✅ Good: Stable, semantic selectors
await page.click('[data-testid="submit-button"]');
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByLabel('Email').fill('test@example.com');
```

### 2. Use Auto-Waiting Assertions

```typescript
// ❌ Bad: Manual waits
await page.waitForTimeout(3000);
const text = await page.textContent('.result');
expect(text).toBe('Success');

// ✅ Good: Auto-waiting assertions
await expect(page.getByText('Success')).toBeVisible();
await expect(page.locator('.result')).toHaveText('Success');
```

### 3. Isolate Tests

```typescript
// ❌ Bad: Tests depend on each other
test('login', async ({ page }) => { /* ... */ });
test('view profile', async ({ page }) => { /* assumes still logged in */ });

// ✅ Good: Each test is independent
test('view profile', async ({ page }) => {
  const auth = new AuthHelper(page);
  await auth.loginAsCPO(); // Setup in each test
  await page.goto('/profile');
  // ...
});
```

### 4. Clean Up After Tests

```typescript
test('create assignment', async ({ page }) => {
  // Create test data
  const assignment = await createTestAssignment();

  // Test code

  // Clean up
  await deleteTestAssignment(assignment.id);
});

// Or use afterEach hook
test.afterEach(async () => {
  await cleanupTestData();
});
```

### 5. Use Test Hooks Appropriately

```typescript
test.describe('Job Management', () => {
  // Runs once before all tests
  test.beforeAll(async ({ browser }) => {
    // Setup shared resources
  });

  // Runs before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/jobs');
  });

  // Runs after each test
  test.afterEach(async ({ page }) => {
    await page.screenshot({ path: 'screenshot.png' });
  });

  // Runs once after all tests
  test.afterAll(async () => {
    // Cleanup shared resources
  });

  test('test 1', async ({ page }) => { /* ... */ });
  test('test 2', async ({ page }) => { /* ... */ });
});
```

### 6. Organize Tests Logically

```typescript
// Group related tests
test.describe('Authentication', () => {
  test.describe('Login', () => {
    test('valid credentials', async ({ page }) => { /* ... */ });
    test('invalid credentials', async ({ page }) => { /* ... */ });
  });

  test.describe('Signup', () => {
    test('new user', async ({ page }) => { /* ... */ });
    test('existing user', async ({ page }) => { /* ... */ });
  });
});
```

### 7. Add Test Tags for Filtering

```typescript
// Tag tests for easy filtering
test('smoke test @smoke', async ({ page }) => { /* ... */ });
test('critical user journey @critical', async ({ page }) => { /* ... */ });
test('edge case @edge', async ({ page }) => { /* ... */ });

// Run only smoke tests
// npm run test:e2e -- --grep @smoke
```

### 8. Mock External Dependencies

```typescript
// Mock API responses for faster, more reliable tests
test('display assignments', async ({ page }) => {
  await page.route('**/api/assignments', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        assignments: [
          { id: '1', title: 'Test Assignment' }
        ]
      }),
    });
  });

  await page.goto('/assignments');
  await expect(page.getByText('Test Assignment')).toBeVisible();
});
```

### 9. Parameterize Tests

```typescript
// Test multiple scenarios with same logic
const browsers = ['chromium', 'firefox', 'webkit'];

for (const browserType of browsers) {
  test(`login on ${browserType}`, async ({ playwright }) => {
    const browser = await playwright[browserType].launch();
    const page = await browser.newPage();
    // Test login
    await browser.close();
  });
}

// Or use test.describe.parallel
test.describe.parallel('Cross-browser tests', () => {
  test('chromium', async ({ page }) => { /* ... */ });
  test('firefox', async ({ page }) => { /* ... */ });
  test('webkit', async ({ page }) => { /* ... */ });
});
```

### 10. Document Complex Tests

```typescript
/**
 * Test: End-to-end job assignment flow
 *
 * Scenario:
 * 1. CPO logs in
 * 2. Browses available jobs
 * 3. Accepts a job
 * 4. Starts journey
 * 5. Completes assignment
 * 6. Verifies payment
 *
 * Expected: Full job lifecycle completes successfully
 */
test('complete job assignment flow', async ({ page }) => {
  // Step 1: Login
  const auth = new AuthHelper(page);
  await auth.loginAsCPO();

  // Step 2: Browse jobs
  // ... (rest of test)
});
```

---

## Quick Reference

### Useful Playwright Commands

```bash
# Run tests
npm run test:e2e                          # All tests
npm run test:e2e -- auth.spec.ts          # Specific file
npm run test:e2e -- --grep "login"        # Tests matching pattern
npm run test:e2e -- --headed              # With visible browser
npm run test:e2e -- --debug               # With debugger

# Generate code
npx playwright codegen localhost:3000     # Record actions as test code
npx playwright codegen --target=typescript # Generate TypeScript

# Reports
npm run test:e2e -- --reporter=html       # HTML report
npx playwright show-report                # View last report

# Trace
npm run test:e2e -- --trace on            # Record trace
npx playwright show-trace trace.zip       # View trace

# Update snapshots
npm run test:e2e -- --update-snapshots    # Update visual snapshots
```

### Common Assertions

```typescript
// Visibility
await expect(page.getByText('Hello')).toBeVisible();
await expect(page.locator('.hidden')).toBeHidden();

// Text content
await expect(page.locator('.title')).toHaveText('Welcome');
await expect(page.locator('.title')).toContainText('Wel');

// Attributes
await expect(page.locator('button')).toBeEnabled();
await expect(page.locator('button')).toBeDisabled();
await expect(page.locator('input')).toHaveAttribute('type', 'email');

// Count
await expect(page.locator('.item')).toHaveCount(5);

// URL
await expect(page).toHaveURL(/dashboard/);
await expect(page).toHaveTitle(/ArmoraCPO/);

// Value
await expect(page.locator('input')).toHaveValue('test@example.com');
```

### Locator Strategies

```typescript
// By role (recommended)
page.getByRole('button', { name: 'Submit' })
page.getByRole('textbox', { name: 'Email' })
page.getByRole('link', { name: 'Home' })

// By label
page.getByLabel('Email address')
page.getByLabel('Password')

// By placeholder
page.getByPlaceholder('Enter your email')

// By text
page.getByText('Welcome')
page.getByText(/welcome/i) // Case-insensitive regex

// By test ID
page.getByTestId('submit-button')

// By CSS selector
page.locator('.class-name')
page.locator('#id')
page.locator('[data-testid="value"]')

// By XPath
page.locator('xpath=//button[text()="Submit"]')
```

---

## Additional Resources

- **Playwright Documentation:** https://playwright.dev
- **Playwright Best Practices:** https://playwright.dev/docs/best-practices
- **Supabase Testing Guide:** https://supabase.com/docs/guides/testing
- **ArmoraCPO CLAUDE.md:** Project-specific guidelines
- **Test Data Seed Script:** `tests/setup/test-data-seed.sql`
- **QA Testing Checklist:** `docs/QA_TESTING_CHECKLIST.md`

---

**Last Updated:** 2025-10-08
**Maintained By:** Engineering Team - ArmoraCPO

For questions or issues, contact the QA team or create an issue in the project repository.
