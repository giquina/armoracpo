import React from 'react';
import { FiMapPin, FiClock, FiUsers, FiBookmark, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './JobCard.css';

interface BrowseJobCardProps {
  job: {
    id: string;
    title: string;
    clientType: string;
    clientRating: number;
    location: string;
    distance: number;
    dateRange: string;
    duration: string;
    payRate: string;
    payAmount: number;
    requirements: string[];
    description: string;
    applicantCount: number;
    postedTime: string;
    deadline: string;
    riskLevel: string;
  };
  isSaved: boolean;
  onSave: (jobId: string) => void;
  onClick: () => void;
}

const BrowseJobCard: React.FC<BrowseJobCardProps> = ({ job, isSaved, onSave, onClick }) => {
  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 1) return `${days} days left`;
    if (days === 1) return '1 day left';
    if (hours > 1) return `${hours} hours left`;
    return 'Expires soon';
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave(job.id);
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return '#ff4444';
      case 'medium':
        return '#ffaa00';
      case 'low':
        return '#00ff88';
      default:
        return '#666666';
    }
  };

  return (
    <motion.div
      className="job-card"
      onClick={onClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="job-card-header">
        <div className="job-card-title-section">
          <h3 className="job-card-title">{job.title}</h3>
          <div className="job-card-client">
            <span className="job-card-client-type">{job.clientType}</span>
            <span className="job-card-rating">★ {job.clientRating}</span>
          </div>
        </div>
        <button
          className={`job-card-bookmark ${isSaved ? 'saved' : ''}`}
          onClick={handleSaveClick}
        >
          <FiBookmark />
        </button>
      </div>

      {/* Info Grid */}
      <div className="job-card-info">
        <div className="job-card-info-item">
          <FiMapPin className="job-card-info-icon" />
          <span>{job.location}</span>
          <span className="job-card-distance">{job.distance} mi</span>
        </div>
        <div className="job-card-info-item">
          <FiCalendar className="job-card-info-icon" />
          <span>{job.dateRange}</span>
        </div>
        <div className="job-card-info-item">
          <FiClock className="job-card-info-icon" />
          <span>{job.duration}</span>
        </div>
        <div className="job-card-info-item">
          <FiAlertCircle
            className="job-card-info-icon"
            style={{ color: getRiskColor(job.riskLevel) }}
          />
          <span>Risk: {job.riskLevel}</span>
        </div>
      </div>

      {/* Pay Rate */}
      <div className="job-card-pay">
        <span className="job-card-pay-amount">{job.payRate}</span>
        <span className="job-card-pay-label">per day</span>
      </div>

      {/* Requirements */}
      <div className="job-card-requirements">
        {job.requirements.slice(0, 3).map((req, index) => (
          <span key={index} className="job-card-requirement">
            {req}
          </span>
        ))}
        {job.requirements.length > 3 && (
          <span className="job-card-requirement-more">
            +{job.requirements.length - 3} more
          </span>
        )}
      </div>

      {/* Description */}
      <p className="job-card-description">{job.description}</p>

      {/* Footer */}
      <div className="job-card-footer">
        <div className="job-card-meta">
          <div className="job-card-applicants">
            <FiUsers className="job-card-meta-icon" />
            <span>{job.applicantCount} applicants</span>
          </div>
          <span className="job-card-separator">•</span>
          <span className="job-card-posted">{job.postedTime}</span>
        </div>
        <div className="job-card-deadline">{getTimeRemaining(job.deadline)}</div>
      </div>

      {/* Quick Apply Button */}
      <button className="job-card-apply-btn">
        Quick Apply
      </button>
    </motion.div>
  );
};

export default BrowseJobCard;
