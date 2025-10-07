import React from 'react';
import { motion } from 'framer-motion';
import { IconType } from 'react-icons';
import './FeatureCard.css';

export interface FeatureCardProps {
  icon: IconType;
  title: string;
  description: string;
  delay?: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  delay = 0,
}) => {
  return (
    <motion.div
      className="feature-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: 'easeOut',
      }}
    >
      <motion.div
        className="feature-card__icon-wrapper"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ duration: 0.3 }}
      >
        <Icon className="feature-card__icon" />
      </motion.div>
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__description">{description}</p>
    </motion.div>
  );
};
