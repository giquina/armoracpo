import React from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiStar, FiCheckCircle } from 'react-icons/fi';
import { ProfileHeaderProps } from './types';
import { IconWrapper } from '../../utils/IconWrapper';

/**
 * ProfileHeader Component
 *
 * Displays CPO avatar, name, SIA license, rating, and verification badge
 * with navy gradient background for professional appearance.
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ cpo, onEditAvatar }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <IconWrapper icon={FiStar} key={i}
        size={16}
        color={i < Math.floor(rating) ? 'var(--armora-gold)' : 'rgba(255,255,255,0.5)'}/>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'linear-gradient(135deg, var(--armora-navy) 0%, var(--armora-navy-light) 100%)',
        color: 'var(--armora-text-inverse)',
        padding: 'var(--armora-space-xl) var(--armora-space-md)',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      {/* Avatar with Edit Button */}
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 'var(--armora-space-md)' }}>
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 'var(--armora-radius-full)',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '4px solid var(--armora-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            overflow: 'hidden',
            boxShadow: 'var(--armora-shadow-xl)',
          }}
        >
          {cpo.profile_photo_url ? (
            <img
              src={cpo.profile_photo_url}
              alt={`${cpo.first_name} ${cpo.last_name}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span>{cpo.first_name.charAt(0)}{cpo.last_name.charAt(0)}</span>
          )}
        </div>

        {/* Edit Avatar Button */}
        <button
          onClick={onEditAvatar}
          className="btn-gold btn-sm"
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 36,
            height: 36,
            borderRadius: 'var(--armora-radius-full)',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'unset',
            boxShadow: 'var(--armora-shadow-md)',
          }}
          aria-label="Edit avatar"
        >
          <IconWrapper icon={FiEdit2} size={16}/>
        </button>
      </div>

      {/* CPO Name */}
      <h1 style={{ fontSize: 'var(--armora-text-2xl)', marginBottom: 'var(--armora-space-xs)', fontFamily: 'var(--armora-font-display)' }}>
        {cpo.first_name} {cpo.last_name}
      </h1>

      {/* Professional Title */}
      <p style={{ fontSize: 'var(--armora-text-sm)', opacity: 0.9, marginBottom: 'var(--armora-space-sm)' }}>
        Close Protection Officer
      </p>

      {/* SIA License Number */}
      <div className="badge badge-gold" style={{ marginBottom: 'var(--armora-space-md)' }}>
        SIA: {cpo.sia_license_number}
      </div>

      {/* Rating and Verification */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--armora-space-lg)' }}>
        {/* Rating */}
        {cpo.rating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--armora-space-xs)' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {renderStars(cpo.rating)}
            </div>
            <span style={{ fontSize: 'var(--armora-text-sm)', fontWeight: 'var(--armora-weight-semibold)' }}>
              {cpo.rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Verification Badge */}
        {cpo.verification_status === 'verified' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--armora-space-xs)' }}>
            <IconWrapper icon={FiCheckCircle} size={18} color="var(--armora-gold)"/>
            <span style={{ fontSize: 'var(--armora-text-sm)', fontWeight: 'var(--armora-weight-medium)' }}>
              Verified
            </span>
          </div>
        )}
      </div>

      {/* Total Assignments */}
      {cpo.total_assignments !== undefined && (
        <div style={{ marginTop: 'var(--armora-space-md)', fontSize: 'var(--armora-text-sm)', opacity: 0.8 }}>
          {cpo.total_assignments} {cpo.total_assignments === 1 ? 'Assignment' : 'Assignments'} Completed
        </div>
      )}
    </motion.div>
  );
};

export default ProfileHeader;
