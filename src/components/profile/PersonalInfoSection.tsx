import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import { format } from 'date-fns';
import { PersonalInfoSectionProps } from './types';
import { EditProfileModal } from './EditProfileModal';

/**
 * PersonalInfoSection Component
 *
 * Displays and allows editing of personal information:
 * - Name, email, phone
 * - Date of birth
 * - Address
 * - Emergency contact
 */
export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ cpo, onUpdate }) => {
  const [editMode, setEditMode] = useState<'personal' | 'address' | 'emergency' | null>(null);

  const handleEditPersonal = () => setEditMode('personal');
  const handleEditAddress = () => setEditMode('address');
  const handleEditEmergency = () => setEditMode('emergency');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card"
      style={{ marginBottom: 'var(--armora-space-md)' }}
    >
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--armora-space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--armora-space-sm)' }}>
          <FiUser size={20} color="var(--armora-navy)" />
          <h3>Personal Information</h3>
        </div>
      </div>

      {/* Contact Details */}
      <div style={{ marginBottom: 'var(--armora-space-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--armora-space-md)' }}>
          <h4 style={{ fontSize: 'var(--armora-text-base)', fontWeight: 'var(--armora-weight-semibold)' }}>
            Contact Details
          </h4>
          <button onClick={handleEditPersonal} className="btn-sm btn-outline-navy">
            <FiEdit2 size={14} />
            Edit
          </button>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 'var(--armora-space-md)' }}>
          <InfoRow icon={<FiUser size={16} />} label="Full Name" value={`${cpo.first_name} ${cpo.last_name}`} />
          <InfoRow icon={<FiMail size={16} />} label="Email" value={cpo.email} />
          <InfoRow icon={<FiPhone size={16} />} label="Phone" value={cpo.phone} />
          <InfoRow
            icon={<FiCalendar size={16} />}
            label="Date of Birth"
            value={format(new Date(cpo.date_of_birth), 'PPP')}
          />
        </div>
      </div>

      {/* Address */}
      <div style={{ marginBottom: 'var(--armora-space-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--armora-space-md)' }}>
          <h4 style={{ fontSize: 'var(--armora-text-base)', fontWeight: 'var(--armora-weight-semibold)' }}>
            Address
          </h4>
          <button onClick={handleEditAddress} className="btn-sm btn-outline-navy">
            <FiEdit2 size={14} />
            Edit
          </button>
        </div>

        <InfoRow
          icon={<FiMapPin size={16} />}
          label="Address"
          value={
            <>
              {cpo.address_line1}
              <br />
              {cpo.address_line2 && <>{cpo.address_line2}<br /></>}
              {cpo.city}, {cpo.postcode}
              <br />
              {cpo.country}
            </>
          }
        />
      </div>

      {/* Emergency Contact */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--armora-space-md)' }}>
          <h4 style={{ fontSize: 'var(--armora-text-base)', fontWeight: 'var(--armora-weight-semibold)' }}>
            Emergency Contact
          </h4>
          <button onClick={handleEditEmergency} className="btn-sm btn-outline-navy">
            <FiEdit2 size={14} />
            Edit
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--armora-space-sm)', padding: 'var(--armora-space-md)', backgroundColor: '#fef3c7', borderRadius: 'var(--armora-radius-md)' }}>
          <FiAlertCircle size={18} color="#92400e" />
          <div>
            <p style={{ fontWeight: 'var(--armora-weight-semibold)', color: '#92400e' }}>
              {cpo.emergency_contact_name}
            </p>
            <p style={{ fontSize: 'var(--armora-text-sm)', color: '#92400e' }}>
              {cpo.emergency_contact_phone}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Modals */}
      <EditProfileModal
        isOpen={editMode === 'personal'}
        onClose={() => setEditMode(null)}
        title="Edit Contact Details"
        fields={[
          { name: 'first_name', label: 'First Name', type: 'text', required: true },
          { name: 'last_name', label: 'Last Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'phone', label: 'Phone', type: 'tel', required: true },
          { name: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
        ]}
        initialValues={{
          first_name: cpo.first_name,
          last_name: cpo.last_name,
          email: cpo.email,
          phone: cpo.phone,
          date_of_birth: cpo.date_of_birth,
        }}
        onSave={onUpdate}
      />

      <EditProfileModal
        isOpen={editMode === 'address'}
        onClose={() => setEditMode(null)}
        title="Edit Address"
        fields={[
          { name: 'address_line1', label: 'Address Line 1', type: 'text', required: true },
          { name: 'address_line2', label: 'Address Line 2', type: 'text' },
          { name: 'city', label: 'City', type: 'text', required: true },
          { name: 'postcode', label: 'Postcode', type: 'text', required: true },
          { name: 'country', label: 'Country', type: 'text', required: true },
        ]}
        initialValues={{
          address_line1: cpo.address_line1,
          address_line2: cpo.address_line2,
          city: cpo.city,
          postcode: cpo.postcode,
          country: cpo.country,
        }}
        onSave={onUpdate}
      />

      <EditProfileModal
        isOpen={editMode === 'emergency'}
        onClose={() => setEditMode(null)}
        title="Edit Emergency Contact"
        fields={[
          { name: 'emergency_contact_name', label: 'Name', type: 'text', required: true },
          { name: 'emergency_contact_phone', label: 'Phone', type: 'tel', required: true },
        ]}
        initialValues={{
          emergency_contact_name: cpo.emergency_contact_name,
          emergency_contact_phone: cpo.emergency_contact_phone,
        }}
        onSave={onUpdate}
      />
    </motion.div>
  );
};

// Helper component for info rows
const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
  <div style={{ display: 'flex', gap: 'var(--armora-space-sm)' }}>
    <div style={{ color: 'var(--armora-text-secondary)', marginTop: '2px' }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)', marginBottom: 'var(--armora-space-xs)' }}>
        {label}
      </p>
      <p style={{ fontWeight: 'var(--armora-weight-medium)' }}>{value}</p>
    </div>
  </div>
);

export default PersonalInfoSection;
