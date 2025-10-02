import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, ProtectionOfficer, ProtectionAssignment } from '../../lib/supabase';
import '../../styles/global.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [cpo, setCpo] = useState<ProtectionOfficer | null>(null);
  const [activeAssignment, setActiveAssignment] = useState<ProtectionAssignment | null>(null);
  const [availableCount, setAvailableCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get CPO profile
      const { data: cpoData } = await supabase
        .from('protection_officers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (cpoData) setCpo(cpoData);

      // Get active assignment
      const { data: activeData } = await supabase
        .from('protection_assignments')
        .select('*')
        .eq('cpo_id', cpoData?.id)
        .in('status', ['assigned', 'en_route', 'active'])
        .order('scheduled_start_time', { ascending: true })
        .limit(1);

      if (activeData && activeData.length > 0) {
        setActiveAssignment(activeData[0]);
      }

      // Get available assignments count
      const { count } = await supabase
        .from('protection_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .is('cpo_id', null);

      setAvailableCount(count || 0);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    if (!cpo) return;

    try {
      const { error } = await supabase
        .from('protection_officers')
        .update({ is_available: !cpo.is_available })
        .eq('id', cpo.id);

      if (!error) {
        setCpo({ ...cpo, is_available: !cpo.is_available });
      }
    } catch (err) {
      console.error('Error updating availability:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="safe-top safe-bottom" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-secondary)', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: 'var(--spacing-lg)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-sm)' }}>
          Welcome Back, {cpo?.first_name}
        </h1>
        <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>
          SIA License: {cpo?.sia_license_number}
        </p>
      </div>

      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        {/* Availability Toggle */}
        <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
          <div className="flex justify-between items-center">
            <div>
              <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>Availability Status</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                {cpo?.is_available ? 'You are visible to clients' : 'You are not accepting assignments'}
              </p>
            </div>
            <button
              onClick={toggleAvailability}
              className="btn"
              style={{
                backgroundColor: cpo?.is_available ? 'var(--color-success)' : 'var(--color-text-secondary)',
                color: 'white',
                padding: 'var(--spacing-sm) var(--spacing-md)',
              }}
            >
              {cpo?.is_available ? 'Available' : 'Offline'}
            </button>
          </div>
        </div>

        {/* Active Assignment */}
        {activeAssignment ? (
          <div className="card" style={{ marginBottom: 'var(--spacing-md)', border: '2px solid var(--color-accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
              <h3>Active Assignment</h3>
              <span className={`badge badge-${activeAssignment.status === 'active' ? 'success' : 'warning'}`}>
                {activeAssignment.status.toUpperCase()}
              </span>
            </div>
            <div style={{ marginBottom: 'var(--spacing-sm)' }}>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Principal</p>
              <p style={{ fontWeight: 600 }}>{activeAssignment.principal_name}</p>
            </div>
            <div style={{ marginBottom: 'var(--spacing-sm)' }}>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Pickup Location</p>
              <p>{activeAssignment.pickup_location}</p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Type</p>
                <p style={{ textTransform: 'capitalize' }}>{activeAssignment.assignment_type.replace('_', ' ')}</p>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Threat Level</p>
                <span className={`badge badge-threat-${activeAssignment.threat_level}`}>
                  {activeAssignment.threat_level.toUpperCase()}
                </span>
              </div>
            </div>
            <button className="btn btn-primary btn-full">
              View Details
            </button>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: 'var(--spacing-md)', textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>🛡️</div>
            <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>No Active Assignment</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)' }}>
              Browse available assignments to get started
            </p>
            <button className="btn btn-primary">
              View Available Assignments ({availableCount})
            </button>
          </div>
        )}

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
              Total Assignments
            </p>
            <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-primary)' }}>
              {cpo?.total_assignments || 0}
            </p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
              Rating
            </p>
            <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-success)' }}>
              {cpo?.rating ? `${cpo.rating.toFixed(1)} ⭐` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => navigate('/messages')}
            >
              💬 Messages
            </button>
            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => navigate('/history')}
            >
              📋 View Assignment History
            </button>
            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => navigate('/earnings')}
            >
              💰 Check Earnings
            </button>
            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => navigate('/compliance')}
            >
              📜 Compliance Center
            </button>
            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => navigate('/settings')}
            >
              ⚙️ Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
