import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  pullDistance?: number;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  pullDistance = 80,
  className = '',
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const y = useMotionValue(0);

  const opacity = useTransform(y, [0, pullDistance], [0, 1]);
  const scale = useTransform(y, [0, pullDistance], [0.5, 1]);

  const handleTouchStart = (e: TouchEvent) => {
    const container = containerRef.current;
    if (!container || isRefreshing) return;

    // Only trigger if scrolled to top
    if (container.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling || isRefreshing) return;

    currentY.current = e.touches[0].clientY;
    const delta = currentY.current - startY.current;

    if (delta > 0) {
      e.preventDefault();
      const pullValue = Math.min(delta * 0.5, pullDistance);
      y.set(pullValue);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling || isRefreshing) return;

    setIsPulling(false);

    if (y.get() >= pullDistance) {
      setIsRefreshing(true);
      y.set(pullDistance);

      try {
        await onRefresh();
      } finally {
        y.set(0);
        setIsRefreshing(false);
      }
    } else {
      y.set(0);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, isRefreshing]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        overflow: 'auto',
        height: '100%',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: pullDistance,
          opacity,
          scale,
          pointerEvents: 'none',
        }}
      >
        <LoadingSpinner size="md" color="navy" />
      </motion.div>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
};
