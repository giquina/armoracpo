import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPoundSign, FaClock, FaStar } from 'react-icons/fa';
import { ProtectionAssignment } from '../../lib/supabase';
import { assignmentService } from '../../services/assignmentService';
import { format } from 'date-fns';
import '../../styles/global.css';

interface RecommendedJobsProps {
  cpoId: string;
  onAccept?: (assignmentId: string) => void;
}

const RecommendedJobs: React.FC<RecommendedJobsProps> = ({ cpoId, onAccept }) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<ProtectionAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendedJobs();
  }, [cpoId]);

  const loadRecommendedJobs = async () => {
    try {
      const allJobs = await assignmentService.getAvailableAssignments();
      // Take top 3 - in production, this would use recommendation algorithm
      setJobs(allJobs.slice(0, 3));
    } catch (error) {
      console.error('Error loading recommended jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchScore = (assignment: ProtectionAssignment) => {
    // Mock match score - in production, calculate based on:
    // - CPO specializations
    // - Distance from current location
    // - Historical performance on similar assignments
    // - Threat level compatibility
    return Math.floor(Math.random() * 20) + 80; // 80-99
  };

  const calculateDistance = () => {
    // Mock distance - in production, calculate from CPO current location
    return `${(Math.random() * 10 + 1).toFixed(1)} km`;
  };

  if (loading) {
    return (
      <div className="card">
        <h3 className="mb-md">Recommended Assignments</h3>
        <div className="flex justify-center items-center" style={{ padding: 'var(--armora-space-xl)' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 'var(--armora-space-xl)' }}>
        <h3 className="mb-sm">Recommended Assignments</h3>
        <p className="text-sm text-secondary">
          No recommendations available at the moment
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-md">
        <h3 style={{ margin: 0 }}>Recommended For You</h3>
        <button
          className="btn-sm"
          style={{
            color: 'var(--armora-navy)',
            fontWeight: 'var(--armora-weight-semibold)',
            fontSize: 'var(--armora-text-sm)',
          }}
          onClick={() => navigate('/jobs')}
        >
          View All
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--armora-space-md)' }}>
        {jobs.map((job, index) => {
          const matchScore = calculateMatchScore(job);
          const distance = calculateDistance();

          return (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card card-hover"
              style={{
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/jobs')}
            >
              {/* Gradient header */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg, var(--armora-gold) 0%, var(--armora-gold-light) 100%)`,
                }}
              />

              {/* Match Score Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: 'var(--armora-space-md)',
                  right: 'var(--armora-space-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--armora-space-xs)',
                  padding: 'var(--armora-space-xs) var(--armora-space-sm)',
                  borderRadius: 'var(--armora-radius-full)',
                  backgroundColor: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                }}
              >
                <FaStar color="var(--armora-gold)" size={12} />
                <span
                  className="text-xs font-bold"
                  style={{ color: 'var(--armora-gold)' }}
                >
                  {matchScore}% Match
                </span>
              </div>

              {/* Assignment Type */}
              <p
                className="text-xs font-semibold uppercase mb-xs"
                style={{
                  color: 'var(--armora-text-secondary)',
                  letterSpacing: '0.5px',
                  margin: 0,
                  marginBottom: 'var(--armora-space-xs)',
                }}
              >
                {job.assignment_type.replace('_', ' ')}
              </p>

              {/* Principal Name */}
              <h4
                className="font-display mb-sm"
                style={{
                  margin: 0,
                  marginBottom: 'var(--armora-space-sm)',
                }}
              >
                {job.principal_name}
              </h4>

              {/* Location */}
              <div className="flex items-start gap-sm mb-md">
                <FaMapMarkerAlt color="var(--armora-danger)" size={14} style={{ marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <p className="text-sm" style={{ margin: 0 }}>
                    {job.pickup_location}
                  </p>
                  <p className="text-xs text-secondary" style={{ margin: 0, marginTop: '2px' }}>
                    {distance} away
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 'var(--armora-space-sm)',
                  marginBottom: 'var(--armora-space-md)',
                }}
              >
                <div>
                  <p className="text-xs text-secondary" style={{ margin: 0, marginBottom: '2px' }}>
                    Rate
                  </p>
                  <div className="flex items-center gap-xs">
                    <FaPoundSign color="var(--armora-success)" size={12} />
                    <span className="text-sm font-bold" style={{ color: 'var(--armora-success)' }}>
                      {job.base_rate}/hr
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-secondary" style={{ margin: 0, marginBottom: '2px' }}>
                    Duration
                  </p>
                  <div className="flex items-center gap-xs">
                    <FaClock color="var(--armora-text-secondary)" size={12} />
                    <span className="text-sm font-semibold">
                      {job.estimated_duration_hours}h
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-secondary" style={{ margin: 0, marginBottom: '2px' }}>
                    Threat
                  </p>
                  <span className={`badge badge-threat-${job.threat_level}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                    {job.threat_level.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Date/Time */}
              <p className="text-xs text-secondary mb-md" style={{ margin: 0, marginBottom: 'var(--armora-space-md)' }}>
                {format(new Date(job.scheduled_start_time), 'PPp')}
              </p>

              {/* Quick Accept Button */}
              <button
                className="btn btn-gold btn-full"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAccept) {
                    onAccept(job.id);
                  }
                }}
              >
                Quick Accept
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedJobs;
