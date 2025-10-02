import React from 'react';
import { motion } from 'framer-motion';

export interface LoadingDotsProps {
  color?: string;
  size?: number;
  className?: string;
}

const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const dotVariants = {
  initial: { y: 0 },
  animate: {
    y: [-8, 0, -8],
  },
};

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  color = 'var(--armora-gold)',
  size = 8,
  className = '',
}) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      style={{
        display: 'inline-flex',
        gap: `${size}px`,
        alignItems: 'center',
      }}
      className={className}
      aria-label="Loading"
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          variants={dotVariants}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            backgroundColor: color,
          }}
        />
      ))}
    </motion.div>
  );
};
