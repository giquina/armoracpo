import React from 'react';
import { motion } from 'framer-motion';

export interface AnimatedListItemProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  children,
  index,
  className = '',
}) => {
  return (
    <motion.div
      variants={itemVariants}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
