import React from 'react';
import { motion } from 'framer-motion';
import './ProgressBar.css';

export type ProgressVariant = 'default' | 'success' | 'warning' | 'danger';

export interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'default',
  showLabel = true,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const containerClasses = [
    'armora-progress',
    `armora-progress--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      <div className="armora-progress__track">
        <motion.div
          className="armora-progress__bar"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {showLabel && (
        <span className="armora-progress__label">{Math.round(percentage)}%</span>
      )}
    </div>
  );
};
