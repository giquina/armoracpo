import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import './QuickStatsCard.css';

export interface QuickStatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  link?: string;
  color?: 'navy' | 'gold' | 'success' | 'warning' | 'danger';
}

export const QuickStatsCard: React.FC<QuickStatsCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  link,
  color = 'navy',
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (link) {
      navigate(link);
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <FiTrendingUp className="quick-stats-card__trend-icon quick-stats-card__trend-icon--up" />;
      case 'down':
        return <FiTrendingDown className="quick-stats-card__trend-icon quick-stats-card__trend-icon--down" />;
      default:
        return <FiMinus className="quick-stats-card__trend-icon quick-stats-card__trend-icon--neutral" />;
    }
  };

  return (
    <motion.div
      className={`quick-stats-card quick-stats-card--${color} ${link ? 'quick-stats-card--clickable' : ''}`}
      onClick={handleClick}
      whileHover={link ? { y: -4, boxShadow: 'var(--armora-shadow-lg)' } : {}}
      whileTap={link ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
      role={link ? 'button' : 'article'}
      tabIndex={link ? 0 : undefined}
      onKeyDown={
        link
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
    >
      <div className="quick-stats-card__icon-wrapper">
        <div className={`quick-stats-card__icon quick-stats-card__icon--${color}`}>
          {icon}
        </div>
      </div>

      <div className="quick-stats-card__content">
        <h3 className="quick-stats-card__title">{title}</h3>
        <div className="quick-stats-card__value">{value}</div>

        {change && (
          <div className={`quick-stats-card__change quick-stats-card__change--${trend}`}>
            {getTrendIcon()}
            <span>{change}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
