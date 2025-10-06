import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ProtectionOfficer, ProtectionAssignment } from '../../lib/supabase';
import { authService } from '../../services/authService';
import { assignmentService } from '../../services/assignmentService';
import WelcomeHeader from '../../components/dashboard/WelcomeHeader';
import AvailabilityToggle from '../../components/dashboard/AvailabilityToggle';
import OperationalStatusWidget, { OperationalStatus } from '../../components/dashboard/OperationalStatusWidget';
import EarningsSummary from '../../components/dashboard/EarningsSummary';
import QuickStatsWidget from '../../components/dashboard/QuickStatsWidget';
import ActiveAssignmentCard from '../../components/dashboard/ActiveAssignmentCard';
import RecommendedJobs from '../../components/dashboard/RecommendedJobs';
import PerformanceInsights from '../../components/dashboard/PerformanceInsights';
import RecentIncidentsWidget from '../../components/dashboard/RecentIncidentsWidget';
import '../../styles/global.css';

const Dashboard: React.FC = () => {
  const [cpo, setCpo] = useState<ProtectionOfficer | null>(null);
  const [activeAssignment, setActiveAssignment] = useState<ProtectionAssignment | null>(null);
  const [operationalStatus, setOperationalStatus] = useState<OperationalStatus>('standdown');
  const [lastStatusChange, setLastStatusChange] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user and CPO profile
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        setError('Unable to load user profile');
        return;
      }

      setCpo(currentUser.cpo);

      // Get active assignment
      const active = await assignmentService.getActiveAssignment(currentUser.cpo.id);
      setActiveAssignment(active);

      // Set operational status based on assignment
      if (active) {
        setOperationalStatus('busy');
      } else if (currentUser.cpo.is_available) {
        setOperationalStatus('operational');
      } else {
        setOperationalStatus('standdown');
      }
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!cpo) return;

    try {
      const updatedCpo = await authService.updateAvailability(cpo.id, !cpo.is_available);
      setCpo(updatedCpo);

      // Update operational status when availability changes
      if (!activeAssignment) {
        setOperationalStatus(updatedCpo.is_available ? 'operational' : 'standdown');
      }
    } catch (err: any) {
      console.error('Error updating availability:', err);
      alert('Failed to update availability. Please try again.');
    }
  };

  const handleStatusChange = async (newStatus: OperationalStatus) => {
    if (!cpo || activeAssignment) return; // Don't allow status change if on assignment

    try {
      // Update availability based on status
      const shouldBeAvailable = newStatus === 'operational';
      if (cpo.is_available !== shouldBeAvailable) {
        const updatedCpo = await authService.updateAvailability(cpo.id, shouldBeAvailable);
        setCpo(updatedCpo);
      }
      setOperationalStatus(newStatus);
      setLastStatusChange(new Date());

      // TODO: Persist status change timestamp to Supabase cpo_profiles table
      // This would enable real-time sync across devices
    } catch (err: any) {
      console.error('Error updating operational status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleAcceptJob = async (assignmentId: string) => {
    if (!cpo) return;

    try {
      await assignmentService.acceptAssignment(assignmentId, cpo.id);
      // Reload dashboard to show new active assignment
      loadDashboardData();
      alert('Assignment accepted successfully!');
    } catch (err: any) {
      console.error('Error accepting assignment:', err);
      alert(err.message || 'Failed to accept assignment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div
        className="safe-top safe-bottom"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--armora-bg-secondary)',
        }}
      >
        <div className="spinner spinner-gold" />
      </div>
    );
  }

  if (error || !cpo) {
    return (
      <div
        className="safe-top safe-bottom"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--armora-bg-secondary)',
          padding: 'var(--armora-space-lg)',
        }}
      >
        <div className="card" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h3 className="mb-md">Unable to Load Dashboard</h3>
          <p className="text-sm text-secondary mb-lg">
            {error || 'Please try refreshing the page'}
          </p>
          <button className="btn btn-primary btn-full" onClick={loadDashboardData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="safe-top safe-bottom"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--armora-bg-secondary)',
        paddingBottom: '100px',
      }}
    >
      {/* Welcome Header */}
      <WelcomeHeader cpo={cpo} operationalStatus={operationalStatus} />

      {/* Main Content */}
      <div className="container" style={{ paddingTop: 'var(--armora-space-lg)' }}>
        {/* Operational Status Widget - Prominent Position */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: 'var(--armora-space-md)' }}
        >
          <OperationalStatusWidget
            currentStatus={operationalStatus}
            onStatusChange={handleStatusChange}
            hasActiveAssignment={!!activeAssignment}
            siaVerified={cpo.verification_status === 'verified'}
            lastStatusChange={lastStatusChange}
            assignmentContext={activeAssignment ? `Assignment: ${activeAssignment.job_title}` : undefined}
          />
        </motion.div>

        {/* Availability Toggle - Keep for backward compatibility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ marginBottom: 'var(--armora-space-md)' }}
        >
          <AvailabilityToggle
            isAvailable={cpo.is_available}
            onToggle={handleToggleAvailability}
          />
        </motion.div>

        {/* Earnings Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: 'var(--armora-space-md)' }}
        >
          <EarningsSummary cpoId={cpo.id} />
        </motion.div>

        {/* Quick Stats Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ marginBottom: 'var(--armora-space-md)' }}
        >
          <QuickStatsWidget cpo={cpo} />
        </motion.div>

        {/* Active Assignment Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ marginBottom: 'var(--armora-space-md)' }}
        >
          <ActiveAssignmentCard assignment={activeAssignment} />
        </motion.div>

        {/* Recommended Jobs - Only show if no active assignment */}
        {!activeAssignment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ marginBottom: 'var(--armora-space-md)' }}
          >
            <RecommendedJobs cpoId={cpo.id} onAccept={handleAcceptJob} />
          </motion.div>
        )}

        {/* Recent Incidents Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ marginBottom: 'var(--armora-space-md)' }}
        >
          <RecentIncidentsWidget cpoId={cpo.id} />
        </motion.div>

        {/* Performance Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <PerformanceInsights cpoId={cpo.id} />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
