import React from 'react';
import { motion } from 'framer-motion';
import './ComplianceScore.css';

export interface ComplianceScoreData {
  score: number;
  maxScore: number;
  factors: {
    name: string;
    score: number;
    maxScore: number;
  }[];
  improvementTips: string[];
}

interface ComplianceScoreProps {
  data: ComplianceScoreData;
}

const ComplianceScore: React.FC<ComplianceScoreProps> = ({ data }) => {
  const percentage = (data.score / data.maxScore) * 100;

  const getScoreColor = (percent: number) => {
    if (percent >= 90) return '#10B981'; // Green
    if (percent >= 70) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  const getScoreLabel = (percent: number) => {
    if (percent >= 90) return 'Excellent';
    if (percent >= 70) return 'Good';
    if (percent >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  const color = getScoreColor(percentage);

  return (
    <div className="compliance-score">
      <div className="compliance-score__circle-container">
        <svg className="compliance-score__circle" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="12"
          />
          {/* Progress circle */}
          <motion.circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={534.07} // 2 * PI * 85
            strokeDashoffset={534.07}
            transform="rotate(-90 100 100)"
            initial={{ strokeDashoffset: 534.07 }}
            animate={{ strokeDashoffset: 534.07 - (534.07 * percentage) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="compliance-score__content">
          <motion.div
            className="compliance-score__percentage"
            style={{ color }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {Math.round(percentage)}%
          </motion.div>
          <div className="compliance-score__label">{getScoreLabel(percentage)}</div>
        </div>
      </div>

      <div className="compliance-score__breakdown">
        <h4>Score Breakdown</h4>
        <div className="compliance-score__factors">
          {data.factors.map((factor, index) => {
            const factorPercentage = (factor.score / factor.maxScore) * 100;
            return (
              <div key={index} className="compliance-score__factor">
                <div className="compliance-score__factor-header">
                  <span className="compliance-score__factor-name">{factor.name}</span>
                  <span className="compliance-score__factor-score">
                    {factor.score}/{factor.maxScore}
                  </span>
                </div>
                <div className="compliance-score__factor-bar">
                  <motion.div
                    className="compliance-score__factor-progress"
                    style={{
                      width: `${factorPercentage}%`,
                      backgroundColor: getScoreColor(factorPercentage)
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${factorPercentage}%` }}
                    transition={{ duration: 1, delay: 0.2 * index }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {data.improvementTips.length > 0 && (
        <div className="compliance-score__tips">
          <h4>Improvement Tips</h4>
          <ul>
            {data.improvementTips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ComplianceScore;
