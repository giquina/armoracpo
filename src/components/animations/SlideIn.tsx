import React from 'react';
import { motion } from 'framer-motion';

export type SlideDirection = 'top' | 'bottom' | 'left' | 'right';

export interface SlideInProps {
  children: React.ReactNode;
  direction?: SlideDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}

const getInitialPosition = (direction: SlideDirection, distance: number) => {
  switch (direction) {
    case 'top':
      return { opacity: 0, y: -distance };
    case 'bottom':
      return { opacity: 0, y: distance };
    case 'left':
      return { opacity: 0, x: -distance };
    case 'right':
      return { opacity: 0, x: distance };
  }
};

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'bottom',
  delay = 0,
  duration = 0.3,
  distance = 20,
  className = '',
}) => {
  return (
    <motion.div
      initial={getInitialPosition(direction, distance)}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
