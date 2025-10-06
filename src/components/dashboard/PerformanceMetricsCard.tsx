import React from 'react';
import { motion } from 'framer-motion';
import {
  FiCheckCircle,
  FiStar,
  FiBriefcase,
  FiTrendingUp,
} from 'react-icons/fi';
import './PerformanceMetricsCard.css';

export interface PerformanceMetricsCardProps {
  responseRate: number; // 0-100
  averageRating: number; // 0-5
  jobsCompleted: number;
  reliabilityScore: number; // 0-100
}

export const PerformanceMetricsCard: React.FC<PerformanceMetricsCardProps> = ({
  responseRate,
  averageRating,
  jobsCompleted,
  reliabilityScore,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'danger';
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          {/* @ts-expect-error - React icon typing issue */}
          <FiStarh
            key={i}
            className="performance-metrics-card__star performance-metrics-card__star--filled"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        {/* @ts-expect-error - React icon typing issue */}
        stars.push(
          <FiStar
            key={i}
            className="performance-metrics-card__star performance-metrics-card__star--half"
          />
        );
      } else {
        stars.push(
          {/* @ts-expect-error - React icon typing issue */}
          <FiStar
            key={i}
            className="performance-metrics-card__star performance-metrics-card__star--empty"
          />
        );
      }
    }

    return stars;
  };

  return (
    <div className="performance-metrics-card">
      <div className="performance-metrics-card__header">
        <h2 className="performance-metrics-card__title">Performance Metrics</h2>
        <span className="performance-metrics-card__subtitle">Your professional overview</span>
      </div>

      <div className="performance-metrics-card__grid">
        {/* Response Rate */}
        <motion.div
          className="performance-metrics-card__metric"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="performance-metrics-card__metric-icon-wrapper">
            <FiCheckCircle className="performance-metrics-card__metric-icon" />
          </div>
          <div className="performance-metrics-card__metric-content">
            <span className="performance-metrics-card__metric-label">Response Rate</span>
            <div className="performance-metrics-card__metric-value-wrapper">
              <span className={`performance-metrics-card__metric-value performance-metrics-card__metric-value--${getScoreColor(responseRate)}`}>
                {responseRate}%
              </span>
            </div>
            <div className="performance-metrics-card__gauge">
              <div
                className={`performance-metrics-card__gauge-fill performance-metrics-card__gauge-fill--${getScoreColor(responseRate)}`}
                style={{ width: `${responseRate}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Average Rating */}
        <motion.div
          className="performance-metrics-card__metric"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="performance-metrics-card__metric-icon-wrapper">
            <FiStar className="performance-metrics-card__metric-icon" />
          </div>
          <div className="performance-metrics-card__metric-content">
            <span className="performance-metrics-card__metric-label">Average Rating</span>
            <div className="performance-metrics-card__metric-value-wrapper">
              <span className="performance-metrics-card__metric-value performance-metrics-card__metric-value--gold">
                {averageRating.toFixed(1)}
              </span>
              <span className="performance-metrics-card__metric-max">/5.0</span>
            </div>
            <div className="performance-metrics-card__stars">
              {getRatingStars(averageRating)}
            </div>
          </div>
        </motion.div>

        {/* Jobs Completed */}
        <motion.div
          className="performance-metrics-card__metric"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="performance-metrics-card__metric-icon-wrapper">
            <FiBriefcase className="performance-metrics-card__metric-icon" />
          </div>
          <div className="performance-metrics-card__metric-content">
            <span className="performance-metrics-card__metric-label">Jobs Completed</span>
            <div className="performance-metrics-card__metric-value-wrapper">
              <span className="performance-metrics-card__metric-value performance-metrics-card__metric-value--navy">
                {jobsCompleted}
              </span>
            </div>
            <span className="performance-metrics-card__metric-subtext">Total assignments</span>
          </div>
        </motion.div>

        {/* Reliability Score */}
        <motion.div
          className="performance-metrics-card__metric"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="performance-metrics-card__metric-icon-wrapper">
            <FiTrendingUp className="performance-metrics-card__metric-icon" />
          </div>
          <div className="performance-metrics-card__metric-content">
            <span className="performance-metrics-card__metric-label">Reliability Score</span>
            <div className="performance-metrics-card__metric-value-wrapper">
              <span className={`performance-metrics-card__metric-value performance-metrics-card__metric-value--${getScoreColor(reliabilityScore)}`}>
                {reliabilityScore}%
              </span>
            </div>
            <div className="performance-metrics-card__gauge">
              <div
                className={`performance-metrics-card__gauge-fill performance-metrics-card__gauge-fill--${getScoreColor(reliabilityScore)}`}
                style={{ width: `${reliabilityScore}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="performance-metrics-card__footer">
        <p className="performance-metrics-card__footer-text">
          Keep maintaining excellent performance to access premium assignments
        </p>
      </div>
    </div>
  );
};
