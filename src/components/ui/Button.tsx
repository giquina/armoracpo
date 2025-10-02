import React from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'icon' | 'danger' | 'success' | 'gold';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'full';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const isDisabled = disabled || loading;

  const buttonClasses = [
    'armora-button',
    `armora-button--${variant}`,
    `armora-button--${size}`,
    icon && !children && 'armora-button--icon-only',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.button
      className={buttonClasses}
      disabled={isDisabled}
      onClick={onClick}
      type={type}
      whileHover={!isDisabled ? { scale: 1.02, y: -1 } : {}}
      whileTap={!isDisabled ? { scale: 0.96, y: 1 } : {}}
      transition={{
        duration: 0.2,
        ease: 'easeInOut',
      }}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size="sm" color={variant === 'primary' || variant === 'navy' ? 'white' : 'navy'} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="armora-button__icon">{icon}</span>}
          {children && <span className="armora-button__text">{children}</span>}
          {icon && iconPosition === 'right' && <span className="armora-button__icon">{icon}</span>}
        </>
      )}
    </motion.button>
  );
};
