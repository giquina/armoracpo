import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { FiUpload, FiX, FiCheck } from 'react-icons/fi';
import { AvatarUploadProps } from './types';
import { supabase } from '../../lib/supabase';
import { IconWrapper } from '../../utils/IconWrapper';

/**
 * AvatarUpload Component
 *
 * Modal for uploading and cropping profile avatars.
 * Features drag-and-drop, image preview, and cropping with react-image-crop.
 */
export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  onClose,
  onUploadComplete,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      setError('Please select a valid image file');
      return;
    }

    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  // Generate cropped image blob
  const getCroppedImg = useCallback(async (): Promise<Blob | null> => {
    if (!completedCrop || !imgRef.current) return null;

    const canvas = document.createElement('canvas');
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  }, [completedCrop]);

  // Upload cropped image to Supabase storage
  const handleUpload = async () => {
    try {
      setUploading(true);
      setError(null);

      const croppedBlob = await getCroppedImg();
      if (!croppedBlob) {
        setError('Failed to process image');
        return;
      }

      // Generate unique filename
      const fileName = `avatar-${Date.now()}.jpg`;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const filePath = `avatars/${user.id}/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, croppedBlob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) throw new Error('Failed to get public URL');

      // Update CPO profile with new avatar URL
      const { error: updateError } = await supabase
        .from('protection_officers')
        .update({ profile_photo_url: urlData.publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      onUploadComplete(urlData.publicUrl);
      onClose();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--armora-space-md)',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'var(--armora-bg-primary)',
            borderRadius: 'var(--armora-radius-lg)',
            maxWidth: 500,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: 'var(--armora-shadow-xl)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--armora-space-md)',
              borderBottom: '1px solid var(--armora-border-light)',
            }}
          >
            <h3>Upload Profile Photo</h3>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--armora-radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--armora-bg-secondary)',
              }}
              aria-label="Close"
            >
              <IconWrapper icon={FiX} size={18} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: 'var(--armora-space-md)' }}>
            {!imageSrc ? (
              // Dropzone
              <div
                {...getRootProps()}
                style={{
                  border: `2px dashed ${isDragActive ? 'var(--armora-navy)' : 'var(--armora-border-medium)'}`,
                  borderRadius: 'var(--armora-radius-md)',
                  padding: 'var(--armora-space-2xl)',
                  textAlign: 'center',
                  backgroundColor: isDragActive ? 'rgba(10, 31, 68, 0.05)' : 'var(--armora-bg-secondary)',
                  cursor: 'pointer',
                  transition: 'var(--armora-transition-base)',
                }}
              >
                <input {...getInputProps()} />
                <IconWrapper icon={FiUpload} size={48} color="var(--armora-navy)" style={{ marginBottom: 'var(--armora-space-md)' }}/>
                <p style={{ fontSize: 'var(--armora-text-lg)', fontWeight: 'var(--armora-weight-medium)', marginBottom: 'var(--armora-space-sm)' }}>
                  {isDragActive ? 'Drop image here' : 'Drag & drop or click to select'}
                </p>
                <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>
                  JPG, PNG or WebP (max 5MB)
                </p>
              </div>
            ) : (
              // Crop Tool
              <div>
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Crop preview"
                    style={{ maxWidth: '100%', borderRadius: 'var(--armora-radius-md)' }}
                  />
                </ReactCrop>

                <div style={{ marginTop: 'var(--armora-space-md)', display: 'flex', gap: 'var(--armora-space-sm)' }}>
                  <button
                    onClick={() => setImageSrc(null)}
                    className="btn-secondary btn-full"
                  >
                    Choose Different Image
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div
                style={{
                  marginTop: 'var(--armora-space-md)',
                  padding: 'var(--armora-space-md)',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  borderRadius: 'var(--armora-radius-md)',
                  fontSize: 'var(--armora-text-sm)',
                }}
              >
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          {imageSrc && (
            <div
              style={{
                padding: 'var(--armora-space-md)',
                borderTop: '1px solid var(--armora-border-light)',
                display: 'flex',
                gap: 'var(--armora-space-sm)',
              }}
            >
              <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="btn-primary"
                disabled={uploading || !completedCrop}
                style={{ flex: 1 }}
              >
                {uploading ? (
                  <>
                    <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Uploading...
                  </>
                ) : (
                  <>
                    <IconWrapper icon={FiCheck} size={18}/>
                    Save Photo
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AvatarUpload;
