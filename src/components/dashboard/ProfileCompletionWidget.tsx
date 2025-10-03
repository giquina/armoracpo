import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiCircle, FiArrowRight } from 'react-icons/fi';
import { Button } from '../ui/Button';
import './ProfileCompletionWidget.css';

export interface ProfileSection {
  id: string;
  name: string;
  completed: boolean;
  link: string;
}

export interface ProfileCompletionWidgetProps {
  completion: number; // 0-100
  missingSections: ProfileSection[];
  onComplete: () => void;
}

export const ProfileCompletionWidget: React.FC<ProfileCompletionWidgetProps> = ({
  completion,
  missingSections,
  onComplete,
}) => {
  const navigate = useNavigate();

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completion / 100) * circumference;

  const getCompletionColor = () => {
    if (completion === 100) return 'var(--armora-success)';
    if (completion >= 70) return 'var(--armora-gold)';
    if (completion >= 40) return 'var(--armora-warning)';
    return 'var(--armora-danger)';
  };

  const getCompletionMessage = () => {
    if (completion === 100) return 'Profile Complete!';
    if (completion >= 70) return 'Almost There!';
    if (completion >= 40) return 'Keep Going!';
    return 'Get Started!';
  };

  const handleSectionClick = (section: ProfileSection) => {
    navigate(section.link);
  };

  return (
    <div className="profile-completion-widget">
      <div className="profile-completion-widget__header">
        <h2 className="profile-completion-widget__title">Profile Completion</h2>
        <span className="profile-completion-widget__subtitle">{getCompletionMessage()}</span>
      </div>

      <div className="profile-completion-widget__body">
        <div className="profile-completion-widget__circle-container">
          <svg className="profile-completion-widget__circle" width="160" height="160">
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="var(--armora-border-light)"
              strokeWidth="12"
            />
            <motion.circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={getCompletionColor()}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              transform="rotate(-90 80 80)"
            />
          </svg>
          <div className="profile-completion-widget__percentage">
            <motion.span
              className="profile-completion-widget__percentage-value"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {completion}%
            </motion.span>
            <span className="profile-completion-widget__percentage-label">Complete</span>
          </div>
        </div>

        {missingSections.length > 0 && (
          <div className="profile-completion-widget__sections">
            <h3 className="profile-completion-widget__sections-title">
              Missing Sections ({missingSections.length})
            </h3>
            <ul className="profile-completion-widget__sections-list">
              {missingSections.map((section, index) => (
                <motion.li
                  key={section.id}
                  className="profile-completion-widget__section-item"
                  onClick={() => handleSectionClick(section)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="profile-completion-widget__section-icon">
                    {section.completed ? (
                      <FiCheckCircle className="profile-completion-widget__section-check" />
                    ) : (
                      <FiCircle className="profile-completion-widget__section-circle" />
                    )}
                  </div>
                  <span className="profile-completion-widget__section-name">{section.name}</span>
                  <FiArrowRight className="profile-completion-widget__section-arrow" />
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {completion === 100 ? (
          <Button variant="success" size="lg" className="profile-completion-widget__cta">
            Profile Complete!
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            className="profile-completion-widget__cta"
            onClick={onComplete}
            icon={<FiArrowRight />}
            iconPosition="right"
          >
            Complete Profile
          </Button>
        )}
      </div>
    </div>
  );
};
