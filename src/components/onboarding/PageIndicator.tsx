import React from 'react';
import { motion } from 'framer-motion';
import './PageIndicator.css';

export interface PageIndicatorProps {
  totalPages: number;
  currentPage: number;
  onPageClick?: (page: number) => void;
}

export const PageIndicator: React.FC<PageIndicatorProps> = ({
  totalPages,
  currentPage,
  onPageClick,
}) => {
  return (
    <div className="page-indicator">
      {Array.from({ length: totalPages }).map((_, index) => (
        <button
          key={index}
          className={`page-indicator__dot ${
            index === currentPage ? 'page-indicator__dot--active' : ''
          }`}
          onClick={() => onPageClick?.(index)}
          aria-label={`Go to page ${index + 1}`}
          aria-current={index === currentPage ? 'page' : undefined}
        >
          <motion.span
            className="page-indicator__dot-inner"
            initial={false}
            animate={{
              scale: index === currentPage ? 1 : 0.6,
              opacity: index === currentPage ? 1 : 0.5,
            }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut',
            }}
          />
        </button>
      ))}
    </div>
  );
};
