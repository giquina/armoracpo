import React, { useState } from 'react';
import { FiX, FiMapPin, FiCalendar, FiClock, FiDollarSign, FiBookmark, FiAlertCircle, FiCheckCircle, FiUser, FiStar, FiBriefcase, FiMessageSquare } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import BrowseJobCard from './BrowseJobCard';
import './JobDetailsModal.css';

interface JobDetailsModalProps {
  job: {
    id: string;
    title: string;
    clientType: string;
    clientRating: number;
    clientName: string;
    clientStats: {
      totalJobs: number;
      hireRate: number;
      avgRating: number;
      responseTime: string;
    };
    location: string;
    distance: number;
    dateRange: string;
    duration: string;
    payRate: string;
    payAmount: number;
    requirements: string[];
    description: string;
    fullDescription: string;
    applicantCount: number;
    postedTime: string;
    deadline: string;
    riskLevel: string;
    jobType: string;
    coordinates: [number, number];
    similarJobs: string[];
  };
  isSaved: boolean;
  onSave: (jobId: string) => void;
  onClose: () => void;
  allJobs: any[];
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  isSaved,
  onSave,
  onClose,
  allJobs
}) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const similarJobs = allJobs.filter(j => job.similarJobs.includes(j.id));

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

  const handleApply = () => {
    // Mock application submission
    alert('Application submitted successfully!');
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="job-details-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="job-details-modal"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="job-details-header">
            <button className="job-details-close" onClick={onClose}>
              <FiX />
            </button>
            <h2 className="job-details-header-title">Job Details</h2>
            <button
              className={`job-details-save ${isSaved ? 'saved' : ''}`}
              onClick={() => onSave(job.id)}
            >
              <FiBookmark />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="job-details-content">
            {/* Main Info Card */}
            <div className="job-details-card">
              <h1 className="job-details-title">{job.title}</h1>

              <div className="job-details-meta">
                <div className="job-details-meta-item">
                  <FiMapPin className="job-details-meta-icon" />
                  <span>{job.location}</span>
                </div>
                <div className="job-details-meta-item">
                  <FiCalendar className="job-details-meta-icon" />
                  <span>{job.dateRange}</span>
                </div>
                <div className="job-details-meta-item">
                  <FiClock className="job-details-meta-icon" />
                  <span>{job.duration}</span>
                </div>
                <div className="job-details-meta-item">
                  <FiAlertCircle
                    className="job-details-meta-icon"
                    style={{ color: getRiskColor(job.riskLevel) }}
                  />
                  <span>Risk: {job.riskLevel}</span>
                </div>
              </div>

              <div className="job-details-pay-banner">
                <div className="job-details-pay-amount">{job.payRate}</div>
                <div className="job-details-pay-label">per day</div>
              </div>
            </div>

            {/* Client Info */}
            <div className="job-details-card">
              <h3 className="job-details-section-title">About the Client</h3>
              <div className="job-details-client">
                <div className="job-details-client-header">
                  <div className="job-details-client-avatar">
                    <FiUser />
                  </div>
                  <div>
                    <div className="job-details-client-name">{job.clientName}</div>
                    <div className="job-details-client-type">{job.clientType}</div>
                  </div>
                  <div className="job-details-client-rating">
                    <FiStar className="job-details-client-rating-icon" />
                    {job.clientRating}
                  </div>
                </div>

                <div className="job-details-client-stats">
                  <div className="job-details-client-stat">
                    <div className="job-details-client-stat-value">
                      {job.clientStats.totalJobs}
                    </div>
                    <div className="job-details-client-stat-label">Total Jobs</div>
                  </div>
                  <div className="job-details-client-stat">
                    <div className="job-details-client-stat-value">
                      {job.clientStats.hireRate}%
                    </div>
                    <div className="job-details-client-stat-label">Hire Rate</div>
                  </div>
                  <div className="job-details-client-stat">
                    <div className="job-details-client-stat-value">
                      {job.clientStats.avgRating}
                    </div>
                    <div className="job-details-client-stat-label">Avg Rating</div>
                  </div>
                  <div className="job-details-client-stat">
                    <div className="job-details-client-stat-value">
                      {job.clientStats.responseTime}
                    </div>
                    <div className="job-details-client-stat-label">Response</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Preview */}
            <div className="job-details-card">
              <h3 className="job-details-section-title">Location</h3>
              <div className="job-details-map">
                <FiMapPin className="job-details-map-icon" />
                <div className="job-details-map-text">
                  <div>{job.location}</div>
                  <div className="job-details-map-distance">{job.distance} miles away</div>
                </div>
              </div>
            </div>

            {/* Full Description */}
            <div className="job-details-card">
              <h3 className="job-details-section-title">Description</h3>
              <p className="job-details-description">{job.fullDescription}</p>
            </div>

            {/* Requirements */}
            <div className="job-details-card">
              <h3 className="job-details-section-title">Requirements</h3>
              <div className="job-details-requirements">
                {job.requirements.map((req, index) => (
                  <div key={index} className="job-details-requirement">
                    <FiCheckCircle className="job-details-requirement-icon" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="job-details-card">
              <h3 className="job-details-section-title">Additional Information</h3>
              <div className="job-details-info-grid">
                <div className="job-details-info-item">
                  <div className="job-details-info-label">Job Type</div>
                  <div className="job-details-info-value">{job.jobType}</div>
                </div>
                <div className="job-details-info-item">
                  <div className="job-details-info-label">Duration</div>
                  <div className="job-details-info-value">{job.duration}</div>
                </div>
                <div className="job-details-info-item">
                  <div className="job-details-info-label">Applicants</div>
                  <div className="job-details-info-value">{job.applicantCount}</div>
                </div>
                <div className="job-details-info-item">
                  <div className="job-details-info-label">Posted</div>
                  <div className="job-details-info-value">{job.postedTime}</div>
                </div>
              </div>
            </div>

            {/* Similar Jobs */}
            {similarJobs.length > 0 && (
              <div className="job-details-card">
                <h3 className="job-details-section-title">Similar Jobs</h3>
                <div className="job-details-similar">
                  {similarJobs.map(similarJob => (
                    <div key={similarJob.id} className="job-details-similar-item">
                      <div className="job-details-similar-title">{similarJob.title}</div>
                      <div className="job-details-similar-meta">
                        {similarJob.location} • {similarJob.payRate}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Application Section */}
            {showApplicationForm && (
              <div className="job-details-card">
                <h3 className="job-details-section-title">Your Application</h3>
                <div className="job-details-application">
                  <label className="job-details-application-label">
                    Cover Letter (Optional)
                  </label>
                  <textarea
                    className="job-details-application-textarea"
                    placeholder="Tell the client why you're the right person for this job..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={6}
                  />

                  <div className="job-details-application-note">
                    <FiMessageSquare className="job-details-application-note-icon" />
                    <span>Your profile and certifications will be automatically included</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="job-details-footer">
            {!showApplicationForm ? (
              <button
                className="job-details-apply-btn"
                onClick={() => setShowApplicationForm(true)}
              >
                <FiBriefcase />
                Apply for This Job
              </button>
            ) : (
              <div className="job-details-footer-actions">
                <button
                  className="job-details-cancel-btn"
                  onClick={() => setShowApplicationForm(false)}
                >
                  Cancel
                </button>
                <button
                  className="job-details-submit-btn"
                  onClick={handleApply}
                >
                  Submit Application
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JobDetailsModal;
