import React from 'react';
import './Skeleton.css';

export type SkeletonVariant = 'card' | 'list' | 'profile' | 'text' | 'circle';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
}) => {
  const skeletonClasses = [
    'armora-skeleton',
    `armora-skeleton--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const style: React.CSSProperties = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className="armora-skeleton__card" style={style}>
            <div className="armora-skeleton__card-header">
              <div className="armora-skeleton armora-skeleton--circle" style={{ width: 48, height: 48 }} />
              <div className="armora-skeleton__card-title">
                <div className="armora-skeleton armora-skeleton--text" style={{ width: '60%' }} />
                <div className="armora-skeleton armora-skeleton--text" style={{ width: '40%' }} />
              </div>
            </div>
            <div className="armora-skeleton armora-skeleton--text" style={{ width: '100%', height: 80 }} />
          </div>
        );

      case 'list':
        return (
          <div className="armora-skeleton__list" style={style}>
            <div className="armora-skeleton armora-skeleton--circle" style={{ width: 40, height: 40 }} />
            <div className="armora-skeleton__list-content">
              <div className="armora-skeleton armora-skeleton--text" style={{ width: '80%' }} />
              <div className="armora-skeleton armora-skeleton--text" style={{ width: '60%' }} />
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="armora-skeleton__profile" style={style}>
            <div className="armora-skeleton armora-skeleton--circle" style={{ width: 80, height: 80 }} />
            <div className="armora-skeleton armora-skeleton--text" style={{ width: 120, height: 20 }} />
            <div className="armora-skeleton armora-skeleton--text" style={{ width: 100, height: 16 }} />
          </div>
        );

      default:
        return <div className={skeletonClasses} style={style} />;
    }
  };

  if (count > 1 && variant === 'text') {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className={skeletonClasses} style={style} />
        ))}
      </>
    );
  }

  return renderSkeleton();
};
