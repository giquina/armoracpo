import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt, FaFile, FaTimes } from 'react-icons/fa';
import { IconButton } from './IconButton';
import { ProgressBar } from './ProgressBar';
import './FormFileUpload.css';
import { IconWrapper } from '../../utils/IconWrapper';

export interface FormFileUploadProps {
  accept?: string;
  onUpload: (files: File[]) => Promise<void> | void;
  maxSize?: number; // bytes
  multiple?: boolean;
  label?: string;
  error?: string;
  className?: string;
}

export const FormFileUpload: React.FC<FormFileUploadProps> = ({
  accept,
  onUpload,
  maxSize = 5 * 1024 * 1024, // 5MB default
  multiple = false,
  label,
  error,
  className = '',
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | undefined>(error);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: accept ? { [accept]: [] } : undefined,
    maxSize,
    multiple,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          setUploadError(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
        } else {
          setUploadError('Invalid file type');
        }
        return;
      }

      setFiles(acceptedFiles);
      setUploadError(undefined);
      handleUpload(acceptedFiles);
    },
  });

  const handleUpload = async (filesToUpload: File[]) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress (replace with actual upload progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onUpload(filesToUpload);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploading(false);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadProgress(0);
  };

  const containerClasses = [
    'armora-file-upload__wrapper',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const dropzoneClasses = [
    'armora-file-upload__dropzone',
    isDragActive && 'armora-file-upload__dropzone--active',
    uploadError && 'armora-file-upload__dropzone--error',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      {label && <label className="armora-file-upload__label">{label}</label>}
      <div {...getRootProps()} className={dropzoneClasses}>
        <input {...getInputProps()} />
        <div className="armora-file-upload__content">
          <IconWrapper icon={FaCloudUploadAlt} className="armora-file-upload__icon"/>
          {isDragActive ? (
            <p className="armora-file-upload__text">Drop files here...</p>
          ) : (
            <>
              <p className="armora-file-upload__text">
                Drag & drop files here, or click to select
              </p>
              <p className="armora-file-upload__hint">
                Maximum file size: {maxSize / (1024 * 1024)}MB
              </p>
            </>
          )}
        </div>
      </div>

      {files.length > 0 && (
        <div className="armora-file-upload__files">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="armora-file-upload__file">
              <IconWrapper icon={FaFile} className="armora-file-upload__file-icon"/>
              <div className="armora-file-upload__file-info">
                <p className="armora-file-upload__file-name">{file.name}</p>
                <p className="armora-file-upload__file-size">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              {!uploading && (
                <IconButton
                  icon={<IconWrapper icon={FaTimes} />}
                  onClick={() => handleRemoveFile(index)}
                  variant="ghost"
                  aria-label="Remove file"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="armora-file-upload__progress">
          <ProgressBar value={uploadProgress} showLabel />
        </div>
      )}

      {uploadError && <p className="armora-file-upload__error">{uploadError}</p>}
    </div>
  );
};
