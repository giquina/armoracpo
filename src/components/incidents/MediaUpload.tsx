import React, { useState, useRef, useEffect } from 'react';
import { IncidentMediaAttachment, IncidentChainOfCustodyEntry } from '../../types';
import './MediaUpload.css';

interface MediaUploadProps {
  incidentId: string;
  cpoId: string;
  cpoName: string;
  onMediaAdded: (media: IncidentMediaAttachment) => void;
  onMediaRemoved: (mediaId: string) => void;
  existingMedia?: IncidentMediaAttachment[];
  maxFiles?: number;
  maxFileSize?: number; // in MB
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  incidentId,
  cpoId,
  cpoName,
  onMediaAdded,
  onMediaRemoved,
  existingMedia = [],
  maxFiles = 20,
  maxFileSize = 50, // 50MB default
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gpsLocation, setGpsLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get GPS location on component mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.error('GPS error:', error);
          setError('Unable to get GPS location. Media will be tagged with approximate location.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setError('GPS not available on this device.');
    }
  }, []);

  const getDeviceInfo = (): string => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) {
      return 'iOS Device';
    } else if (/Android/.test(ua)) {
      return 'Android Device';
    } else if (/Windows/.test(ua)) {
      return 'Windows Device';
    } else if (/Mac/.test(ua)) {
      return 'Mac Device';
    }
    return 'Unknown Device';
  };

  const calculateFileHash = async (file: File): Promise<string> => {
    // Generate SHA-256 hash of file content for integrity verification
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    // In production, use a geocoding service API
    // For now, return approximate location
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const createThumbnail = async (file: File): Promise<string | undefined> => {
    if (!file.type.startsWith('image/')) {
      return undefined;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(undefined);
            return;
          }

          // Create thumbnail (200x200 max)
          const maxSize = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = () => {
        resolve(0);
      };
      video.src = URL.createObjectURL(file);
    });
  };

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

        // In production, upload file to secure storage (Supabase Storage, S3, etc.)
        // For now, use object URL
        const fileUrl = URL.createObjectURL(file);

        const mediaAttachment: IncidentMediaAttachment = {
          id: `media-${Date.now()}-${i}`,
          type: mediaType,
          url: fileUrl,
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

  const handleRemove = (mediaId: string) => {
    if (window.confirm('Remove this media? This action cannot be undone.')) {
      onMediaRemoved(mediaId);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="media-upload">
      <div className="media-upload-header">
        <h3>Evidence Media</h3>
        <span className="media-count">
          {existingMedia.length} / {maxFiles} files
        </span>
      </div>

      {!gpsLocation && (
        <div className="alert alert-warning">
          <strong>⚠️ GPS Required</strong>
          <p>Media uploads require GPS location for legal admissibility. Please enable location services.</p>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="media-upload-actions">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          multiple
          onChange={handleFileSelect}
          disabled={uploading || !gpsLocation || existingMedia.length >= maxFiles}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || !gpsLocation || existingMedia.length >= maxFiles}
        >
          {uploading ? (
            <>
              <span className="spinner-small"></span>
              Uploading...
            </>
          ) : (
            <>
              <span>📸</span>
              Add Photos/Videos
            </>
          )}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.setAttribute('capture', 'environment');
              fileInputRef.current.click();
            }
          }}
          disabled={uploading || !gpsLocation || existingMedia.length >= maxFiles}
        >
          <span>📷</span>
          Take Photo
        </button>
      </div>

      <div className="gps-status">
        {gpsLocation ? (
          <div className="gps-active">
            <span>📍</span>
            <span>
              GPS Active: {gpsLocation.latitude.toFixed(6)}, {gpsLocation.longitude.toFixed(6)}
            </span>
            <span className="gps-accuracy">(±{gpsLocation.accuracy.toFixed(0)}m)</span>
          </div>
        ) : (
          <div className="gps-acquiring">
            <span className="spinner-small"></span>
            <span>Acquiring GPS location...</span>
          </div>
        )}
      </div>

      {existingMedia.length > 0 && (
        <div className="media-grid">
          {existingMedia.map((media) => (
            <div key={media.id} className="media-item">
              <div className="media-preview">
                {media.type === 'photo' && (
                  <img src={media.thumbnail || media.url} alt={media.filename} />
                )}
                {media.type === 'video' && (
                  <div className="video-preview">
                    <video src={media.url} />
                    <div className="video-overlay">
                      <span className="play-icon">▶</span>
                      {media.duration && (
                        <span className="video-duration">{formatDuration(media.duration)}</span>
                      )}
                    </div>
                  </div>
                )}
                {media.type === 'audio' && (
                  <div className="audio-preview">
                    <span className="audio-icon">🎵</span>
                    {media.duration && (
                      <span className="audio-duration">{formatDuration(media.duration)}</span>
                    )}
                  </div>
                )}
                {media.type === 'document' && (
                  <div className="document-preview">
                    <span className="document-icon">📄</span>
                  </div>
                )}
              </div>

              <div className="media-info">
                <div className="media-filename">{media.filename}</div>
                <div className="media-meta">
                  <span>{formatFileSize(media.fileSize)}</span>
                  <span>•</span>
                  <span>{new Date(media.metadata.capturedAt).toLocaleString('en-GB')}</span>
                </div>
                <div className="media-gps">
                  📍 {media.gpsData.latitude.toFixed(6)}, {media.gpsData.longitude.toFixed(6)}
                  {media.gpsData.address && <div className="gps-address">{media.gpsData.address}</div>}
                </div>
                <div className="media-custody">
                  🔒 Chain of custody: {media.chainOfCustody.length} {media.chainOfCustody.length === 1 ? 'entry' : 'entries'}
                </div>
              </div>

              <button
                type="button"
                className="media-remove"
                onClick={() => handleRemove(media.id)}
                title="Remove media"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {existingMedia.length === 0 && (
        <div className="media-empty">
          <span className="empty-icon">📷</span>
          <p>No media attached</p>
          <p className="empty-hint">
            Add photos, videos, or documents to support your incident report
          </p>
        </div>
      )}

      <div className="media-upload-info">
        <p>
          <strong>GPS Tagging:</strong> All media is automatically tagged with GPS coordinates,
          timestamp, and device information for legal admissibility.
        </p>
        <p>
          <strong>Chain of Custody:</strong> Every media file maintains a complete chain of custody
          log for evidence integrity.
        </p>
        <p>
          <strong>Supported formats:</strong> Images (JPG, PNG), Videos (MP4, MOV), Audio (MP3, M4A),
          Documents (PDF, DOC)
        </p>
        <p>
          <strong>Max file size:</strong> {maxFileSize}MB per file | <strong>Max files:</strong>{' '}
          {maxFiles} per report
        </p>
      </div>
    </div>
  );
};

export default MediaUpload;
