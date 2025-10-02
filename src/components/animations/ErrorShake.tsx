import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

export interface ErrorShakeProps {
  children: React.ReactNode;
  error?: boolean | string | null;
  className?: string;
}

const shakeVariants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
  },
  normal: {
    x: 0,
  },
};

export const ErrorShake: React.FC<ErrorShakeProps> = ({
  children,
  error = false,
  className = '',
}) => {
  const controls = useAnimation();

  useEffect(() => {
    if (error) {
      controls.start('shake');
    }
  }, [error, controls]);

  return (
    <motion.div
      animate={controls}
      variants={shakeVariants}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
