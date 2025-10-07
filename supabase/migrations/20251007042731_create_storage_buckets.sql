-- =====================================================
-- Armora CPO Storage Buckets Configuration
-- Migration: 20251007042731_create_storage_buckets
-- Description: Creates storage buckets with RLS policies for profile photos, documents, and incident media
-- =====================================================

-- Create storage buckets for ArmoraCPO
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  -- Profile photos bucket (public read access for avatar display)
  ('profile-photos', 'profile-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),

  -- CPO documents bucket (private, user-only access)
  ('cpo-documents', 'cpo-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),

  -- Incident photos bucket (private, CPO-only access for legal evidence)
  ('incident-photos', 'incident-photos', false, 52428800, ARRAY['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/mp4', 'application/pdf']);

-- RLS policies for profile-photos bucket
CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS policies for cpo-documents bucket
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'cpo-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cpo-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cpo-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cpo-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- RLS policies for incident-photos bucket
-- Description: Secure access to incident evidence media with chain of custody support
-- =====================================================

-- Policy: CPOs can view incident photos from their own incident reports
-- Folder structure: incidents/{incident_id}/{filename}
-- Only the CPO who created the incident report can access its media
CREATE POLICY "CPOs can view their own incident photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'incident-photos' AND
  auth.uid() IN (
    SELECT po.user_id
    FROM incident_reports ir
    JOIN protection_officers po ON ir.cpo_id = po.id
    WHERE ir.id::text = (storage.foldername(name))[1]
  )
);

-- Policy: CPOs can upload photos to their own incident reports
-- Files must be stored in a folder matching an incident report they created
CREATE POLICY "CPOs can upload incident photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'incident-photos' AND
  auth.uid() IN (
    SELECT po.user_id
    FROM incident_reports ir
    JOIN protection_officers po ON ir.cpo_id = po.id
    WHERE ir.id::text = (storage.foldername(name))[1]
  )
);

-- Policy: CPOs can update their own incident photos metadata
-- This allows updating metadata without changing the file content
CREATE POLICY "CPOs can update their own incident photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'incident-photos' AND
  auth.uid() IN (
    SELECT po.user_id
    FROM incident_reports ir
    JOIN protection_officers po ON ir.cpo_id = po.id
    WHERE ir.id::text = (storage.foldername(name))[1]
  )
);

-- Policy: CPOs can delete their own incident photos (with restrictions)
-- Note: In production, you may want to disable deletion to maintain chain of custody
-- Consider adding a 'deleted_at' timestamp instead of actual deletion
CREATE POLICY "CPOs can delete their own incident photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'incident-photos' AND
  auth.uid() IN (
    SELECT po.user_id
    FROM incident_reports ir
    JOIN protection_officers po ON ir.cpo_id = po.id
    WHERE ir.id::text = (storage.foldername(name))[1]
  )
);

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE storage.buckets IS 'Storage buckets for ArmoraCPO: profile-photos (public), cpo-documents (private), incident-photos (private, evidence-grade)';

-- =====================================================
-- Important Notes:
-- =====================================================
-- 1. Profile Photos (public):
--    - Public read access for displaying avatars across the platform
--    - File size limit: 5MB
--    - Folder structure: avatars/{user_id}/{filename}
--    - Users can only upload/update/delete their own photos
--
-- 2. CPO Documents (private):
--    - Private access - users can only see their own documents
--    - File size limit: 10MB
--    - Folder structure: documents/{user_id}/{filename}
--    - Suitable for DBS checks, insurance certs, training certificates
--
-- 3. Incident Photos (private, evidence-grade):
--    - Private access - CPOs can only see media from their own incidents
--    - File size limit: 50MB (to support video evidence)
--    - Folder structure: incidents/{incident_id}/{filename}
--    - Supports chain of custody for legal admissibility
--    - Consider disabling DELETE in production to maintain evidence integrity
-- =====================================================
