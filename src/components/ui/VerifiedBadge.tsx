import React, { useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import './VerifiedBadge.css';
import { IconWrapper } from '../../utils/IconWrapper';

export interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 'md',
  tooltip = 'Verified by Armora',
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const badgeClasses = [
    'armora-verified-badge',
    `armora-verified-badge--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className="armora-verified-badge__wrapper"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={badgeClasses} aria-label={tooltip} role="img">
        <IconWrapper icon={FaCheckCircle} className="armora-verified-badge__icon"/>
      </div>
      {showTooltip && <div className="armora-verified-badge__tooltip">{tooltip}</div>}
    </div>
  );
};
