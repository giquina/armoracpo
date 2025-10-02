import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiEdit2, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { format, differenceInDays } from 'date-fns';
import { SIALicenseSectionProps } from './types';
import { EditProfileModal } from './EditProfileModal';

/**
 * SIALicenseSection Component
 *
 * Displays SIA license information with expiry warnings.
 * Shows license number, type, expiry date, and verification status.
 */
export const SIALicenseSection: React.FC<SIALicenseSectionProps> = ({ cpo, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);

  const expiryDate = new Date(cpo.sia_license_expiry);
  const daysUntilExpiry = differenceInDays(expiryDate, new Date());
  const isExpired = daysUntilExpiry < 0;
  const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 30;

  const getExpiryStatus = () => {
    if (isExpired) {
      return { color: 'var(--armora-danger)', icon: <FiAlertTriangle />, text: 'EXPIRED', bgColor: '#fee2e2' };
    }
    if (isExpiringSoon) {
      return { color: '#92400e', icon: <FiAlertTriangle />, text: `Expires in ${daysUntilExpiry} days`, bgColor: '#fef3c7' };
    }
    return { color: 'var(--armora-success)', icon: <FiCheckCircle />, text: 'Valid', bgColor: '#d1fae5' };
  };

  const status = getExpiryStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card"
      style={{ marginBottom: 'var(--armora-space-md)' }}
    >
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--armora-space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--armora-space-sm)' }}>
          <FiShield size={20} color="var(--armora-navy)" />
          <h3>SIA License Information</h3>
        </div>
        <button onClick={() => setIsEditing(true)} className="btn-sm btn-outline-navy">
          <FiEdit2 size={14} />
          Edit
        </button>
      </div>

      {/* Expiry Status Banner */}
      {(isExpired || isExpiringSoon) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--armora-space-sm)',
            padding: 'var(--armora-space-md)',
            backgroundColor: status.bgColor,
            borderRadius: 'var(--armora-radius-md)',
            marginBottom: 'var(--armora-space-md)',
          }}
        >
          <span style={{ color: status.color }}>{status.icon}</span>
          <div>
            <p style={{ fontWeight: 'var(--armora-weight-semibold)', color: status.color }}>
              {status.text}
            </p>
            <p style={{ fontSize: 'var(--armora-text-sm)', color: status.color }}>
              {isExpired ? 'Please renew your license immediately' : 'Please renew your license soon'}
            </p>
          </div>
        </div>
      )}

      {/* License Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--armora-space-md)' }}>
        <div>
          <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)', marginBottom: 'var(--armora-space-xs)' }}>
            License Number
          </p>
          <p style={{ fontWeight: 'var(--armora-weight-semibold)', fontFamily: 'monospace', fontSize: 'var(--armora-text-lg)' }}>
            {cpo.sia_license_number}
          </p>
        </div>

        <div>
          <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)', marginBottom: 'var(--armora-space-xs)' }}>
            License Type
          </p>
          <p style={{ fontWeight: 'var(--armora-weight-medium)', textTransform: 'uppercase' }}>
            {cpo.sia_license_type}
          </p>
        </div>

        <div>
          <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)', marginBottom: 'var(--armora-space-xs)' }}>
            Expiry Date
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--armora-space-sm)' }}>
            <p style={{ fontWeight: 'var(--armora-weight-medium)' }}>
              {format(expiryDate, 'PPP')}
            </p>
            <span
              className="badge"
              style={{
                backgroundColor: status.bgColor,
                color: status.color,
              }}
            >
              {status.text}
            </span>
          </div>
        </div>

        <div>
          <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)', marginBottom: 'var(--armora-space-xs)' }}>
            Verification Status
          </p>
          <span
            className={`badge badge-${cpo.verification_status === 'verified' ? 'success' : cpo.verification_status === 'pending' ? 'warning' : 'danger'}`}
          >
            {cpo.verification_status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Edit Modal */}
      <EditProfileModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit SIA License"
        fields={[
          {
            name: 'sia_license_number',
            label: 'License Number',
            type: 'text',
            required: true,
            placeholder: 'e.g., 1234567890123456',
          },
          {
            name: 'sia_license_type',
            label: 'License Type',
            type: 'select',
            required: true,
            options: [
              { value: 'close_protection', label: 'Close Protection' },
              { value: 'security_guard', label: 'Security Guard' },
              { value: 'door_supervisor', label: 'Door Supervisor' },
              { value: 'cctv_operator', label: 'CCTV Operator' },
            ],
          },
          {
            name: 'sia_license_expiry',
            label: 'Expiry Date',
            type: 'date',
            required: true,
          },
        ]}
        initialValues={{
          sia_license_number: cpo.sia_license_number,
          sia_license_type: cpo.sia_license_type,
          sia_license_expiry: cpo.sia_license_expiry,
        }}
        onSave={onUpdate}
      />
    </motion.div>
  );
};

export default SIALicenseSection;
