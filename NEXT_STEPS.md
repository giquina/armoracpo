# ArmoraCPO - Next Steps (Action Required)

**Priority:** 🔴 **CRITICAL** - These steps must be completed before production use

---

## 🚨 CRITICAL: Complete These 2 Steps Now

### Step 1: Apply Storage Bucket Migration (5 minutes)

**Why:** Avatar uploads and document uploads will fail without this.

**How:**
1. Open: https://app.supabase.com/project/jmzvrqwjmlnvxojculee/sql/new
2. Open file: `/workspaces/armoracpo/supabase/migrations/20251007042731_create_storage_buckets.sql`
3. Copy the entire SQL content
4. Paste into Supabase SQL Editor
5. Click **RUN**
6. Verify: Go to Storage → Buckets → Should see `profile-photos` and `cpo-documents`

### Step 2: Get Firebase VAPID Key (3 minutes)

**Why:** Push notifications will not work without this key.

**How:**
1. Open: https://console.firebase.google.com/project/armora-protection/settings/cloudmessaging
2. Scroll to "Web Push certificates"
3. If no key exists, click "Generate key pair"
4. Copy the key (starts with "B...")
5. Go to: https://vercel.com/giquinas-projects/armoracpo/settings/environment-variables
6. Click "Add Another"
7. Name: `REACT_APP_FIREBASE_VAPID_KEY`
8. Value: *paste the VAPID key*
9. Environment: Check **Production**
10. Click **Save**
11. Go to Deployments tab → Click "..." on latest deployment → "Redeploy"

---

## ✅ After Completing Steps Above

### Verify Everything Works

#### 1. Test Storage Uploads
```bash
# Check buckets were created
# Run this in Supabase SQL Editor
SELECT id, name, public, file_size_limit
FROM storage.buckets;

# Expected result:
# - profile-photos (public=true, limit=5242880)
# - cpo-documents (public=false, limit=10485760)
```

Then test in the app:
- Go to Profile page
- Try uploading an avatar
- Go to Documents section
- Try uploading a document

#### 2. Test Push Notifications
- Login to app as a verified CPO
- Browser should prompt for notification permission
- Grant permission
- Check database:
```sql
SELECT user_id, fcm_token
FROM protection_officers
WHERE fcm_token IS NOT NULL;
```
- Send test notification from Firebase Console

#### 3. Test Authentication
- Sign up as new user
- Should create account but login fails with "pending verification"
- Update database:
```sql
UPDATE protection_officers
SET verification_status = 'verified'
WHERE email = 'your_test_email@example.com';
```
- Login should now work
- Refresh page - session should persist

---

## 📋 Optional But Recommended

### Create a Test CPO Account

1. Go to: https://armoracpo-35fick86e-giquinas-projects.vercel.app/signup
2. Fill in signup form with test data
3. Check email for verification link (if enabled)
4. Manually verify in Supabase:
```sql
-- Find the new user
SELECT id, email, user_id, verification_status
FROM protection_officers
ORDER BY created_at DESC
LIMIT 5;

-- Verify the user
UPDATE protection_officers
SET verification_status = 'verified'
WHERE id = '<cpo_id_from_above>';
```
5. Login with test account
6. Navigate through all screens using DevPanel

### Monitor Errors

- **Vercel Logs:** https://vercel.com/giquinas-projects/armoracpo/logs
- **Supabase Logs:** https://app.supabase.com/project/jmzvrqwjmlnvxojculee/logs/explorer
- **Browser Console:** Open DevTools → Console tab (look for errors)

---

## 🔍 Quick Health Check Commands

### Check Supabase Connection
```javascript
// Run in browser console at https://armoracpo-35fick86e-giquinas-projects.vercel.app
const { data, error } = await window.supabase.auth.getSession();
console.log('Session:', data.session ? 'Active' : 'None');
console.log('Error:', error);
```

### Check Firebase Connection
```javascript
// Run in browser console
console.log('Firebase Config:', {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY ? 'Set' : 'Missing',
  vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY ? 'Set' : 'Missing'
});
```

### Check Storage Buckets
```sql
-- Run in Supabase SQL Editor
SELECT
  b.id,
  b.name,
  b.public,
  b.file_size_limit,
  COUNT(o.id) as file_count
FROM storage.buckets b
LEFT JOIN storage.objects o ON b.id = o.bucket_id
WHERE b.id IN ('profile-photos', 'cpo-documents')
GROUP BY b.id, b.name, b.public, b.file_size_limit;
```

---

## 📞 Troubleshooting

### Problem: Storage buckets not created
**Solution:** Re-run the migration SQL in Supabase SQL Editor. Make sure there are no error messages.

### Problem: Push notifications not working
**Checklist:**
- [ ] VAPID key set in Vercel environment variables
- [ ] App redeployed after setting VAPID key
- [ ] Notification permission granted in browser
- [ ] FCM token saved in database (check `protection_officers.fcm_token`)

### Problem: Login fails with "pending verification"
**Solution:** This is expected behavior. Update the CPO's `verification_status` to 'verified' in Supabase.

### Problem: Session doesn't persist after page refresh
**Checklist:**
- [ ] Supabase URL and anon key are correct in environment variables
- [ ] Browser cookies enabled
- [ ] Check browser console for auth errors

---

## 🎯 When You're Done

Once both critical steps are complete and verified:

1. ✅ **Mark this task complete** in the conversation
2. 📋 **Review** `/workspaces/armoracpo/DEPLOYMENT_ROADMAP.md` for Phase 2 tasks
3. 🚀 **Start PWA optimization** (Lighthouse audit, bundle size, etc.)
4. 📱 **Begin Android TWA setup** for Play Store submission

**Estimated Total Time:** 10-15 minutes for critical steps + 30 minutes for testing

---

**Current Status:** 🟡 **70% Complete**
**Next Milestone:** 🟢 **Phase 1 Complete** (after manual steps)
**Final Goal:** 🎯 **Google Play Store Launch** (3-4 weeks)
