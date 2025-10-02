import React from 'react';
import { motion } from 'framer-motion';
import './LoadingSpinner.css';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerColor = 'navy' | 'gold' | 'white';
export type SpinnerVariant = 'spin' | 'pulse' | 'bounce';

export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  variant?: SpinnerVariant;
  className?: string;
}

const spinVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

const pulseVariants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const bounceVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'navy',
  variant = 'spin',
  className = '',
}) => {
  const spinnerClasses = [
    'armora-spinner',
    `armora-spinner--${size}`,
    `armora-spinner--${color}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const getVariants = () => {
    switch (variant) {
      case 'pulse':
        return pulseVariants;
      case 'bounce':
        return bounceVariants;
      default:
        return spinVariants;
    }
  };

  return (
    <motion.div
      className={spinnerClasses}
      variants={getVariants()}
      animate="animate"
      role="status"
      aria-label="Loading"
    >
      <span className="armora-spinner__sr-only">Loading...</span>
    </motion.div>
  );
};
