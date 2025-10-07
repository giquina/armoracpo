# MediaUpload Component Update Guide

## Current Status

The MediaUpload component (`/workspaces/armoracpo/src/components/incidents/MediaUpload.tsx`) currently uses temporary object URLs instead of Supabase Storage. This needs to be updated to use the `incident-photos` bucket.

## Required Changes

### 1. Import Supabase Client

Add at the top of the file:

```typescript
import { supabase } from '../../lib/supabase';
```

### 2. Update File Upload Logic (Lines 219-221)

**CURRENT CODE:**
```typescript
// In production, upload file to secure storage (Supabase Storage, S3, etc.)
// For now, use object URL
const fileUrl = URL.createObjectURL(file);
```

**NEW CODE:**
```typescript
// Upload to Supabase Storage (incident-photos bucket)
const fileHash = await calculateFileHash(file);
const filePath = `incidents/${incidentId}/${fileHash}-${file.name}`;

const { error: uploadError } = await supabase.storage
  .from('incident-photos')
  .upload(filePath, file, {
    contentType: file.type,
    upsert: false, // Never overwrite evidence
  });

if (uploadError) {
  console.error('Storage upload error:', uploadError);
  throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
}

// Get signed URL (expires in 24 hours)
const { data: urlData, error: urlError } = await supabase.storage
  .from('incident-photos')
  .createSignedUrl(filePath, 86400);

if (urlError || !urlData) {
  throw new Error('Failed to generate file URL');
}

const fileUrl = urlData.signedUrl;
```

### 3. Store File Path in Metadata

Update the mediaAttachment object to include storage path:

**CURRENT CODE:**
```typescript
const mediaAttachment: IncidentMediaAttachment = {
  id: `media-${Date.now()}-${i}`,
  type: mediaType,
  url: fileUrl,
  // ... rest of properties
};
```

**NEW CODE:**
```typescript
const mediaAttachment: IncidentMediaAttachment = {
  id: `media-${Date.now()}-${i}`,
  type: mediaType,
  url: fileUrl,
  storagePath: filePath, // Add this for later reference
  // ... rest of properties
};
```

### 4. Update Type Definition

Add `storagePath` to `IncidentMediaAttachment` type in `/workspaces/armoracpo/src/types/index.ts`:

```typescript
export interface IncidentMediaAttachment {
  id: string;
  type: 'photo' | 'video' | 'audio' | 'document';
  url: string;
  storagePath?: string; // Add this line
  thumbnail?: string;
  filename: string;
  // ... rest of properties
}
```

### 5. Handle File Deletion

Update the `handleRemove` function to delete from storage:

**CURRENT CODE:**
```typescript
const handleRemove = (mediaId: string) => {
  if (window.confirm('Remove this media? This action cannot be undone.')) {
    onMediaRemoved(mediaId);
  }
};
```

**NEW CODE:**
```typescript
const handleRemove = async (mediaId: string) => {
  if (window.confirm('Remove this media? This action cannot be undone.')) {
    // Find media to get storage path
    const media = existingMedia.find(m => m.id === mediaId);

    if (media?.storagePath) {
      // Delete from storage
      const { error } = await supabase.storage
        .from('incident-photos')
        .remove([media.storagePath]);

      if (error) {
        console.error('Storage deletion error:', error);
        alert('Failed to delete file from storage');
        return;
      }
    }

    onMediaRemoved(mediaId);
  }
};
```

### 6. Error Handling Improvements

Add better error handling for storage operations:

```typescript
try {
  // Upload to Supabase Storage
  // ... upload code
} catch (err: any) {
  // Check for specific storage errors
  if (err.message?.includes('duplicate')) {
    throw new Error(`File "${file.name}" already exists for this incident`);
  } else if (err.message?.includes('policy')) {
    throw new Error('Permission denied: You can only upload to your own incidents');
  } else if (err.message?.includes('size')) {
    throw new Error(`File "${file.name}" exceeds 50MB limit`);
  } else {
    throw err;
  }
}
```

## Complete Updated Section

Here's the complete updated file upload section (lines 150-258):

