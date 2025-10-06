import React from 'react';
import { FaShieldAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { IconWrapper } from '../../utils/IconWrapper';
import './SIAVerificationBadge.css';

export interface SIAVerificationBadgeProps {
  verified?: boolean;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  licenseNumber?: string;
  expiryDate?: Date | string;
  variant?: 'default' | 'prominent';
}

type BadgeStatus = 'verified' | 'expiring-soon' | 'expired' | 'pending' | 'unverified';

/**
 * SIA Verification Badge Component
 *
 * Displays SIA (Security Industry Authority) verification status
 * for Close Protection Officers with expiry warnings.
 *
 * @param verified - Whether the CPO is SIA verified (default: true)
 * @param size - Badge size variant (default: 'medium')
 * @param showLabel - Whether to show "SIA VERIFIED" text (default: true)
 * @param licenseNumber - SIA license number to display
 * @param expiryDate - License expiry date (Date or ISO string)
 * @param variant - Badge style variant (default: 'default', 'prominent' for gold accent)
 */
const SIAVerificationBadge: React.FC<SIAVerificationBadgeProps> = ({
  verified = true,
  size = 'medium',
  showLabel = true,
  licenseNumber,
  expiryDate,
  variant = 'default',
}) => {
  // Calculate badge status based on verification and expiry
  const getBadgeStatus = (): BadgeStatus => {
    if (!verified) {
      return 'unverified';
    }

    if (!expiryDate) {
      return 'verified';
    }

    const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
    const now = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return 'expired';
    } else if (daysUntilExpiry <= 90) {
      return 'expiring-soon';
    }

    return 'verified';
  };

  const badgeStatus = getBadgeStatus();

  // Format expiry date for display
  const formatExpiryDate = (date: Date | string): string => {
    const expiry = typeof date === 'string' ? new Date(date) : date;
    return expiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Calculate days until expiry for warning message
  const getDaysUntilExpiry = (): number | null => {
    if (!expiryDate) return null;
    const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
    const now = new Date();
    return Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Don't render if unverified
  if (badgeStatus === 'unverified') {
    return null;
  }

  const sizeConfig = {
    small: {
      iconSize: 10,
      fontSize: '10px',
    },
    medium: {
      iconSize: 12,
      fontSize: 'var(--armora-text-xs)',
    },
    large: {
      iconSize: 16,
      fontSize: 'var(--armora-text-sm)',
    },
  };

  const config = sizeConfig[size];
  const daysUntilExpiry = getDaysUntilExpiry();

  // Prominent variant with gold border and detailed info
  if (variant === 'prominent' && (licenseNumber || expiryDate)) {
    const statusIcon = badgeStatus === 'expired' || badgeStatus === 'expiring-soon'
      ? FaExclamationTriangle
      : FaCheckCircle;
    const statusColor = badgeStatus === 'expired'
      ? 'var(--armora-danger)'
      : badgeStatus === 'expiring-soon'
      ? 'var(--armora-warning)'
      : 'var(--armora-success)';

    return (
      <div
        className={`cpo-sia-badge cpo-sia-badge--prominent cpo-sia-badge--${size} cpo-sia-badge--${badgeStatus}`}
        role="status"
        aria-label={`SIA License ${badgeStatus === 'expired' ? 'Expired' : badgeStatus === 'expiring-soon' ? 'Expiring Soon' : 'Verified'}`}
      >
        <div className="cpo-sia-badge__icon">
          <IconWrapper
            icon={FaShieldAlt}
            size={config.iconSize}
            color={badgeStatus === 'expired' ? 'var(--armora-danger)' : 'var(--armora-gold)'}
          />
        </div>
        <div className="cpo-sia-badge__content">
          <div className="cpo-sia-badge__title">
            {badgeStatus === 'expired' ? 'SIA EXPIRED' : 'SIA VERIFIED'}
          </div>
          {licenseNumber && (
            <div className="cpo-sia-badge__license">
              License: {licenseNumber}
            </div>
          )}
          {expiryDate && (
            <div className="cpo-sia-badge__expiry">
              {badgeStatus === 'expired' ? 'Expired: ' : 'Expires: '}
              {formatExpiryDate(expiryDate)}
              {badgeStatus === 'expiring-soon' && daysUntilExpiry !== null && (
                <span className="cpo-sia-badge__warning"> ({daysUntilExpiry} days)</span>
              )}
            </div>
          )}
        </div>
        <div className="cpo-sia-badge__status">
          <IconWrapper
            icon={statusIcon}
            size={config.iconSize}
            color={statusColor}
          />
        </div>
      </div>
    );
  }

  // Default compact variant
  const compactIcon = badgeStatus === 'expired' || badgeStatus === 'expiring-soon'
    ? FaExclamationTriangle
    : FaShieldAlt;
  const compactColor = badgeStatus === 'expired'
    ? 'var(--armora-danger)'
    : badgeStatus === 'expiring-soon'
    ? 'var(--armora-warning)'
    : 'var(--armora-success)';
  const labelText = badgeStatus === 'expired'
    ? 'SIA EXPIRED'
    : 'SIA VERIFIED';

  return (
    <div
      className={`cpo-sia-badge cpo-sia-badge--${size} cpo-sia-badge--${badgeStatus}`}
      role="status"
      aria-label={labelText}
    >
      <IconWrapper
        icon={compactIcon}
        size={config.iconSize}
        color={compactColor}
      />
      {showLabel && (
        <span className="cpo-sia-badge__label">
          {labelText}
        </span>
      )}
    </div>
  );
};

export default SIAVerificationBadge;
