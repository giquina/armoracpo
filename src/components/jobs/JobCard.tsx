import React from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPoundSign, FaClock, FaCar, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import { ProtectionAssignment } from '../../lib/supabase';
import { format, differenceInHours } from 'date-fns';
import '../../styles/global.css';
import './JobCard.css';
import { IconWrapper } from '../../utils/IconWrapper';

interface JobCardProps {
  assignment: ProtectionAssignment;
  onViewDetails: (assignmentId: string) => void;
  onAccept: (assignmentId: string) => void;
  distance?: string;
}

const JobCard: React.FC<JobCardProps> = ({ assignment, onViewDetails, onAccept, distance = '5.2 km' }) => {
  const isUrgent = differenceInHours(new Date(assignment.scheduled_start_time), new Date()) < 2;

  const threatColors = {
    low: 'var(--armora-success)',
    medium: 'var(--armora-warning)',
    high: 'var(--armora-danger)',
    critical: 'var(--armora-danger)',
  };

  const threatColor = threatColors[assignment.threat_level];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="job-card-flat"
      onClick={() => onViewDetails(assignment.id)}
    >
      {/* Thin Threat Indicator Bar */}
      <div
        className="job-card-threat-bar"
        style={{ backgroundColor: threatColor }}
      />

      {/* Urgency Badge */}
      {isUrgent && (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="job-card-urgent-badge"
        >
          <IconWrapper icon={FaExclamationTriangle} color="var(--armora-danger)" size={12}/>
          <span>URGENT</span>
        </motion.div>
      )}

      {/* Header Section */}
      <div className="job-card-flat-header">
        <div>
          <p className="job-card-flat-type">
            {assignment.assignment_type.replace('_', ' ')}
          </p>
          <h3 className="job-card-flat-title">Principal Assignment</h3>
        </div>
        {!isUrgent && (
          <span className={`badge badge-threat-${assignment.threat_level}`}>
            {assignment.threat_level.toUpperCase()}
          </span>
        )}
      </div>

      {/* Inline Info - Single Line with Icons */}
      <div className="job-card-flat-info">
        <div className="job-card-flat-info-item">
          <IconWrapper icon={FaClock} color="var(--armora-text-secondary)" size={14}/>
          <span>{format(new Date(assignment.scheduled_start_time), 'PP')}</span>
        </div>
        <div className="job-card-flat-info-item">
          <IconWrapper icon={FaMapMarkerAlt} color="var(--armora-teal)" size={14}/>
          <span>{assignment.pickup_location}</span>
        </div>
        <div className="job-card-flat-info-item">
          <span className="text-xs text-secondary">{distance} away</span>
        </div>
      </div>

      {/* Price Highlighted with Teal */}
      <div className="job-card-flat-price">
        <div className="job-card-flat-price-main">
          <IconWrapper icon={FaPoundSign} color="var(--armora-teal)" size={16}/>
          <span className="job-card-flat-price-amount">
            {(assignment.base_rate * (assignment.estimated_duration_hours || 1)).toFixed(0)}
          </span>
        </div>
        <span className="job-card-flat-price-detail">
          £{assignment.base_rate}/hr • {assignment.estimated_duration_hours}h duration
        </span>
      </div>

      {/* Requirements - Inline Badges */}
      {(assignment.vehicle_required || assignment.armed_protection_required) && (
        <div className="job-card-flat-requirements">
          {assignment.vehicle_required && (
            <span className="job-card-flat-requirement">
              <IconWrapper icon={FaCar} size={10}/>
              Vehicle Required
            </span>
          )}
          {assignment.armed_protection_required && (
            <span className="job-card-flat-requirement danger">
              <IconWrapper icon={FaShieldAlt} size={10}/>
              Armed Protection
            </span>
          )}
        </div>
      )}

      {/* Full-Width Teal CTA Button */}
      <button
        className="job-card-flat-cta"
        onClick={(e) => {
          e.stopPropagation();
          onAccept(assignment.id);
        }}
      >
        Accept Assignment
      </button>
    </motion.div>
  );
};

export default JobCard;
