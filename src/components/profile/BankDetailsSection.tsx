import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiEdit2, FiCheckCircle, FiCreditCard } from 'react-icons/fi';
import { BankDetailsSectionProps } from './types';
import { EditProfileModal } from './EditProfileModal';
import { IconWrapper } from '../../utils/IconWrapper';

/**
 * BankDetailsSection Component
 *
 * Displays and manages bank account details for payment processing.
 */
export const BankDetailsSection: React.FC<BankDetailsSectionProps> = ({ cpo, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);

  const maskAccountNumber = (accountNumber?: string) => {
    if (!accountNumber) return 'Not set';
    return `**** **** ${accountNumber.slice(-4)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="card"
      style={{ marginBottom: 'var(--armora-space-md)' }}
    >
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--armora-space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--armora-space-sm)' }}>
          <IconWrapper icon={FiDollarSign} size={20} color="var(--armora-navy)"/>
          <h3>Payment Details</h3>
        </div>
        <button onClick={() => setIsEditing(true)} className="btn-sm btn-outline-navy">
          <IconWrapper icon={FiEdit2} size={14}/>
          Edit
        </button>
      </div>

      {/* Stripe Connect Status (Mock) */}
      <div
        style={{
          padding: 'var(--armora-space-md)',
          backgroundColor: '#d1fae5',
          borderRadius: 'var(--armora-radius-md)',
          marginBottom: 'var(--armora-space-md)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--armora-space-sm)',
        }}
      >
        <IconWrapper icon={FiCheckCircle} size={20} color="#065f46"/>
        <div>
          <p style={{ fontWeight: 'var(--armora-weight-semibold)', color: '#065f46', marginBottom: 'var(--armora-space-xs)' }}>
            Stripe Connected
          </p>
          <p style={{ fontSize: 'var(--armora-text-sm)', color: '#065f46' }}>
            Your payment account is active and verified
          </p>
        </div>
      </div>

      {/* Bank Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--armora-space-md)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--armora-space-sm)', marginBottom: 'var(--armora-space-xs)' }}>
            <IconWrapper icon={FiCreditCard} size={16} color="var(--armora-navy)"/>
            <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>
              Account Holder
            </p>
          </div>
          <p style={{ fontWeight: 'var(--armora-weight-medium)', marginLeft: '24px' }}>
            {cpo.bank_account_name || 'Not set'}
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--armora-space-sm)', marginBottom: 'var(--armora-space-xs)' }}>
            <IconWrapper icon={FiCreditCard} size={16} color="var(--armora-navy)"/>
            <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>
              Account Number
            </p>
          </div>
          <p style={{ fontWeight: 'var(--armora-weight-medium)', marginLeft: '24px', fontFamily: 'monospace' }}>
            {maskAccountNumber(cpo.bank_account_number)}
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--armora-space-sm)', marginBottom: 'var(--armora-space-xs)' }}>
            <IconWrapper icon={FiCreditCard} size={16} color="var(--armora-navy)"/>
            <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>
              Sort Code
            </p>
          </div>
          <p style={{ fontWeight: 'var(--armora-weight-medium)', marginLeft: '24px', fontFamily: 'monospace' }}>
            {cpo.bank_sort_code || 'Not set'}
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--armora-space-sm)', marginBottom: 'var(--armora-space-xs)' }}>
            <IconWrapper icon={FiCreditCard} size={16} color="var(--armora-navy)"/>
            <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>
              National Insurance Number
            </p>
          </div>
          <p style={{ fontWeight: 'var(--armora-weight-medium)', marginLeft: '24px', fontFamily: 'monospace' }}>
            {cpo.national_insurance_number || 'Not set'}
          </p>
        </div>
      </div>

      {/* Edit Modal */}
      <EditProfileModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Payment Details"
        fields={[
          {
            name: 'bank_account_name',
            label: 'Account Holder Name',
            type: 'text',
            required: true,
          },
          {
            name: 'bank_account_number',
            label: 'Account Number',
            type: 'text',
            required: true,
            placeholder: '12345678',
          },
          {
            name: 'bank_sort_code',
            label: 'Sort Code',
            type: 'text',
            required: true,
            placeholder: '12-34-56',
          },
          {
            name: 'national_insurance_number',
            label: 'National Insurance Number',
            type: 'text',
            required: true,
            placeholder: 'AB123456C',
          },
        ]}
        initialValues={{
          bank_account_name: cpo.bank_account_name,
          bank_account_number: cpo.bank_account_number,
          bank_sort_code: cpo.bank_sort_code,
          national_insurance_number: cpo.national_insurance_number,
        }}
        onSave={onUpdate}
      />
    </motion.div>
  );
};

export default BankDetailsSection;
