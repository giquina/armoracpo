import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaClock, FaUser, FaShieldAlt } from 'react-icons/fa';
import { ProtectionAssignment } from '../../lib/supabase';
import { format, differenceInMinutes } from 'date-fns';
import '../../styles/global.css';
import { IconWrapper } from '../../utils/IconWrapper';

interface ActiveAssignmentCardProps {
  assignment: ProtectionAssignment | null;
}

const ActiveAssignmentCard: React.FC<ActiveAssignmentCardProps> = ({ assignment }) => {
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!assignment) return;

    const updateETA = () => {
      const now = new Date();
      const startTime = new Date(assignment.scheduled_start_time);
      const minutesRemaining = differenceInMinutes(startTime, now);

      if (minutesRemaining > 60) {
        const hours = Math.floor(minutesRemaining / 60);
        setTimeRemaining(`${hours}h ${minutesRemaining % 60}m`);
      } else if (minutesRemaining > 0) {
        setTimeRemaining(`${minutesRemaining}m`);
      } else {
        setTimeRemaining('Now');
      }
    };

    updateETA();
    const interval = setInterval(updateETA, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [assignment]);

  if (!assignment) {
    return (
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: 'var(--armora-space-xl)',
          background: 'linear-gradient(135deg, var(--armora-bg-secondary) 0%, var(--armora-bg-primary) 100%)',
        }}
      >
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            fontSize: '64px',
            marginBottom: 'var(--armora-space-md)',
          }}
        >
          <IconWrapper icon={FaShieldAlt} color="var(--armora-border-medium)" size={64}/>
        </motion.div>
        <h3 className="mb-sm">No Active Assignment</h3>
        <p className="text-sm text-secondary mb-md">
          Browse available assignments to get started
        </p>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/jobs')}
        >
          View Available Assignments
        </button>
      </div>
    );
  }

  const statusColors = {
    assigned: 'var(--armora-warning)',
    en_route: 'var(--armora-info)',
    active: 'var(--armora-success)',
  };

  const statusColor = statusColors[assignment.status as keyof typeof statusColors] || 'var(--armora-text-secondary)';

  return (
    <div
      className="card"
      style={{
        border: '2px solid var(--armora-gold)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, var(--armora-gold) 0%, var(--armora-gold-light) 100%)',
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-start mb-md">
        <div>
          <div className="flex items-center gap-sm mb-xs">
            <h3 style={{ margin: 0 }}>Active Assignment</h3>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: statusColor,
                boxShadow: `0 0 8px ${statusColor}`,
              }}
            />
          </div>
          <p className="text-sm text-secondary" style={{ margin: 0 }}>
            {format(new Date(assignment.scheduled_start_time), 'PPp')}
          </p>
        </div>

        <span
          className="badge"
          style={{
            backgroundColor: `${statusColor}20`,
            color: statusColor,
            border: `1px solid ${statusColor}40`,
          }}
        >
          {assignment.status.toUpperCase().replace('_', ' ')}
        </span>
      </div>

      {/* Principal Info */}
      <div
        className="flex items-center gap-md mb-md"
        style={{
          padding: 'var(--armora-space-md)',
          backgroundColor: 'var(--armora-bg-secondary)',
          borderRadius: 'var(--armora-radius-md)',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--armora-radius-full)',
            backgroundColor: 'var(--armora-navy)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconWrapper icon={FaUser} color="white" size={20}/>
        </div>
        <div style={{ flex: 1 }}>
          <p className="text-xs text-secondary" style={{ margin: 0, marginBottom: '2px' }}>
            Principal
          </p>
          <p className="font-semibold" style={{ margin: 0 }}>
            {assignment.principal_name}
          </p>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-start gap-sm mb-md">
        <IconWrapper icon={FaMapMarkerAlt} color="var(--armora-danger)" size={16} style={{ marginTop: '2px' }}/>
        <div style={{ flex: 1 }}>
          <p className="text-xs text-secondary" style={{ margin: 0, marginBottom: '4px' }}>
            Pickup Location
          </p>
          <p className="text-sm font-medium" style={{ margin: 0 }}>
            {assignment.pickup_location}
          </p>
        </div>
      </div>

      {/* Assignment Details Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--armora-space-md)',
          marginBottom: 'var(--armora-space-md)',
        }}
      >
        <div>
          <p className="text-xs text-secondary" style={{ margin: 0, marginBottom: '4px' }}>
            Type
          </p>
          <p className="text-sm font-semibold" style={{ margin: 0, textTransform: 'capitalize' }}>
            {assignment.assignment_type.replace('_', ' ')}
          </p>
        </div>
        <div>
          <p className="text-xs text-secondary" style={{ margin: 0, marginBottom: '4px' }}>
            Threat Level
          </p>
          <span className={`badge badge-threat-${assignment.threat_level}`}>
            {assignment.threat_level.toUpperCase()}
          </span>
        </div>
      </div>

      {/* ETA Countdown */}
      {assignment.status !== 'active' && (
        <div
          className="flex items-center justify-center gap-sm"
          style={{
            padding: 'var(--armora-space-md)',
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
            borderRadius: 'var(--armora-radius-md)',
            marginBottom: 'var(--armora-space-md)',
          }}
        >
          <IconWrapper icon={FaClock} color="var(--armora-gold)" size={16}/>
          <span className="text-sm font-semibold" style={{ color: 'var(--armora-gold)' }}>
            ETA: {timeRemaining}
          </span>
        </div>
      )}

      {/* Action Button */}
      <button
        className="btn btn-primary btn-full"
        onClick={() => navigate('/active')}
      >
        Continue Assignment
      </button>
    </div>
  );
};

export default ActiveAssignmentCard;
