import React from 'react';
import { differenceInDays, format } from 'date-fns';
import { FiUpload, FiDownload } from 'react-icons/fi';
import './DocumentExpiryCard.css';

export interface Document {
  id: string;
  name: string;
  type: string;
  expiryDate: string;
  documentUrl?: string;
}

interface DocumentExpiryCardProps {
  document: Document;
  onUpload?: (documentId: string) => void;
  onDownload?: (documentUrl: string) => void;
}

const DocumentExpiryCard: React.FC<DocumentExpiryCardProps> = ({
  document,
  onUpload,
  onDownload
}) => {
  const expiryDate = new Date(document.expiryDate);
  const daysUntilExpiry = differenceInDays(expiryDate, new Date());
  const isExpired = daysUntilExpiry < 0;
  const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 30;

  const getStatus = () => {
    if (isExpired) return 'expired';
    if (isExpiringSoon) return 'expiring';
    return 'valid';
  };

  const getStatusLabel = () => {
    if (isExpired) return 'EXPIRED';
    if (isExpiringSoon) return 'EXPIRING SOON';
    return 'VALID';
  };

  const getStatusColor = () => {
    if (isExpired) return 'danger';
    if (isExpiringSoon) return 'warning';
    return 'success';
  };

  const getDaysText = () => {
    if (isExpired) {
      return `Expired ${Math.abs(daysUntilExpiry)} days ago`;
    }
    return `${daysUntilExpiry} days remaining`;
  };

  return (
    <div className={`document-expiry-card document-expiry-card--${getStatus()}`}>
      <div className="document-expiry-card__header">
        <div className="document-expiry-card__icon">
          {document.type === 'sia_license' && '🛡️'}
          {document.type === 'dbs_check' && '📋'}
          {document.type === 'insurance' && '🏥'}
          {document.type === 'first_aid' && '⚕️'}
          {document.type === 'firearms' && '🔫'}
        </div>
        <div className="document-expiry-card__title">
          <h4>{document.name}</h4>
          <span className={`badge badge-${getStatusColor()}`}>
            {getStatusLabel()}
          </span>
        </div>
      </div>

      <div className="document-expiry-card__details">
        <div className="document-expiry-card__detail">
          <span className="document-expiry-card__detail-label">Expiry Date</span>
          <span className="document-expiry-card__detail-value">
            {format(expiryDate, 'PPP')}
          </span>
        </div>

        <div className="document-expiry-card__detail">
          <span className="document-expiry-card__detail-label">Status</span>
          <span className={`document-expiry-card__detail-value document-expiry-card__detail-value--${getStatus()}`}>
            {getDaysText()}
          </span>
        </div>
      </div>

      <div className="document-expiry-card__actions">
        {document.documentUrl && onDownload && (
          <button
            className="document-expiry-card__action document-expiry-card__action--secondary"
            onClick={() => onDownload(document.documentUrl!)}
          >
            <FiDownload size={16} />
            <span>View</span>
          </button>
        )}
        {onUpload && (
          <button
            className={`document-expiry-card__action document-expiry-card__action--${isExpired || isExpiringSoon ? 'danger' : 'primary'}`}
            onClick={() => onUpload(document.id)}
          >
            <FiUpload size={16} />
            <span>{isExpired || isExpiringSoon ? 'Renew' : 'Update'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentExpiryCard;
