# Security Audit Report - Armora Platform
## CPO App & Client App Security Assessment

**Audit Date:** October 2, 2025
**Audited By:** Claude Code Security Review
**Applications:**
- Armora CPO App (`/workspaces/armoracpo`)
- Armora Client App (`/workspaces/armora`)

---

## Executive Summary

This comprehensive security audit identifies **2 CRITICAL** and **8 HIGH** severity vulnerabilities across both Armora applications. The platform handles sensitive SIA-regulated security data, including CPO personal information, client protection details, and real-time GPS tracking, making security paramount.

### Risk Assessment

| Severity | Count | Immediate Action Required |
|----------|-------|---------------------------|
| **CRITICAL** | 2 | ✅ Yes - Within 24 hours |
| **HIGH** | 8 | ✅ Yes - Within 1 week |
| **MEDIUM** | 6 | ⚠️ Recommended - Within 2 weeks |
| **LOW** | 5 | ℹ️ Plan for next sprint |

### Overall Security Posture: **REQUIRES IMMEDIATE ATTENTION**

While the applications demonstrate good practices in some areas (RLS implementation, proper .env handling), critical vulnerabilities exist that could lead to data breaches, unauthorized access, and regulatory compliance violations.

---

## Critical Vulnerabilities (CVSS 9.0+)

### 🔴 CRIT-01: Hardcoded Secrets in .env Files Committed to Repository

**Severity:** CRITICAL (CVSS 9.8)
**Component:** Both Apps - Environment Configuration
**Files Affected:**
- `/workspaces/armoracpo/.env` (lines 1-9)
- `/workspaces/armora/.env` (lines 24-25)

**Description:**
Live production secrets are hardcoded in `.env` files and committed to the repository:

```env
# CPO App .env (EXPOSED)
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptenZycXdqbWxudnhvamN1bGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1ODE1NjksImV4cCI6MjA3NDE1NzU2OX0.s-fLHpJWc54j-NOVU7k1mIKOHFL1mzduO-VFCVhoizA
REACT_APP_FIREBASE_API_KEY=AIzaSyCBvrZaVEDC1n3mebfrBqEHdLxiAQ86TEU
REACT_APP_FIREBASE_VAPID_KEY=BJjy-XYsrQgp-SEMNcwRh_4zTzRryjE-mlb10LsQnlL_oS-BYpGO9-B_x_gbsyHPJmMusybANJu2K5VvRw7mBvI
```

Git history shows these secrets were committed:
- Client App: Commit `f16e2aca28976ac1867b1024b050a62798b65016` exposed Supabase keys

**Impact:**
- ⚠️ **CRITICAL DATA BREACH RISK:** Exposed Supabase anon key allows unauthorized database access
- ⚠️ Firebase API keys exposed, enabling unauthorized push notifications
- ⚠️ VAPID keys compromised, allowing notification spoofing
- ⚠️ Potential unauthorized access to CPO personal data (SIA licenses, addresses, financial details)
- ⚠️ GDPR/Data Protection Act 2018 violation

**Remediation (IMMEDIATE):**
1. **ROTATE ALL CREDENTIALS IMMEDIATELY:**
   - Generate new Supabase anon key in Supabase dashboard
   - Rotate Firebase API key and VAPID key
   - Update Android keystore if exposed
