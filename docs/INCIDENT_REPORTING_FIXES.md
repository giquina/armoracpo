# Incident Reporting System - Quick Fixes

**Date:** 2025-10-03
**Priority Order:** Critical → High → Medium → Low

---

## 🔴 CRITICAL FIXES (Required for Production)

### 1. Database Schema Setup

**Issue:** `incident_reports` table does not exist in production Supabase

**Impact:** ❌ System will not work at all

**Fix:**
1. Navigate to Supabase SQL Editor
2. Execute `/workspaces/armoracpo/docs/INCIDENT_REPORTS_SCHEMA.sql`
3. Verify table creation: `SELECT * FROM incident_reports LIMIT 1;`
4. Verify RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'incident_reports';`

**Time:** 30 minutes
**Difficulty:** Easy

---

## 🟠 HIGH PRIORITY FIXES (Should Fix Before Launch)

### 2. Supabase Storage Bucket

**Issue:** `incident-reports` storage bucket may not exist

**Impact:** Media uploads will fail

**Fix:**
1. Go to Supabase Dashboard → Storage
2. Create new bucket: `incident-reports`
3. Set to **Private** (not public)
4. Apply RLS policies from schema SQL

**Time:** 5 minutes
**Difficulty:** Easy

---

### 3. Object URL Memory Leak

**File:** `/workspaces/armoracpo/src/components/incidents/MediaUpload.tsx`
**Line:** 221

**Issue:** `URL.createObjectURL()` never revoked, causing memory leak

**Current Code:**
```typescript
const fileUrl = URL.createObjectURL(file);
```

**Fix:**
```typescript
// Add cleanup in parent component or useEffect
useEffect(() => {
  return () => {
    // Revoke all object URLs on unmount
    existingMedia.forEach(media => {
      if (media.url.startsWith('blob:')) {
        URL.revokeObjectURL(media.url);
      }
    });
  };
}, [existingMedia]);
```

**Time:** 15 minutes
**Difficulty:** Easy

---

### 4. Visual CSS Testing

**Issue:** CSS files exist but not tested in browser

**Files:**
- `/workspaces/armoracpo/src/components/incidents/IncidentReportForm.css`
- `/workspaces/armoracpo/src/components/incidents/MediaUpload.css`
- `/workspaces/armoracpo/src/components/incidents/SignatureCapture.css`
- `/workspaces/armoracpo/src/screens/Incidents/IncidentReports.css`

**Fix:**
1. Start dev server: `npm start`
2. Navigate to `/incidents/new`
3. Test all 6 form steps
4. Test media upload
5. Test signature capture
6. Verify responsive design on mobile

**Time:** 1 hour
**Difficulty:** Easy

---

## 🟡 MEDIUM PRIORITY FIXES (Should Fix This Week)

### 5. GPS Location Hardcoded in Chain of Custody

**File:** `/workspaces/armoracpo/src/services/incidentService.ts`
**Line:** 364

**Issue:** Chain of custody update uses `{ latitude: 0, longitude: 0 }`

**Current Code:**
```typescript
location: { latitude: 0, longitude: 0 }, // Get from device
```

**Fix:**
```typescript
async updateMediaChainOfCustody(
  reportId: string,
  mediaId: string,
  action: string,
  cpoId: string
): Promise<void> {
  try {
    // Get current GPS location
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
      });
    });

    const { data: report } = await supabase
      .from('incident_reports')
      .select('media_attachments')
      .eq('id', reportId)
      .single();

    if (!report) throw new Error('Incident report not found');

    const mediaAttachments = report.media_attachments.map((media: IncidentMediaAttachment) => {
      if (media.id === mediaId) {
        const custodyEntry = {
          action,
          timestamp: new Date().toISOString(),
          performedBy: cpoId,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
        };
        return {
          ...media,
          chainOfCustody: [...media.chainOfCustody, custodyEntry],
        };
      }
      return media;
    });

    await supabase
      .from('incident_reports')
      .update({ media_attachments: mediaAttachments })
      .eq('id', reportId);
  } catch (error: any) {
    console.error('Error updating chain of custody:', error);
    throw new Error(error.message || 'Failed to update chain of custody');
  }
}
```

**Time:** 30 minutes
**Difficulty:** Medium

---

### 6. Signature Images Not Embedded in PDF

**File:** `/workspaces/armoracpo/src/services/incidentPDFService.ts`
**Line:** 629-637

**Issue:** PDF shows placeholder rectangle instead of actual signature

**Current Code:**
```typescript
this.doc.setDrawColor(200, 200, 200);
this.doc.rect(this.marginLeft, this.currentY, 80, 20);
this.doc.setFontSize(8);
this.doc.setTextColor(150, 150, 150);
this.doc.text('Digital Signature', this.marginLeft + 40, this.currentY + 12, { align: 'center' });
this.doc.setTextColor(0, 0, 0);
```

**Fix:**
```typescript
if (signature.signatureData) {
  try {
    this.doc.addImage(
      signature.signatureData, // Base64 PNG
      'PNG',
      this.marginLeft,
      this.currentY,
      80,
      20,
      undefined,
      'FAST'
    );
  } catch (error) {
    console.error('Failed to embed signature:', error);
    // Fallback to placeholder
    this.doc.setDrawColor(200, 200, 200);
    this.doc.rect(this.marginLeft, this.currentY, 80, 20);
  }
} else {
  // No signature available
  this.doc.setDrawColor(200, 200, 200);
  this.doc.rect(this.marginLeft, this.currentY, 80, 20);
  this.doc.text('No Signature', this.marginLeft + 40, this.currentY + 12, { align: 'center' });
}
```

**Time:** 20 minutes
**Difficulty:** Easy

---

### 7. Media Upload Not Integrated in Form

**File:** `/workspaces/armoracpo/src/components/incidents/IncidentReportForm.tsx`
**Line:** 1044-1046

**Issue:** Shows placeholder message instead of actual MediaUpload component

**Current Code:**
```tsx
<div className="alert alert-info">
  <strong>📸 Media Evidence</strong>
  <p>Photo and video uploads will be available after saving this draft.</p>
