import React from 'react';
import { motion } from 'framer-motion';

export interface SuccessCheckmarkProps {
  size?: number;
  color?: string;
  onComplete?: () => void;
  className?: string;
}

const circleVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
  },
};

const checkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
  },
};

export const SuccessCheckmark: React.FC<SuccessCheckmarkProps> = ({
  size = 80,
  color = 'var(--armora-success)',
  onComplete,
  className = '',
}) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      initial="hidden"
      animate="visible"
      onAnimationComplete={onComplete}
    >
      <motion.circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke={color}
        strokeWidth="4"
        variants={circleVariants}
        transition={{
          pathLength: { duration: 0.5 },
          opacity: { duration: 0.2 },
        }}
      />
      <motion.path
        d="M 30 50 L 45 65 L 70 35"
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={checkVariants}
        transition={{
          pathLength: { duration: 0.3, delay: 0.3 },
          opacity: { duration: 0.2, delay: 0.3 },
        }}
      />
    </motion.svg>
  );
};