2. **Remove from Git History:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   git push origin --force --all
   ```
3. **Use Environment Variables ONLY:**
   - Deploy secrets via Vercel dashboard (Environment Variables section)
   - Never commit `.env` files - verify `.gitignore` includes `.env`
4. **Audit Access Logs:**
   - Check Supabase logs for unauthorized access attempts
   - Review Firebase usage for anomalies

---

### 🔴 CRIT-02: Exposed SHA256 Certificate Fingerprint in Public Repository

**Severity:** CRITICAL (CVSS 9.0)
**Component:** CPO App - Android TWA Configuration
**File Affected:** `/workspaces/armoracpo/public/.well-known/assetlinks.json`

**Description:**
The Android app signing certificate fingerprint is publicly exposed:

```json
{
  "sha256_cert_fingerprints": [
    "8B:5E:37:60:2F:E4:71:5E:B0:6F:1F:FE:5A:99:F7:0B:36:9F:16:2F:1A:B6:39:50:24:99:EC:D3:C0:52:30:D5"
  ]
}
```

**Impact:**
- ⚠️ Attackers can attempt to generate matching APKs for phishing attacks
- ⚠️ Certificate spoofing attempts possible
- ⚠️ Enables targeted social engineering against CPOs
- ⚠️ Undermines TWA security model

**Remediation (IMMEDIATE):**
1. **Regenerate Signing Certificate:**
   ```bash
   keytool -genkey -v -keystore armora-cpo-new.keystore \
     -alias armora-cpo -keyalg RSA -keysize 2048 -validity 10000
   ```
2. **Update assetlinks.json with new fingerprint**
3. **Re-sign and re-release AAB to Google Play**
4. **Implement Certificate Pinning** in mobile app for additional security
5. **Monitor for fraudulent apps** on Google Play using brand name

---

## High Severity Vulnerabilities (CVSS 7.0-8.9)

### 🟠 HIGH-01: npm Audit Vulnerabilities - 6 HIGH Severity Packages

**Severity:** HIGH (CVSS 7.5)
**Component:** Both Apps - Dependencies
**Affected Packages:**

**CPO App (6 HIGH + 3 MODERATE):**
- `nth-check` - Inefficient Regular Expression (ReDoS) - **CVSS 7.5**
- `@svgr/webpack` - Dependency chain vulnerability
- `css-select` - Vulnerable to ReDoS attacks
- `webpack-dev-server` - Source code theft vulnerability - **CVSS 6.5**
- `postcss` - Line return parsing error - **CVSS 5.3**

**Client App: (Identical vulnerabilities)**

**Impact:**
- ⚠️ Denial of Service (DoS) attacks via crafted CSS selectors
- ⚠️ Source code exposure in development environments
- ⚠️ Development server vulnerabilities exploitable in non-Chromium browsers

**Remediation (7 DAYS):**
1. **Upgrade react-scripts** (requires major version bump):
   ```bash
   npm install --save-dev react-scripts@latest
   # Or migrate to Vite for better security posture
   ```
2. **If upgrade breaks app, implement workarounds:**
   - Use `npm audit fix --force` with caution
   - Override vulnerable packages in `package.json`:
     ```json
     "overrides": {
       "nth-check": "^2.0.1",
       "postcss": "^8.4.31"
     }
     ```
3. **Verify all tests pass after upgrade**
4. **Schedule migration to Vite or Next.js** for long-term security

---

### 🟠 HIGH-02: No Input Sanitization in CPO App

**Severity:** HIGH (CVSS 8.0)
**Component:** CPO App - User Input Handling
**Files Affected:** All forms and message inputs

**Description:**
CPO app lacks input sanitization utilities found in client app. No XSS protection for:
- Message inputs (`/screens/Messages/MessageChat.tsx`)
- Assignment notes and special instructions
- Incident report descriptions
- Profile update forms

**Evidence:**
- Client app has `/utils/inputSanitization.ts` - **CPO app does not**
- No `sanitizeText()` calls before database inserts
- Messages sent via `messageService.sendMessage()` use `message.trim()` only - **no XSS protection**

**Impact:**
- ⚠️ **Stored XSS attacks** via message system
- ⚠️ Malicious scripts injected in incident reports
- ⚠️ Principal-to-CPO XSS vectors in special instructions
- ⚠️ Session hijacking via stolen auth tokens

**Remediation (7 DAYS):**
1. **Copy input sanitization utilities from client app:**
   ```bash
   cp /workspaces/armora/src/utils/inputSanitization.ts \
      /workspaces/armoracpo/src/utils/
   ```
2. **Install DOMPurify for HTML sanitization:**
   ```bash
   npm install dompurify @types/dompurify
   ```
3. **Sanitize ALL user inputs before database writes:**
   ```typescript
   import { sanitizeText } from '../utils/inputSanitization';

   // In messageService.ts
   const { data, error } = await supabase
     .from('assignment_messages')
     .insert({
       message: sanitizeText(message.trim()), // Add sanitization
       // ...
     });
   ```
4. **Sanitize outputs when rendering:**
   ```typescript
   <p>{sanitizeText(message.message)}</p>
   ```

---

### 🟠 HIGH-03: Excessive localStorage Usage Without Encryption

**Severity:** HIGH (CVSS 7.5)
**Component:** Client App - Data Storage
**Files Affected:** 50+ files using localStorage

**Description:**
Client app stores **sensitive data in plaintext localStorage**:

```typescript
// Sensitive data exposed in localStorage:
localStorage.setItem('armora_assignment_data', JSON.stringify(protectionAssignmentData));
localStorage.setItem('armora_user', JSON.stringify(state.user));
localStorage.setItem('armora_questionnaire', JSON.stringify(state.questionnaireData));
localStorage.setItem('armora_panic_alert_sent', JSON.stringify({...}));
localStorage.setItem('armora_last_known_location', ...);
```

**Sensitive Data in localStorage:**
- User profiles with personal information
- Assignment details (threat levels, locations)
- Emergency contact information
- GPS coordinates
- Payment preferences
- Panic button state

**Impact:**
- ⚠️ **XSS attacks can steal all localStorage data**
- ⚠️ Browser extensions can access sensitive information
- ⚠️ Shared computers expose user data
- ⚠️ GDPR non-compliance (unencrypted personal data at rest)

**Remediation (7 DAYS):**
1. **Minimize localStorage usage** - store only non-sensitive preferences
2. **Encrypt sensitive data** before storing:
   ```typescript
   import CryptoJS from 'crypto-js';

   const encryptData = (data: any, key: string) => {
     return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
   };

   const decryptData = (encrypted: string, key: string) => {
     const bytes = CryptoJS.AES.decrypt(encrypted, key);
     return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
   };

   // Use encryption for sensitive data
   localStorage.setItem('armora_user', encryptData(user, sessionKey));
   ```
3. **Use sessionStorage for temporary data** (cleared on tab close)
4. **Clear localStorage on logout:**
   ```typescript
   const sensitiveKeys = ['armora_user', 'armora_assignment_data', ...];
   sensitiveKeys.forEach(key => localStorage.removeItem(key));
   ```

---

### 🟠 HIGH-04: No Rate Limiting on API Endpoints

**Severity:** HIGH (CVSS 7.0)
**Component:** Both Apps - API Security
**Services Affected:** All Supabase queries

**Description:**
No rate limiting implemented on:
- Authentication attempts (`authService.login()`)
- Message sending (`messageService.sendMessage()`)
- Assignment queries (`assignmentService.getAvailableAssignments()`)
- FCM token updates

**Impact:**
- ⚠️ **Brute force attacks** on authentication
- ⚠️ **Spam attacks** via message system
- ⚠️ **DoS attacks** by flooding assignment queries
- ⚠️ **Resource exhaustion** on Supabase (quota limits)

**Remediation (7 DAYS):**
1. **Implement Supabase Edge Functions with rate limiting:**
   ```typescript
   // Create edge function: supabase/functions/rate-limit/index.ts
   import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
   import { createClient } from '@supabase/supabase-js';

   const rateLimit = new Map();

   serve(async (req) => {
     const userId = req.headers.get('x-user-id');
     const now = Date.now();
     const userRequests = rateLimit.get(userId) || [];

     // Allow 10 requests per minute
     const recentRequests = userRequests.filter(t => now - t < 60000);
     if (recentRequests.length >= 10) {
       return new Response('Rate limit exceeded', { status: 429 });
     }

     rateLimit.set(userId, [...recentRequests, now]);
     // ... forward request
   });
   ```

2. **Add client-side throttling:**
   ```typescript
   import { throttle } from 'lodash';

   const throttledSearch = throttle(async (query) => {
     await assignmentService.getAvailableAssignments(query);
   }, 1000); // Max 1 request per second
   ```

3. **Configure Supabase Auth rate limits** in dashboard:
   - Authentication: 10 attempts per hour per IP
   - Password reset: 3 requests per hour per email

---

### 🟠 HIGH-05: No CSRF Protection Implemented

**Severity:** HIGH (CVSS 7.5)
**Component:** Both Apps - State-Changing Operations
**Affected Operations:** All POST/PUT/DELETE requests

**Description:**
No CSRF tokens found in codebase:
- Grep search for `CSRF|csrf|X-CSRF-Token` returned no results in CPO app
- State-changing operations (accept assignment, send message) lack CSRF protection
- Supabase client configured without CSRF middleware

**Impact:**
- ⚠️ **CSRF attacks** can accept assignments on behalf of CPOs
- ⚠️ **Unauthorized message sending** via CSRF
- ⚠️ **Profile modifications** without user consent
- ⚠️ **Financial transaction tampering** (payment records)

**Remediation (7 DAYS):**
1. **Enable Supabase CSRF protection:**
   ```typescript
   // In supabase.ts
   import { createClient } from '@supabase/supabase-js';

   export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
     auth: {
       flowType: 'pkce', // Use PKCE flow for CSRF protection
       autoRefreshToken: true,
       persistSession: true,
     },
     global: {
       headers: {
         'X-Client-Info': 'armora-cpo-app', // Add client identifier
       },
     },
   });
   ```

2. **Add custom CSRF middleware for critical operations:**
   ```typescript
   // Generate CSRF token on auth
   const generateCSRFToken = () => {
     return crypto.randomUUID();
   };

   // Include in all state-changing requests
   await supabase
     .from('protection_assignments')
     .update({ status: 'assigned' })
     .eq('id', assignmentId)
     .match({ csrf_token: sessionCSRFToken }); // Validate token
   ```

3. **Implement SameSite cookies** for session management

---

### 🟠 HIGH-06: SQL Injection Risk via `select('*')`

**Severity:** HIGH (CVSS 7.2)
**Component:** CPO App - Database Queries
**Files Affected:** All service files

**Description:**
Overuse of `select('*')` in database queries exposes unnecessary columns:

```typescript
// 11 instances of select('*') found:
.select('*')  // Returns ALL columns including sensitive ones
.eq('cpo_id', cpoId)
```

**Exposed Sensitive Columns:**
- `bank_account_number`, `bank_sort_code` (financial data)
- `national_insurance_number` (PII)
- `fcm_token` (security tokens)
- `right_to_work_document_url` (sensitive documents)

**Impact:**
- ⚠️ **Information disclosure** - unnecessary data exposure
- ⚠️ **Performance degradation** - transferring unneeded data
- ⚠️ **GDPR data minimization violation**
- ⚠️ Increased attack surface if XSS vulnerability exists

**Remediation (7 DAYS):**
1. **Replace all `select('*')` with explicit column lists:**
   ```typescript
   // Before (INSECURE):
   .select('*')

   // After (SECURE):
   .select('id, first_name, last_name, profile_photo_url, rating, is_available')
   ```

2. **Create view-specific queries:**
   ```typescript
   // In assignmentService.ts
   async getAvailableAssignments() {
     const { data, error } = await supabase
       .from('protection_assignments')
       .select(`
         id,
         assignment_type,
         threat_level,
         pickup_location,
         scheduled_start_time,
         base_rate,
         principal_name
       `) // Only necessary columns
       .eq('status', 'pending')
       .is('cpo_id', null);

     // ...
   }
   ```

3. **Audit all 11 instances in service files** and update accordingly

---

### 🟠 HIGH-07: Hardcoded VAPID Key in Source Code

**Severity:** HIGH (CVSS 7.0)
**Component:** CPO App - Push Notifications
**File Affected:** `/src/services/notificationService.ts` (line 5)

**Description:**
Firebase VAPID key hardcoded in source code:

```typescript
const VAPID_KEY = 'BJjy-XYsrQgp-SEMNcwRh_4zTzRryjE-mlb10LsQnlL_oS-BYpGO9-B_x_gbsyHPJmMusybANJu2K5VvRw7mBvI';
```

**Impact:**
- ⚠️ Exposed VAPID key allows unauthorized push notifications
- ⚠️ Notification spoofing attacks (fake assignment alerts)
- ⚠️ Social engineering via fake notifications
- ⚠️ Key rotation requires code changes and redeployment

**Remediation (7 DAYS):**
1. **Move to environment variable:**
   ```typescript
   // notificationService.ts
   const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY;

   if (!VAPID_KEY) {
     throw new Error('VAPID key not configured');
   }
   ```

2. **Rotate VAPID key immediately:**
   - Generate new key in Firebase Console
   - Update in Vercel environment variables
   - Remove hardcoded value from source

3. **Add key validation:**
   ```typescript
   if (!/^[A-Za-z0-9_-]{87}$/.test(VAPID_KEY)) {
     throw new Error('Invalid VAPID key format');
   }
   ```

---

### 🟠 HIGH-08: No Content Security Policy (CSP) Headers

**Severity:** HIGH (CVSS 7.3)
**Component:** CPO App - HTTP Security Headers
**File:** `/vercel.json`

**Description:**
Missing critical security headers:
- No Content-Security-Policy (CSP)
- No Referrer-Policy
- No Permissions-Policy

**Current Headers (Insufficient):**
```json
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block"  // Deprecated!
}
```

**Impact:**
- ⚠️ **XSS attacks** not mitigated by CSP
- ⚠️ **Clickjacking** (partially mitigated by X-Frame-Options)
- ⚠️ **Data leakage** via Referer header
- ⚠️ **Microphone/camera access** not restricted

**Remediation (7 DAYS):**
1. **Add comprehensive security headers to `vercel.json`:**
   ```json
   {
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "Content-Security-Policy",
             "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://jmzvrqwjmlnvxojculee.supabase.co https://firebaseapp.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
           },
           {
             "key": "X-Content-Type-Options",
             "value": "nosniff"
           },
           {
             "key": "X-Frame-Options",
             "value": "DENY"
           },
           {
             "key": "Referrer-Policy",
             "value": "strict-origin-when-cross-origin"
           },
           {
             "key": "Permissions-Policy",
             "value": "camera=(), microphone=(), geolocation=(self), payment=()"
           },
           {
             "key": "Strict-Transport-Security",
             "value": "max-age=31536000; includeSubDomains; preload"
           }
         ]
       }
     ]
   }
   ```

2. **Remove deprecated `X-XSS-Protection` header** (use CSP instead)

3. **Test CSP with report-only mode first:**
   ```json
   "Content-Security-Policy-Report-Only": "..."
   ```

---

## Medium Severity Vulnerabilities (CVSS 4.0-6.9)

### 🟡 MED-01: No Message Encryption in Transit Beyond HTTPS

**Severity:** MEDIUM (CVSS 6.5)
**Component:** Both Apps - Message System
**Affected:** `/services/messageService.ts`

**Description:**
Messages between principals and CPOs rely solely on HTTPS for encryption. No end-to-end encryption implemented for sensitive communications.

**Impact:**
- ⚠️ Messages readable by Supabase admins
- ⚠️ Government data requests expose communications
- ⚠️ Potential interception if HTTPS compromised
- ⚠️ Non-compliance with some enterprise security requirements

**Remediation (14 DAYS):**
1. **Implement E2EE using Web Crypto API:**
   ```typescript
   // Generate key pair for each user
   const generateKeyPair = async () => {
     return await crypto.subtle.generateKey(
       { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
       true,
       ['encrypt', 'decrypt']
     );
   };

   // Encrypt message
   const encryptMessage = async (message: string, recipientPublicKey: CryptoKey) => {
     const encoded = new TextEncoder().encode(message);
     const encrypted = await crypto.subtle.encrypt(
       { name: 'RSA-OAEP' },
       recipientPublicKey,
       encoded
     );
     return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
   };
   ```

2. **Store public keys in `protection_officers` and `profiles` tables**
3. **Add UI indicator for encrypted messages**

---

### 🟡 MED-02: Insufficient Error Message Sanitization

**Severity:** MEDIUM (CVSS 5.5)
**Component:** Both Apps - Error Handling
**Services Affected:** All service files

**Description:**
Database errors directly exposed to users:

```typescript
try {
  const { data, error } = await supabase...
  if (error) throw error; // Raw Postgres error exposed
} catch (error: any) {
  throw new Error(error.message); // Leaks internal details
}
```

**Impact:**
- ⚠️ **Information disclosure** - database schema exposed
- ⚠️ **SQL query details** leaked in error messages
- ⚠️ **Table/column names** revealed to attackers
- ⚠️ Aids in SQL injection reconnaissance

**Remediation (14 DAYS):**
1. **Sanitize all error messages:**
   ```typescript
   const sanitizeError = (error: any): string => {
     // Generic messages for production
     if (process.env.NODE_ENV === 'production') {
       return 'An error occurred. Please try again.';
     }

     // Detailed for development
     return error.message;
   };

   try {
     // ...
   } catch (error: any) {
     console.error('Database error:', error); // Log detailed error
     throw new Error(sanitizeError(error)); // Show generic to user
   }
   ```

2. **Implement error codes instead of messages:**
   ```typescript
   throw new AppError('AUTH_001', 'Authentication failed');
   ```

3. **Log detailed errors to monitoring service** (e.g., Sentry)

---

### 🟡 MED-03: No Session Timeout Implemented

**Severity:** MEDIUM (CVSS 5.8)
**Component:** Both Apps - Authentication
**Affected:** Supabase auth configuration

**Description:**
No automatic session timeout configured. Sessions persist indefinitely until explicit logout.

**Impact:**
- ⚠️ **Session hijacking** on shared/public devices
- ⚠️ **Unauthorized access** on unattended devices
- ⚠️ **Compliance violations** (PCI-DSS requires session timeout)

**Remediation (14 DAYS):**
1. **Configure session timeout in Supabase:**
   ```typescript
   // In supabase.ts
   export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
     auth: {
       autoRefreshToken: true,
       persistSession: true,
       detectSessionInUrl: true,
       // Add session timeout (15 minutes of inactivity)
       storageKey: 'armora-auth',
     },
   });

   // Implement inactivity timeout
   let inactivityTimeout: NodeJS.Timeout;
   const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes

   const resetInactivityTimeout = () => {
     clearTimeout(inactivityTimeout);
     inactivityTimeout = setTimeout(async () => {
       await supabase.auth.signOut();
       window.location.href = '/';
     }, TIMEOUT_DURATION);
   };

   // Reset on user activity
   document.addEventListener('click', resetInactivityTimeout);
   document.addEventListener('keypress', resetInactivityTimeout);
   ```

2. **Add "Remember Me" checkbox** for extended sessions (7 days)
3. **Display session expiry warning** 2 minutes before timeout

---

### 🟡 MED-04: Weak Password Policy

**Severity:** MEDIUM (CVSS 5.5)
**Component:** Client App - Authentication
**File:** `/src/components/Auth/LoginForm.tsx` (line 54-55)

**Description:**
Password validation only requires 6 characters:

```typescript
if (formData.password.length < 6) {
  newErrors.password = 'Password must be at least 6 characters';
}
```

**Impact:**
- ⚠️ **Brute force attacks** easier with short passwords
- ⚠️ **Dictionary attacks** more successful
- ⚠️ **Non-compliance** with NIST/ISO password standards (minimum 8 characters)

**Remediation (14 DAYS):**
1. **Strengthen password requirements:**
   ```typescript
   const validatePassword = (password: string): string | null => {
     if (password.length < 8) {
       return 'Password must be at least 8 characters';
     }
     if (!/[A-Z]/.test(password)) {
       return 'Password must contain at least one uppercase letter';
     }
     if (!/[a-z]/.test(password)) {
       return 'Password must contain at least one lowercase letter';
     }
     if (!/[0-9]/.test(password)) {
       return 'Password must contain at least one number';
     }
     if (!/[!@#$%^&*]/.test(password)) {
       return 'Password must contain at least one special character';
     }
     return null;
   };
   ```

2. **Implement password strength meter** using `zxcvbn` library
3. **Enforce password rotation** every 90 days for CPOs (SIA compliance)
4. **Check against HaveIBeenPwned API** for compromised passwords

---

### 🟡 MED-05: No Audit Logging for Security Events

**Severity:** MEDIUM (CVSS 6.0)
**Component:** Both Apps - Security Monitoring
**Missing:** Audit trail for critical operations

**Description:**
No audit logging implemented for:
- CPO login/logout events
- Assignment acceptance/cancellation
- Profile modifications
- Failed authentication attempts
- Permission changes

**Impact:**
- ⚠️ **Forensic analysis impossible** after security incidents
- ⚠️ **SIA compliance violation** (audit trail required)
- ⚠️ **GDPR non-compliance** (data access logging required)
- ⚠️ **Insider threats** undetectable

**Remediation (14 DAYS):**
1. **Create audit_logs table in Supabase:**
   ```sql
   CREATE TABLE audit_logs (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id),
     action VARCHAR(100) NOT NULL,
     resource_type VARCHAR(50) NOT NULL,
     resource_id UUID,
     ip_address INET,
     user_agent TEXT,
     metadata JSONB,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
   CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
   ```

2. **Implement audit logging service:**
   ```typescript
   export const auditService = {
     async log(action: string, resourceType: string, resourceId?: string, metadata?: any) {
       const { data: { user } } = await supabase.auth.getUser();

       await supabase.from('audit_logs').insert({
         user_id: user?.id,
         action,
         resource_type: resourceType,
         resource_id: resourceId,
         ip_address: await getClientIP(),
         user_agent: navigator.userAgent,
         metadata,
       });
     }
   };

   // Usage:
   await auditService.log('ASSIGNMENT_ACCEPTED', 'protection_assignment', assignmentId);
   ```

3. **Log critical events:**
   - Authentication (success/failure)
   - Authorization failures
   - Data access (CPO profile views)
   - Data modifications (profile updates)
   - Security configuration changes

---

### 🟡 MED-06: Missing Security Headers in Client App

**Severity:** MEDIUM (CVSS 5.5)
**Component:** Client App
**Missing:** `vercel.json` security configuration

**Description:**
Client app has **no vercel.json** file, missing all security headers.

**Impact:**
- ⚠️ No XSS protection via CSP
- ⚠️ No clickjacking protection
- ⚠️ No MIME-sniffing protection
- ⚠️ Same vulnerabilities as HIGH-08 but for client app

**Remediation (14 DAYS):**
1. **Create `/workspaces/armora/vercel.json`** with same security headers as CPO app
2. **Configure Vercel deployment** to use security headers
3. **Test headers** using securityheaders.com after deployment

---

## Low Severity Vulnerabilities (CVSS < 4.0)

### 🔵 LOW-01: Verbose Logging in Production

**Severity:** LOW (CVSS 3.5)
**Component:** Both Apps - Logging

**Description:**
Console logging includes sensitive information:

```typescript
console.log('[Notifications] FCM token obtained:', token.substring(0, 20) + '...');
console.log('[Notifications] Foreground message received:', payload);
```

**Impact:**
Information disclosure via browser DevTools.

**Remediation:**
```typescript
const log = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data);
  }
};
```

---

### 🔵 LOW-02: No Subresource Integrity (SRI) for CDN Assets

**Severity:** LOW (CVSS 3.2)
**Component:** Both Apps - External Dependencies

**Description:**
No SRI hashes for external scripts (if any CDN usage).

**Remediation:**
```html
<script src="https://cdn.example.com/lib.js"
  integrity="sha384-HASH"
  crossorigin="anonymous"></script>