</div>
```

**Fix:**
```tsx
import { MediaUpload } from '../MediaUpload';

// In state:
const [mediaAttachments, setMediaAttachments] = useState<IncidentMediaAttachment[]>(
  existingReport?.mediaAttachments || []
);

// In renderStep5():
<div className="form-group">
  <h3>Media Evidence</h3>
  <MediaUpload
    incidentId={report.id || `draft-${Date.now()}`}
    cpoId={cpoId} // Get from auth context
    cpoName={cpoName} // Get from auth context
    onMediaAdded={(media) => setMediaAttachments([...mediaAttachments, media])}
    onMediaRemoved={(mediaId) => setMediaAttachments(mediaAttachments.filter(m => m.id !== mediaId))}
    existingMedia={mediaAttachments}
    maxFiles={20}
    maxFileSize={50}
  />
</div>
```

**Time:** 45 minutes
**Difficulty:** Medium

---

### 8. Incident Number Generation (Client-Side Random)

**File:** `/workspaces/armoracpo/src/components/incidents/IncidentReportForm.tsx`
**Line:** 265

**Issue:** Uses client-side random number, risk of collisions

**Current Code:**
```typescript
incidentNumber: `IR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
```

**Fix:**
Database trigger already handles this! Just remove the client-side generation:

```typescript
// In handleSubmit, remove incidentNumber:
const report: IncidentReport = {
  id: existingReport?.id || `incident-${Date.now()}`,
  // incidentNumber: ... <-- REMOVE THIS LINE
  // Database trigger will auto-generate it
  assignmentId,
  assignmentReference,
  // ... rest of fields
```

**Time:** 5 minutes
**Difficulty:** Easy

---

### 9. IP Address Capture Missing

**File:** `/workspaces/armoracpo/src/services/incidentService.ts`
**Line:** 324

**Issue:** IP address not captured in signatures

**Fix:**
```typescript
// Create a helper function in signature service
const getIPAddress = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('IP fetch error:', error);
    return 'Unknown';
  }
};

// In addSignature method:
async addSignature(
  reportId: string,
  signatureData: string,
  signerRole: string,
  signerName: string,
  cpoId: string
): Promise<void> {
  try {
    const ipAddress = await getIPAddress(); // <-- Add this

    const signature = {
      id: `sig-${Date.now()}`,
      signatureData,
      signerRole,
      signerName,
      signerId: cpoId,
      signedAt: new Date().toISOString(),
      ipAddress, // <-- Use captured IP
      deviceInfo: navigator.userAgent,
    };

    // ... rest of code
  } catch (error: any) {
    console.error('Error adding signature:', error);
    throw new Error(error.message || 'Failed to add signature');
  }
}
```

