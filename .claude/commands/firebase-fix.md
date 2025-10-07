Fix and activate Firebase Cloud Messaging (FCM) for push notifications in the ArmoraCPO app.

Tasks to perform:
1. Read the current firebase.ts file and the backup (firebase.ts.cpo-backup)
2. Replace mock Firebase implementation with the real working version
3. Verify all Firebase environment variables are set
4. Check service worker configuration for FCM
5. Update notificationService.ts if needed
6. Test notification permission flow
7. Verify FCM token storage in Supabase
8. Create test notification to verify end-to-end functionality
9. Document any issues found

Goal: Get push notifications working in production.