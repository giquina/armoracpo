import React from 'react';
import { IconType } from 'react-icons';

/**
 * Wrapper component to fix React 19 compatibility with react-icons
 *
 * React 19 changed JSX typing which causes react-icons to show TS errors.
 * This wrapper ensures type safety while maintaining functionality.
 *
 * The @ts-ignore is necessary due to React 19 changing the JSX return types.
 * This is a known issue: https://github.com/react-icons/react-icons/issues/854
 */
interface IconWrapperProps {
  icon: IconType;
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const IconWrapper: React.FC<IconWrapperProps> = ({
  icon: Icon,
  size,
  color,
  className,
  style,
  onClick
}) => {
  // @ts-ignore - React 19 JSX type compatibility
  return <Icon size={size} color={color} className={className} style={style} onClick={onClick} />;
};

export default IconWrapper;
