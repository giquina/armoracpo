import React from 'react';
import { motion } from 'framer-motion';
import './Card.css';

export type CardVariant = 'default' | 'elevated' | 'interactive' | 'navy' | 'gold';

export interface CardProps {
  variant?: CardVariant;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
  'aria-label'?: string;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  className = '',
  onClick,
  children,
  'aria-label': ariaLabel,
}) => {
  const isInteractive = variant === 'interactive' || onClick;

  const cardClasses = [
    'armora-card',
    `armora-card--${variant}`,
    isInteractive && 'armora-card--interactive',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const Component = isInteractive ? motion.div : 'div';

  const motionProps = isInteractive
    ? {
        whileHover: {
          y: -6,
          boxShadow: 'var(--armora-shadow-xl)',
        },
        whileTap: {
          scale: 0.98,
          y: -2,
        },
        transition: { duration: 0.2 }
      }
    : {};

  return (
    <Component
      className={cardClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      onKeyDown={
        onClick
          ? (e: any) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      {...motionProps}
    >
      {children}
    </Component>
  );
};
