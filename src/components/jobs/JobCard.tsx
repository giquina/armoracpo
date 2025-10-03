import React from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPoundSign, FaClock, FaCar, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import { ProtectionAssignment } from '../../lib/supabase';
import { format, differenceInHours } from 'date-fns';
import '../../styles/global.css';
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
      className="card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      onClick={() => onViewDetails(assignment.id)}
    >
      {/* Gradient Header */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: `linear-gradient(90deg, ${threatColor} 0%, ${threatColor}80 100%)`,
        }}
      />

      {/* Urgency Badge */}
      {isUrgent && (
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            top: 'var(--armora-space-md)',
            right: 'var(--armora-space-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--armora-space-xs)',
            padding: 'var(--armora-space-xs) var(--armora-space-sm)',
            borderRadius: 'var(--armora-radius-full)',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <IconWrapper icon={FaExclamationTriangle} color="var(--armora-danger)" size={12}/>
          <span className="text-xs font-bold" style={{ color: 'var(--armora-danger)' }}>
            URGENT
          </span>
        </motion.div>
      )}

      <div style={{ paddingTop: 'var(--armora-space-sm)' }}>
        {/* Assignment Type & Threat Level */}
        <div className="flex justify-between items-start mb-sm">
          <div>
            <p
              className="text-xs font-semibold uppercase text-secondary mb-xs"
              style={{
                letterSpacing: '0.5px',
                margin: 0,
                marginBottom: 'var(--armora-space-xs)',
              }}
            >
              {assignment.assignment_type.replace('_', ' ')}
            </p>
            <h3
              className="font-display"
              style={{
                margin: 0,
                fontSize: 'var(--armora-text-lg)',
              }}
            >
              Principal Assignment
            </h3>
          </div>
          {!isUrgent && (
            <span className={`badge badge-threat-${assignment.threat_level}`}>
              {assignment.threat_level.toUpperCase()}
            </span>
          )}
        </div>

        {/* Date & Time */}
        <div
          className="flex items-center gap-sm mb-md"
          style={{
            padding: 'var(--armora-space-sm)',
            backgroundColor: 'var(--armora-bg-secondary)',
            borderRadius: 'var(--armora-radius-md)',
          }}
        >
          <IconWrapper icon={FaClock} color="var(--armora-text-secondary)" size={14}/>
          <span className="text-sm font-medium">
            {format(new Date(assignment.scheduled_start_time), 'PPp')}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-start gap-sm mb-md">
          <IconWrapper icon={FaMapMarkerAlt} color="var(--armora-danger)" size={16} style={{ marginTop: '2px' }}/>
          <div style={{ flex: 1 }}>
            <p className="text-sm font-medium" style={{ margin: 0 }}>
              {assignment.pickup_location}
            </p>
            <p className="text-xs text-secondary" style={{ margin: 0, marginTop: '4px' }}>
              {distance} away
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 'var(--armora-space-md)',
            marginBottom: 'var(--armora-space-md)',
            padding: 'var(--armora-space-md)',
            backgroundColor: 'var(--armora-bg-secondary)',
            borderRadius: 'var(--armora-radius-md)',
          }}
        >
          <div>
            <p className="text-xs text-secondary" style={{ margin: 0, marginBottom: '4px' }}>
              Rate
            </p>
            <div className="flex items-center gap-xs">
              <IconWrapper icon={FaPoundSign} color="var(--armora-success)" size={12}/>
              <span className="text-sm font-bold" style={{ color: 'var(--armora-success)' }}>
                {assignment.base_rate}
              </span>
            </div>
            <p className="text-xs text-secondary" style={{ margin: 0 }}>
              per hour
            </p>
          </div>
          <div>
            <p className="text-xs text-secondary" style={{ margin: 0, marginBottom: '4px' }}>
              Duration
            </p>
            <p className="text-sm font-bold" style={{ margin: 0 }}>
              {assignment.estimated_duration_hours}h
            </p>
          </div>
          <div>
            <p className="text-xs text-secondary" style={{ margin: 0, marginBottom: '4px' }}>
              Total
            </p>
            <div className="flex items-center gap-xs">
              <IconWrapper icon={FaPoundSign} color="var(--armora-navy)" size={10}/>
              <span className="text-sm font-bold" style={{ color: 'var(--armora-navy)' }}>
                {(assignment.base_rate * (assignment.estimated_duration_hours || 1)).toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Requirements Badges */}
        {(assignment.vehicle_required || assignment.armed_protection_required) && (
          <div className="flex gap-sm mb-md" style={{ flexWrap: 'wrap' }}>
            {assignment.vehicle_required && (
              <span className="badge badge-info" style={{ fontSize: 'var(--armora-text-xs)' }}>
                <IconWrapper icon={FaCar} size={10} style={{ marginRight: '4px' }}/>
                Vehicle Required
              </span>
            )}
            {assignment.armed_protection_required && (
              <span className="badge badge-danger" style={{ fontSize: 'var(--armora-text-xs)' }}>
                <IconWrapper icon={FaShieldAlt} size={10} style={{ marginRight: '4px' }}/>
                Armed Protection
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--armora-space-sm)' }}>
          <button
            className="btn btn-secondary"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(assignment.id);
            }}
          >
            View Details
          </button>
          <button
            className="btn btn-gold"
            onClick={(e) => {
              e.stopPropagation();
              onAccept(assignment.id);
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default JobCard;