**Time:** 15 minutes
**Difficulty:** Easy

---

### 10. IP Address Fetching from Third-Party API

**File:** `/workspaces/armoracpo/src/components/incidents/SignatureCapture.tsx`
**Line:** 64-71

**Issue:** Dependency on external ipify.org API

**Recommendation:**
Option 1: Server-side IP capture (preferred):
```typescript
// Add to Supabase Edge Function
export async function handler(req: Request) {
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown';
  return new Response(JSON.stringify({ ip: ipAddress }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

Option 2: Keep ipify but add fallback:
```typescript
const getIPAddress = async (): Promise<string> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const response = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('IP fetch error:', error);
    return 'Unavailable'; // Fallback instead of 'Unknown'
  }
};
```

**Time:** 30 minutes
**Difficulty:** Medium

---

## 🟢 LOW PRIORITY FIXES (Nice to Have)

### 11. Thumbnail Images Not Embedded in PDF

**File:** `/workspaces/armoracpo/src/services/incidentPDFService.ts`
**Line:** 531-567

**Enhancement:** Embed media thumbnails in PDF

**Fix:**
```typescript
private addMediaEvidence(report: IncidentReport): void {
  if (report.mediaAttachments.length === 0) {
    return;
  }

  this.checkPageBreak(30);
  this.addSectionHeader('MEDIA EVIDENCE');

  report.mediaAttachments.forEach((media, index) => {
    this.checkPageBreak(60);

    // Embed thumbnail if available
    if (media.thumbnail) {
      try {
        this.doc.addImage(
          media.thumbnail,
          'JPEG',
          this.marginLeft,
          this.currentY,
          40,
          40,
          undefined,
          'FAST'
        );
      } catch (error) {
        console.error('Failed to embed thumbnail:', error);
      }
    }

    // Media details table (adjust X position to account for thumbnail)
    const mediaData = [
      ['Type', media.type.toUpperCase()],
      ['Filename', media.filename],
      ['Captured', new Date(media.metadata.capturedAt).toLocaleString('en-GB')],
      ['GPS', `${media.gpsData.latitude.toFixed(6)}, ${media.gpsData.longitude.toFixed(6)}`],
      ['Description', media.description || 'N/A'],
    ];

    autoTable(this.doc, {
      startY: this.currentY,
      body: mediaData,
      margin: { left: media.thumbnail ? this.marginLeft + 45 : this.marginLeft },
      styles: { fontSize: 9 },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  });
}
```

**Time:** 1 hour
**Difficulty:** Medium

---

### 12. Auto-Save Dependency Array Incomplete

**File:** `/workspaces/armoracpo/src/components/incidents/IncidentReportForm.tsx`
**Line:** 146-159

**Issue:** Auto-save only watches 6 fields, misses witnesses, actions, etc.

**Fix (Option 1 - Watch All Fields):**
```typescript
useEffect(() => {
  const autoSaveInterval = setInterval(() => {
    handleSaveDraft();
  }, 30000);

  return () => clearInterval(autoSaveInterval);
}, [
  classification,
  severity,
  incidentDateTime,
  address,
  city,
  summary,
  detailedNarrative,
  witnesses,
  immediateActions,
  equipmentUsed,
  lawEnforcementReported,
  // ... all other form fields
]);
```

**Fix (Option 2 - No Dependencies):**
```typescript
useEffect(() => {
  const autoSaveInterval = setInterval(() => {
    // Capture current form state on each interval
    handleSaveDraft();
  }, 30000);

  return () => clearInterval(autoSaveInterval);
}, []); // Empty array - always uses latest state
```

**Recommendation:** Use Option 2 (simpler and more reliable)

**Time:** 10 minutes
**Difficulty:** Easy

---

### 13. No Timestamp Overlay on Signature Canvas

**File:** `/workspaces/armoracpo/src/components/incidents/SignatureCapture.tsx`
**Line:** 154-198

**Enhancement:** Add timestamp text to signature image

**Fix:**
```typescript
const saveSignature = async () => {
  if (isEmpty) {
    alert('Please provide a signature before saving');
    return;
  }

  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Add timestamp overlay
  const timestamp = new Date().toLocaleString('en-GB');
  ctx.font = '12px Arial';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.textAlign = 'right';
  ctx.fillText(`Signed: ${timestamp}`, canvas.width - 10, canvas.height - 10);

  // Convert canvas to base64 data URL
  const dataUrl = canvas.toDataURL('image/png');
  setSignatureData(dataUrl);

  // ... rest of code
};
```

**Time:** 15 minutes
**Difficulty:** Easy

---

### 14. No Upload Progress Indicator

**File:** `/workspaces/armoracpo/src/components/incidents/MediaUpload.tsx`

**Enhancement:** Show progress bar for large file uploads

**Fix:**
```tsx
const [uploadProgress, setUploadProgress] = useState<number>(0);

// In handleFileSelect, when uploading to Supabase Storage:
const { error: uploadError } = await supabase.storage
  .from('incident-reports')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
    onUploadProgress: (progress) => {
      const percent = (progress.loaded / progress.total) * 100;
      setUploadProgress(percent);
    },
  });