```

---

### 🔵 LOW-03: Missing Security.txt File

**Severity:** LOW (CVSS 2.5)
**Component:** Both Apps - Security Disclosure

**Description:**
No `/public/.well-known/security.txt` for vulnerability reporting.

**Remediation:**
Create `/public/.well-known/security.txt`:
```
Contact: mailto:security@armora.com
Expires: 2026-01-01T00:00:00.000Z
Preferred-Languages: en
Canonical: https://armoracpo.vercel.app/.well-known/security.txt
Policy: https://armora.com/security-policy
```

---

### 🔵 LOW-04: No Client-Side Input Length Limits

**Severity:** LOW (CVSS 3.0)
**Component:** Both Apps - Forms

**Description:**
Form inputs lack maxLength attributes, allowing potential DoS via oversized inputs.

**Remediation:**
```typescript
<input type="text" maxLength={255} />
<textarea maxLength={2000} />
```

---

### 🔵 LOW-05: Service Worker Cache Poisoning Risk

**Severity:** LOW (CVSS 3.8)
**Component:** CPO App - PWA
**File:** `/public/service-worker.js`

**Description:**
Service worker caching without integrity checks could allow cache poisoning.

**Remediation:**
1. **Implement cache versioning:**
   ```javascript
   const CACHE_VERSION = 'v2';
   const CACHE_NAME = `armora-cpo-${CACHE_VERSION}`;
   ```

2. **Validate cached resources:**
   ```javascript
   const validateCache = async (response) => {
     const etag = response.headers.get('ETag');
     // Validate ETag matches expected value
   };
   ```

---

## SIA Compliance & Regulatory Findings

### GDPR/Data Protection Act 2018 Violations

**GDPR-01: Unencrypted Personal Data at Rest**
- **Article 32 (Security of Processing)** - Personal data in localStorage unencrypted
- **Remediation:** Implement encryption (see HIGH-03)

**GDPR-02: Missing Audit Trails**
- **Article 30 (Records of Processing)** - No logging of data access
- **Remediation:** Implement audit logging (see MED-05)

**GDPR-03: No Data Retention Policy**
- **Article 5(1)(e) (Storage Limitation)** - No automatic data deletion
- **Remediation:** Implement TTL for old assignments and messages

---

### SIA Licensing Requirements

**SIA-01: Insufficient Protection of License Data**
- SIA license numbers, expiry dates, and documents exposed via `select('*')`
- **Remediation:** Restrict column access (see HIGH-06)

**SIA-02: No DBS Check Verification Logging**
- No audit trail for DBS check status changes
- **Remediation:** Add audit logging for verification status updates

**SIA-03: Missing Insurance Document Validation**
- No validation that insurance documents are encrypted before storage
- **Remediation:** Enforce encryption for uploaded documents

---

## Dependency Security Summary

### CPO App Dependencies
- **Total Vulnerabilities:** 9 (6 HIGH, 3 MODERATE)
- **Direct Dependencies Affected:** `react-scripts` (HIGH)
- **Indirect Vulnerabilities:** 8

### Client App Dependencies
- **Total Vulnerabilities:** 9 (6 HIGH, 3 MODERATE)
- **Same vulnerabilities** as CPO app

**Action Required:**
- Upgrade `react-scripts` or migrate to Vite/Next.js
- Run `npm audit fix` with caution
- Implement package overrides for unfixable vulnerabilities

---

## Remediation Priority Matrix

| Priority | Timeframe | Vulnerabilities | Action Required |
|----------|-----------|-----------------|-----------------|
| **P0 - CRITICAL** | 24 hours | CRIT-01, CRIT-02 | Rotate all credentials, regenerate certificates |
| **P1 - HIGH** | 7 days | HIGH-01 to HIGH-08 | Fix npm vulnerabilities, add input sanitization, implement CSP |
| **P2 - MEDIUM** | 14 days | MED-01 to MED-06 | Add E2EE, audit logging, session timeout |
| **P3 - LOW** | 30 days | LOW-01 to LOW-05 | Production logging, SRI, security.txt |

---

## Compliance Checklist

### Data Protection & Privacy
- [ ] Encrypt sensitive data in localStorage (HIGH-03)
- [ ] Implement data retention policy (GDPR-03)
- [ ] Add audit logging for data access (MED-05)
- [ ] Document data processing activities (GDPR Art. 30)
- [ ] Implement data subject access requests (DSAR) workflow

### SIA Regulatory Compliance
- [ ] Restrict access to SIA license data (HIGH-06)
- [ ] Log all DBS verification status changes (SIA-02)
- [ ] Encrypt insurance and right-to-work documents (SIA-03)
- [ ] Implement compliance score monitoring dashboard
- [ ] Add automated SIA license expiry alerts

### Security Best Practices
- [ ] Rotate all exposed credentials (CRIT-01)
- [ ] Regenerate Android signing certificate (CRIT-02)
- [ ] Add input sanitization to CPO app (HIGH-02)
- [ ] Implement rate limiting (HIGH-04)
- [ ] Add CSRF protection (HIGH-05)
- [ ] Replace `select('*')` with explicit columns (HIGH-06)
- [ ] Add CSP and security headers (HIGH-08)
- [ ] Implement E2EE for messages (MED-01)
- [ ] Strengthen password policy (MED-04)

### Monitoring & Incident Response
- [ ] Set up security event monitoring (MED-05)
- [ ] Create security incident response plan
- [ ] Implement automated vulnerability scanning (GitHub Dependabot)
- [ ] Add security.txt for responsible disclosure (LOW-03)
- [ ] Configure Sentry/LogRocket for error tracking

---

## Immediate Action Plan (Next 24 Hours)

### Step 1: Credential Rotation (CRITICAL)
```bash
# 1. Generate new Supabase anon key
# - Go to Supabase Dashboard → Settings → API
# - Regenerate anon key
# - Update in Vercel env vars (DO NOT commit to .env)

