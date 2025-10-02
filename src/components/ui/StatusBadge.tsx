import React from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaBriefcase, FaMoon } from 'react-icons/fa';
import './StatusBadge.css';

export type CPOStatus = 'operational' | 'busy' | 'offline';

export interface StatusBadgeProps {
  status: CPOStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  operational: {
    label: 'Operational',
    icon: FaCheckCircle,
    className: 'armora-status-badge--operational',
  },
  busy: {
    label: 'On Assignment',
    icon: FaBriefcase,
    className: 'armora-status-badge--busy',
  },
  offline: {
    label: 'Stand Down',
    icon: FaMoon,
    className: 'armora-status-badge--offline',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  const badgeClasses = [
    'armora-status-badge',
    config.className,
    `armora-status-badge--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Pulse animation for operational status
  const pulseAnimation = status === 'operational' ? {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  } : {};

  return (
    <motion.div
      className={badgeClasses}
      role="status"
      aria-label={`Status: ${config.label}`}
      animate={pulseAnimation}
    >
      {showIcon && (
        <motion.div
          animate={status === 'operational' ? {
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Icon className="armora-status-badge__icon" />
        </motion.div>
      )}
      <span className="armora-status-badge__label">{config.label}</span>
    </motion.div>
  );
};
