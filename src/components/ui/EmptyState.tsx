import React from 'react';
import { IconType } from 'react-icons';
import { Button } from './Button';
import './EmptyState.css';

export interface EmptyStateProps {
  icon: IconType | string;
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  onAction,
  className = '',
}) => {
  const containerClasses = ['armora-empty-state', className].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className="armora-empty-state__icon">
        {typeof icon === 'string' ? (
          <span style={{ fontSize: '48px' }}>{icon}</span>
        ) : (
          React.createElement(icon)
        )}
      </div>
      <h3 className="armora-empty-state__title">{title}</h3>
      <p className="armora-empty-state__description">{description}</p>
      {action && onAction && (
        <Button variant="primary" onClick={onAction}>
          {action}
        </Button>
      )}
    </div>
  );
};
