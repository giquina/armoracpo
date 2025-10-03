import React, { useState } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import './IconButton.css';

export type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  tooltip?: string;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'ghost',
  tooltip,
  className = '',
  disabled = false,
  onClick,
  ...props
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const buttonClasses = [
    'armora-icon-button',
    `armora-icon-button--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className="armora-icon-button__wrapper"
      onMouseEnter={() => tooltip && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <motion.button
        className={buttonClasses}
        disabled={disabled}
        onClick={onClick}
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        transition={{ duration: 0.2 }}
        aria-label={tooltip || props['aria-label']}
        {...props}
      >
        {icon}
      </motion.button>
      {tooltip && showTooltip && (
        <div className="armora-icon-button__tooltip">{tooltip}</div>
      )}
    </div>
  );
};