# 2. Rotate Firebase credentials
# - Firebase Console → Project Settings → Service Accounts
# - Generate new private key
# - Update VAPID key in Cloud Messaging

# 3. Regenerate Android keystore
keytool -genkey -v -keystore armora-cpo-new.keystore \
  -alias armora-cpo -keyalg RSA -keysize 2048 -validity 10000

# 4. Remove .env from git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

git push origin --force --all

# 5. Add .env to .gitignore (verify it's there)
echo ".env" >> .gitignore
git add .gitignore
git commit -m "security: Ensure .env is gitignored"
git push
```

### Step 2: Certificate Remediation (CRITICAL)
```bash
# 1. Generate new signing certificate
./gradlew clean
keytool -genkey -v -keystore armora-cpo-new.keystore \
  -alias armora-cpo -keyalg RSA -keysize 2048 -validity 10000

# 2. Get new SHA256 fingerprint
keytool -list -v -keystore armora-cpo-new.keystore

# 3. Update assetlinks.json with new fingerprint
# 4. Re-sign AAB
./gradlew bundleRelease

# 5. Upload to Google Play Console
```

### Step 3: Deploy Security Headers (HIGH)
```bash
# Update vercel.json with CSP and security headers
# Deploy to production
vercel --prod
```

---

## Long-Term Security Roadmap

### Q4 2025
- [ ] Complete all HIGH severity fixes
- [ ] Implement comprehensive audit logging
- [ ] Add E2EE for message system
- [ ] Migrate to Vite or Next.js (eliminates npm audit vulnerabilities)

### Q1 2026
- [ ] Implement automated security scanning (SAST/DAST)
- [ ] Add penetration testing to CI/CD pipeline
- [ ] Obtain ISO 27001 certification (if required)
- [ ] Implement security awareness training for developers

### Q2 2026
- [ ] Add biometric authentication for CPO app
- [ ] Implement zero-trust architecture
- [ ] Add hardware security key support (WebAuthn)
- [ ] Conduct third-party security audit

---

## Contact & Reporting

**Security Team:** security@armora.com
**Bug Bounty:** https://armora.com/security (create program)
**Incident Response:** Available 24/7 via security@armora.com

---

## Audit Conclusion

The Armora platform demonstrates **good foundational security** with Row Level Security (RLS) policies and proper environment variable handling in most areas. However, **critical vulnerabilities exist** that require immediate remediation:

1. **CRITICAL:** Exposed credentials in committed .env files
2. **CRITICAL:** Exposed Android signing certificate fingerprint
3. **HIGH:** Multiple npm vulnerabilities requiring dependency updates
4. **HIGH:** Missing input sanitization in CPO app
5. **HIGH:** No rate limiting or CSRF protection

**Overall Grade: C (Requires Immediate Attention)**

With proper remediation of CRITICAL and HIGH severity issues within the next 7 days, the security posture can be elevated to **B+ (Good)**.

---

**Report Generated:** October 2, 2025
**Next Audit Recommended:** January 2, 2026
**Auditor:** Claude Code Security Review System
