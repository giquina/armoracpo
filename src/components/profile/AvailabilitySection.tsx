import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiToggleLeft, FiToggleRight, FiClock, FiMap, FiTruck } from 'react-icons/fi';
import { AvailabilitySectionProps } from './types';
import { authService } from '../../services/authService';
import { IconWrapper } from '../../utils/IconWrapper';

/**
 * AvailabilitySection Component
 *
 * Controls CPO operational status, working hours, travel radius, and vehicle details.
 */
export const AvailabilitySection: React.FC<AvailabilitySectionProps> = ({ cpo, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleAvailability = async () => {
    try {
      setIsUpdating(true);
      await authService.updateAvailability(cpo.id, !cpo.is_available);
      await onUpdate({ is_available: !cpo.is_available });
    } catch (error: any) {
      console.error('Failed to update availability:', error);
      alert(error.message || 'Failed to update availability');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="card"
      style={{ marginBottom: 'var(--armora-space-md)' }}
    >
      {/* Section Header */}
      <div style={{ marginBottom: 'var(--armora-space-md)' }}>
        <h3 style={{ marginBottom: 'var(--armora-space-xs)' }}>Availability & Status</h3>
        <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>
          Manage your operational status and preferences
        </p>
      </div>

      {/* Availability Toggle */}
      <div
        style={{
          padding: 'var(--armora-space-md)',
          backgroundColor: cpo.is_available ? '#d1fae5' : '#f3f4f6',
          borderRadius: 'var(--armora-radius-md)',
          marginBottom: 'var(--armora-space-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontWeight: 'var(--armora-weight-semibold)', color: cpo.is_available ? '#065f46' : '#4b5563', marginBottom: 'var(--armora-space-xs)' }}>
              {cpo.is_available ? 'Operational' : 'Stand Down'}
            </p>
            <p style={{ fontSize: 'var(--armora-text-sm)', color: cpo.is_available ? '#065f46' : '#6b7280' }}>
              {cpo.is_available ? 'You are available for assignments' : 'You are not accepting assignments'}
            </p>
          </div>
          <button
            onClick={handleToggleAvailability}
            disabled={isUpdating}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              padding: 0,
              minHeight: 'unset',
            }}
            aria-label={cpo.is_available ? 'Go stand down' : 'Go operational'}
          >
            {isUpdating ? (
              <div className="spinner" style={{ width: 32, height: 32, borderWidth: 2 }} />
            ) : cpo.is_available ? (
              <IconWrapper icon={FiToggleRight} size={48} color="var(--armora-success)"/>
            ) : (
              <IconWrapper icon={FiToggleLeft} size={48} color="var(--armora-text-tertiary)"/>
            )}
          </button>
        </div>
      </div>

      {/* Working Preferences */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--armora-space-md)' }}>
        {/* Travel Radius (Mock Data) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--armora-space-sm)', marginBottom: 'var(--armora-space-xs)' }}>
            <IconWrapper icon={FiMap} size={16} color="var(--armora-navy)"/>
            <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>
              Travel Radius
            </p>
          </div>
          <p style={{ fontWeight: 'var(--armora-weight-medium)', marginLeft: '24px' }}>
            50 km
          </p>
        </div>

        {/* Working Hours (Mock Data) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--armora-space-sm)', marginBottom: 'var(--armora-space-xs)' }}>
            <IconWrapper icon={FiClock} size={16} color="var(--armora-navy)"/>
            <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>
              Preferred Working Hours
            </p>
          </div>
          <p style={{ fontWeight: 'var(--armora-weight-medium)', marginLeft: '24px' }}>
            Flexible (24/7)
          </p>
        </div>

        {/* Vehicle Details */}
        {cpo.vehicle_make && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--armora-space-sm)', marginBottom: 'var(--armora-space-xs)' }}>
              <IconWrapper icon={FiTruck} size={16} color="var(--armora-navy)"/>
              <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>
                Vehicle
              </p>
            </div>
            <p style={{ fontWeight: 'var(--armora-weight-medium)', marginLeft: '24px' }}>
              {cpo.vehicle_make} {cpo.vehicle_model} ({cpo.vehicle_color})
              {cpo.vehicle_registration && (
                <span style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)', marginLeft: 'var(--armora-space-sm)' }}>
                  {cpo.vehicle_registration}
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AvailabilitySection;