```typescript
const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  setError(null);
  setUploading(true);

  try {
    // Check total files limit
    if (existingMedia.length + files.length > maxFiles) {
      throw new Error(`Maximum ${maxFiles} files allowed per incident report`);
    }

    // Check GPS availability
    if (!gpsLocation) {
      throw new Error('GPS location not available. Please enable location services.');
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxFileSize) {
        throw new Error(`File "${file.name}" exceeds ${maxFileSize}MB limit`);
      }

      // Determine media type
      let mediaType: 'photo' | 'video' | 'audio' | 'document' = 'document';
      if (file.type.startsWith('image/')) {
        mediaType = 'photo';
      } else if (file.type.startsWith('video/')) {
        mediaType = 'video';
      } else if (file.type.startsWith('audio/')) {
        mediaType = 'audio';
      }

      // Generate file hash
      const fileHash = await calculateFileHash(file);

      // Create thumbnail for images
      const thumbnail = await createThumbnail(file);

      // Get video duration if applicable
      let duration: number | undefined;
      if (mediaType === 'video' || mediaType === 'audio') {
        duration = await getVideoDuration(file);
      }

      // Reverse geocode GPS coordinates
      const address = await reverseGeocode(gpsLocation.latitude, gpsLocation.longitude);

      // Upload to Supabase Storage (incident-photos bucket)
      const filePath = `incidents/${incidentId}/${fileHash}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('incident-photos')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false, // Never overwrite evidence
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
      }

      // Get signed URL (expires in 24 hours)
      const { data: urlData, error: urlError } = await supabase.storage
        .from('incident-photos')
        .createSignedUrl(filePath, 86400);

      if (urlError || !urlData) {
        throw new Error('Failed to generate file URL');
      }

      // Create initial chain of custody entry
      const initialCustodyEntry: IncidentChainOfCustodyEntry = {
        id: `custody-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'captured',
        performedBy: {
          userId: cpoId,
          userName: cpoName,
          role: 'CPO',
        },
        details: `Media captured and uploaded to incident report ${incidentId}`,
        location: {
          latitude: gpsLocation.latitude,
          longitude: gpsLocation.longitude,
        },
      };

      const mediaAttachment: IncidentMediaAttachment = {
        id: `media-${Date.now()}-${i}`,
        type: mediaType,
        url: urlData.signedUrl,
        storagePath: filePath,
        thumbnail,
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type,
        duration,
        gpsData: {
          latitude: gpsLocation.latitude,
          longitude: gpsLocation.longitude,
          accuracy: gpsLocation.accuracy,
          timestamp: new Date().toISOString(),
          address,
        },
        metadata: {
          capturedAt: new Date().toISOString(),
          capturedBy: cpoId,
          deviceInfo: getDeviceInfo(),
          fileHash,
        },
        chainOfCustody: [initialCustodyEntry],
      };

      onMediaAdded(mediaAttachment);
    }
  } catch (err: any) {
    setError(err.message || 'Failed to upload media');
  } finally {
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }
};
```

## Testing Checklist

After making these changes, test:

- [ ] Upload photo to incident
- [ ] Upload video to incident
- [ ] Upload multiple files at once
- [ ] Try uploading to someone else's incident (should fail)
- [ ] Try uploading file that's too large (should fail with clear error)
- [ ] Try uploading unsupported file type (should fail)
- [ ] Delete uploaded media
- [ ] Verify files are stored in correct folder structure
- [ ] Verify signed URLs work and expire after 24 hours

## Benefits of This Update

1. **Permanent Storage:** Files are stored permanently in Supabase
2. **Security:** RLS policies prevent unauthorized access
3. **Chain of Custody:** Files organized by incident_id
4. **Deduplication:** File hash prevents duplicate uploads
5. **Legal Compliance:** Evidence-grade storage with audit trail

## Database Update Recommendation

Consider creating an `incident_media` table to track all uploaded files:

```sql
CREATE TABLE incident_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID REFERENCES incident_reports(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  media_type TEXT NOT NULL,
  file_hash TEXT NOT NULL UNIQUE,
  gps_latitude DECIMAL(10, 8),
  gps_longitude DECIMAL(11, 8),
  gps_accuracy DECIMAL(10, 2),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

This allows for:
- Better tracking of all incident media
- Preventing duplicate uploads via file_hash
- Soft deletes (deleted_at) to maintain evidence integrity
- Querying media by incident without parsing storage paths

## Questions?

Refer to:
- Full migration details: `STORAGE_MIGRATION_REPORT.md`
- Quick reference: `STORAGE_QUICK_START.md`
