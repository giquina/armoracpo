import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { FiFile, FiUpload, FiDownload, FiTrash2, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { format } from 'date-fns';
import { DocumentsSectionProps, Document } from './types';
import { supabase } from '../../lib/supabase';

/**
 * DocumentsSection Component
 *
 * Manage and upload compliance documents (DBS, insurance, certifications).
 */
export const DocumentsSection: React.FC<DocumentsSectionProps> = ({ cpo, onUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([
    // Mock data - in real app, fetch from database
    {
      id: '1',
      type: 'dbs_check',
      name: 'DBS Check Certificate.pdf',
      url: '#',
      uploadedAt: '2024-01-15',
      expiryDate: '2027-01-15',
    },
    {
      id: '2',
      type: 'insurance',
      name: 'Professional Indemnity Insurance.pdf',
      url: '#',
      uploadedAt: '2024-03-01',
      expiryDate: '2025-03-01',
    },
  ]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    try {
      setUploading(true);
      const file = acceptedFiles[0];

      // Generate unique filename
      const fileName = `${Date.now()}-${file.name}`;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const filePath = `documents/${user.id}/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('cpo-documents')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('cpo-documents')
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) throw new Error('Failed to get public URL');

      // Add to documents list (in real app, save to database)
      const newDoc: Document = {
        id: Date.now().toString(),
        type: 'training_cert',
        name: file.name,
        url: urlData.publicUrl,
        uploadedAt: new Date().toISOString(),
      };

      setDocuments((prev) => [...prev, newDoc]);
      onUpdate();
      alert('Document uploaded successfully');
    } catch (err: any) {
      console.error('Upload error:', err);
      alert(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  }, [onUpdate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleDelete = async (docId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    // In real app, delete from storage and database
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    onUpdate();
  };

  const getDocumentIcon = (type: Document['type']) => {
    switch (type) {
      case 'dbs_check':
        return <FiCheckCircle size={20} color="var(--armora-success)" />;
      case 'insurance':
        return <FiCheckCircle size={20} color="var(--armora-info)" />;
      default:
        return <FiFile size={20} color="var(--armora-navy)" />;
    }
  };

  const getDocumentTypeLabel = (type: Document['type']) => {
    const labels = {
      dbs_check: 'DBS Check',
      insurance: 'Insurance',
      training_cert: 'Training Certificate',
      sia_license: 'SIA License',
    };
    return labels[type];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="card"
      style={{ marginBottom: 'var(--armora-space-md)' }}
    >
      {/* Section Header */}
      <div style={{ marginBottom: 'var(--armora-space-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--armora-space-sm)', marginBottom: 'var(--armora-space-xs)' }}>
          <FiFile size={20} color="var(--armora-navy)" />
          <h3>Documents & Certifications</h3>
        </div>
        <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>
          Upload and manage compliance documents
        </p>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${isDragActive ? 'var(--armora-navy)' : 'var(--armora-border-medium)'}`,
          borderRadius: 'var(--armora-radius-md)',
          padding: 'var(--armora-space-xl)',
          textAlign: 'center',
          backgroundColor: isDragActive ? 'rgba(10, 31, 68, 0.05)' : 'var(--armora-bg-secondary)',
          cursor: uploading ? 'not-allowed' : 'pointer',
          transition: 'var(--armora-transition-base)',
          marginBottom: 'var(--armora-space-lg)',
        }}
      >
        <input {...getInputProps()} disabled={uploading} />
        {uploading ? (
          <div className="spinner" style={{ margin: '0 auto', marginBottom: 'var(--armora-space-md)' }} />
        ) : (
          <FiUpload size={32} color="var(--armora-navy)" style={{ marginBottom: 'var(--armora-space-md)' }} />
        )}
        <p style={{ fontWeight: 'var(--armora-weight-medium)', marginBottom: 'var(--armora-space-sm)' }}>
          {uploading ? 'Uploading...' : isDragActive ? 'Drop file here' : 'Drag & drop or click to upload'}
        </p>
        <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>
          PDF, JPG or PNG (max 10MB)
        </p>
      </div>

      {/* Documents List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--armora-space-md)' }}>
        {documents.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--armora-text-secondary)', padding: 'var(--armora-space-xl)' }}>
            No documents uploaded yet
          </p>
        ) : (
          documents.map((doc) => {
            const isExpiring = doc.expiryDate && new Date(doc.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();

            return (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--armora-space-md)',
                  backgroundColor: 'var(--armora-bg-secondary)',
                  borderRadius: 'var(--armora-radius-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--armora-space-md)', flex: 1 }}>
                  {getDocumentIcon(doc.type)}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--armora-space-sm)', marginBottom: 'var(--armora-space-xs)' }}>
                      <p style={{ fontWeight: 'var(--armora-weight-semibold)' }}>{doc.name}</p>
                      {isExpired && (
                        <span className="badge badge-danger" style={{ fontSize: '10px' }}>
                          EXPIRED
                        </span>
                      )}
                      {isExpiring && !isExpired && (
                        <span className="badge badge-warning" style={{ fontSize: '10px' }}>
                          EXPIRING SOON
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>
                      {getDocumentTypeLabel(doc.type)} • Uploaded {format(new Date(doc.uploadedAt), 'PP')}
                      {doc.expiryDate && ` • Expires ${format(new Date(doc.expiryDate), 'PP')}`}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--armora-space-sm)' }}>
                  <button
                    onClick={() => window.open(doc.url, '_blank')}
                    style={{
                      padding: 'var(--armora-space-sm)',
                      borderRadius: 'var(--armora-radius-md)',
                      backgroundColor: 'var(--armora-bg-primary)',
                      minHeight: 'unset',
                    }}
                    aria-label="Download"
                  >
                    <FiDownload size={16} color="var(--armora-navy)" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    style={{
                      padding: 'var(--armora-space-sm)',
                      borderRadius: 'var(--armora-radius-md)',
                      backgroundColor: 'var(--armora-bg-primary)',
                      minHeight: 'unset',
                    }}
                    aria-label="Delete"
                  >
                    <FiTrash2 size={16} color="var(--armora-danger)" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default DocumentsSection;
