import React, { useState, useRef, useEffect } from 'react';
import { IncidentMediaAttachment } from '../../types';
import { incidentService } from '../../services/incidentService';
import { supabase } from '../../lib/supabase';
import './IncidentMediaUpload.css';

interface IncidentMediaUploadProps {
  reportId: string;
  onUploadComplete: (media: IncidentMediaAttachment) => void;
  onClose: () => void;
}

export const IncidentMediaUpload: React.FC<IncidentMediaUploadProps> = ({
  reportId,
  onUploadComplete,
  onClose,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Get GPS coordinates
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.error('GPS error:', error);
          setError('Unable to capture GPS coordinates');
        }
      );
    }
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else if (selectedFile.type.startsWith('video/')) {
      setPreview('🎥'); // Video icon
    } else {
      setPreview('📎'); // Document icon
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!gpsCoordinates) {
      setError('GPS coordinates not available. Please enable location services.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: cpoData } = await supabase
        .from('protection_officers')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!cpoData) throw new Error('CPO profile not found');

      const mediaAttachment = await incidentService.uploadMediaAttachment(
        file,
        reportId,
        cpoData.id,
        gpsCoordinates,
        description
      );

      onUploadComplete(mediaAttachment);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="media-upload-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Upload Media Evidence</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">{error}</div>
          )}

          <div className="upload-options">
            <button
              className="upload-btn"
              onClick={() => cameraInputRef.current?.click()}
            >
              📷 Take Photo
            </button>
            <button
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              📁 Choose File
            </button>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />

          {file && (
            <div className="file-preview">
              <div className="preview-container">
                {preview && preview.startsWith('data:') ? (
                  <img src={preview} alt="Preview" className="preview-image" />
                ) : (
                  <div className="preview-icon">{preview}</div>
                )}
              </div>
              <div className="file-info">
                <strong>{file.name}</strong>
                <small>{(file.size / 1024 / 1024).toFixed(2)} MB</small>
              </div>
            </div>
          )}

          {gpsCoordinates && (
            <div className="gps-info">
              <strong>📍 GPS Coordinates:</strong>
              <small>
                {gpsCoordinates.latitude.toFixed(6)}, {gpsCoordinates.longitude.toFixed(6)}
                (±{gpsCoordinates.accuracy.toFixed(0)}m)
              </small>
            </div>
          )}

          <div className="form-group">
            <label>Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this evidence shows..."
              rows={3}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={uploading}>
            Cancel
          </button>
          <button
            className="btn-upload"
            onClick={handleUpload}
            disabled={!file || uploading || !gpsCoordinates}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentMediaUpload;
