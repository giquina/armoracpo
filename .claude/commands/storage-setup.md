Configure Supabase Storage buckets for file uploads in the ArmoraCPO platform.

Tasks to perform:
1. Create Supabase migration for storage buckets:
   - profile-photos (public bucket)
   - cpo-documents (private bucket)
2. Add Row Level Security policies for storage:
   - Public read for avatars
   - User-only access for documents
3. Verify AvatarUpload.tsx and DocumentsSection.tsx are correctly configured
4. Test avatar upload and retrieval
5. Test document upload (DBS, insurance, certifications)
6. Check file size limits and validation
7. Verify MIME type restrictions
8. Test file deletion flows

Generate migration SQL and apply to database. Return confirmation when storage is ready.