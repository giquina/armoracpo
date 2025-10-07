# Supabase Storage Quick Start Guide

## Storage Buckets Overview

ArmoraCPO uses three storage buckets for different types of files:

| Bucket | Public? | Size Limit | Usage |
|--------|---------|------------|-------|
| `profile-photos` | Yes | 5MB | CPO profile avatars |
| `cpo-documents` | No | 10MB | DBS checks, certifications |
| `incident-photos` | No | 50MB | Incident evidence media |

## Quick Usage Examples

### 1. Upload Profile Photo

```typescript
import { supabase } from './lib/supabase';

// Upload avatar
const uploadAvatar = async (userId: string, file: File) => {
  const filePath = `avatars/${userId}/${file.name}`;

  const { error } = await supabase.storage
    .from('profile-photos')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: true, // Replace if exists
    });

  if (error) throw error;

  // Get public URL (no auth required)
  const { data } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
```

### 2. Upload CPO Document

```typescript
import { supabase } from './lib/supabase';

// Upload document
const uploadDocument = async (userId: string, file: File) => {
  const filePath = `documents/${userId}/${file.name}`;

  const { error } = await supabase.storage
    .from('cpo-documents')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false, // Don't replace
    });

  if (error) throw error;

  // Get signed URL (auth required, expires in 1 hour)
  const { data } = await supabase.storage
    .from('cpo-documents')
    .createSignedUrl(filePath, 3600);

  return data?.signedUrl;
};
```

### 3. Upload Incident Evidence

```typescript
import { supabase } from './lib/supabase';

// Upload incident media
const uploadIncidentMedia = async (incidentId: string, file: File) => {
  const filePath = `incidents/${incidentId}/${file.name}`;

  const { error } = await supabase.storage
    .from('incident-photos')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;

  // Get signed URL (auth required, expires in 24 hours)
  const { data } = await supabase.storage
    .from('incident-photos')
    .createSignedUrl(filePath, 86400);

  return data?.signedUrl;
};
```

## Folder Structure Requirements

**IMPORTANT:** All uploads MUST follow the correct folder structure:

- ✅ `profile-photos`: `avatars/{user_id}/{filename}`
- ✅ `cpo-documents`: `documents/{user_id}/{filename}`
- ✅ `incident-photos`: `incidents/{incident_id}/{filename}`

Incorrect folder structure will be rejected by RLS policies.

## File Type Restrictions

Each bucket only accepts specific file types:

### profile-photos
- ✅ image/jpeg (.jpg, .jpeg)
- ✅ image/png (.png)
- ✅ image/webp (.webp)
- ❌ Everything else

### cpo-documents
- ✅ application/pdf (.pdf)
- ✅ image/jpeg (.jpg, .jpeg)
- ✅ image/png (.png)
- ❌ Everything else

### incident-photos
- ✅ image/jpeg (.jpg, .jpeg)
- ✅ image/png (.png)
- ✅ video/mp4 (.mp4)
- ✅ video/quicktime (.mov)
- ✅ audio/mpeg (.mp3)
- ✅ audio/mp4 (.m4a)
- ✅ application/pdf (.pdf)
- ❌ Everything else

## Security Notes

1. **Profile Photos:** Public read, authenticated write (own files only)
2. **Documents:** Private, user can only access their own files
3. **Incident Photos:** Private, CPO can only access their incident's files

## Common Errors

### Error: "new row violates row-level security policy"
**Cause:** Trying to upload to wrong folder structure
**Solution:** Ensure file path matches: `avatars/{user_id}/`, `documents/{user_id}/`, or `incidents/{incident_id}/`

### Error: "File type not allowed"
**Cause:** Uploading unsupported file type
**Solution:** Check allowed_mime_types for each bucket (see table above)

### Error: "File size exceeds limit"
**Cause:** File too large for bucket
**Solution:**
- Profile photos: Max 5MB
- Documents: Max 10MB
- Incident media: Max 50MB

## Running the Migration

```bash
# Local development
supabase db reset

# OR push to production
supabase db push
```

## Need Help?

See detailed report: `STORAGE_MIGRATION_REPORT.md`
