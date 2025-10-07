Comprehensive pre-deployment checklist for ArmoraCPO to Google Play Store.

Tasks to perform:

**1. Build & Deployment**
- Verify npm build runs without errors
- Check for TypeScript errors
- Test production build
- Verify environment variables set in deployment platform
- Check bundle size and optimization

**2. PWA Configuration**
- Verify manifest.json is correctly configured
- Check service worker registration
- Test offline functionality
- Verify app icons (all sizes)
- Test "Add to Home Screen" flow

**3. Supabase & Firebase**
- Confirm Firebase is activated (not mock)
- Test push notifications work
- Verify Supabase Storage buckets created
- Check RLS policies are active
- Test real-time subscriptions

**4. Android-Specific**
- Check if TWA (Trusted Web Activity) configuration exists
- Verify Android manifest and gradle files
- Test deep linking
- Check Play Store assets (screenshots, descriptions)
- Verify app signing certificate

**5. Security**
- Rotate any exposed credentials
- Verify HTTPS-only
- Check CSP headers
- Test authentication flows
- Verify data encryption

**6. Testing**
- Test on multiple Android devices/emulators
- Test all critical user flows
- Performance testing (Lighthouse)
- Accessibility audit

Generate detailed report with pass/fail for each item and action items for anything blocking deployment.