// In JSX:
{uploading && uploadProgress > 0 && (
  <div className="upload-progress">
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{ width: `${uploadProgress}%` }}
      />
    </div>
    <span>{uploadProgress.toFixed(0)}%</span>
  </div>
)}
```

**Time:** 30 minutes
**Difficulty:** Medium

---

### 15. Reverse Geocoding Not Implemented

**File:** `/workspaces/armoracpo/src/components/incidents/MediaUpload.tsx`
**Line:** 84-88

**Enhancement:** Convert GPS to actual address

**Fix (Using Nominatim - Free):**
```typescript
const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'User-Agent': 'ArmoraCPO/1.0',
        },
      }
    );
    const data = await response.json();
    return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error('Geocoding error:', error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`; // Fallback to coordinates
  }
};
```

**Time:** 20 minutes
**Difficulty:** Easy

---

## 📋 Testing Checklist

Once fixes are applied, test these workflows:

### End-to-End Test 1: Create Incident Report
- [ ] Navigate to `/incidents/new`
- [ ] Complete all 6 form steps
- [ ] Verify GPS coordinates captured
- [ ] Add 2 immediate actions
- [ ] Add 1 witness
- [ ] Save as draft
- [ ] Verify auto-save works (wait 30s)
- [ ] Submit report
- [ ] Verify report appears in list

### End-to-End Test 2: Media Upload
- [ ] Open existing incident report
- [ ] Add 3 photos
- [ ] Verify GPS tags on each
- [ ] Verify file hashes generated
- [ ] Check chain of custody entries
- [ ] Verify thumbnails generated
- [ ] Remove 1 photo
- [ ] Verify object URLs revoked

### End-to-End Test 3: Signature Capture
- [ ] Open incident report
- [ ] Draw signature on canvas
- [ ] Clear and redraw
- [ ] Save signature
- [ ] Verify GPS captured
- [ ] Verify IP address captured
- [ ] Check device info populated

### End-to-End Test 4: PDF Export
- [ ] Export incident report as PDF
- [ ] Verify all sections present
- [ ] Check GPS coordinates in multiple places
- [ ] Verify signature image embedded
- [ ] Check media thumbnails (if implemented)
- [ ] Verify watermarks present
- [ ] Check headers/footers

### End-to-End Test 5: Search & Filter
- [ ] Search by incident number
- [ ] Search by location
- [ ] Filter by critical severity
- [ ] Filter by submitted status
- [ ] Combine search + filters
- [ ] Clear all filters

---

## 🚀 Deployment Checklist

Before pushing to production:

- [ ] Database schema created (`INCIDENT_REPORTS_SCHEMA.sql`)
- [ ] Storage bucket created (`incident-reports`)
- [ ] RLS policies verified
- [ ] All critical fixes applied
- [ ] All high priority fixes applied
- [ ] End-to-end tests passed
- [ ] Mobile device tested (iOS + Android)
- [ ] Browser compatibility verified (Chrome, Safari, Firefox)
- [ ] HTTPS enabled (required for GPS and camera)
- [ ] Environment variables configured
- [ ] Backup and recovery tested

---

## 📞 Support

If you encounter issues during fixes:

1. Check Supabase logs for database errors
2. Check browser console for JavaScript errors
3. Verify RLS policies are not blocking queries
4. Check GPS permissions in browser
5. Verify HTTPS is enabled (required for GPS)

---

**Document Version:** 1.0
**Last Updated:** 2025-10-03
**Maintainer:** Claude Code AI
