import React, { useEffect, useState } from 'react';
import { supabase, ProtectionAssignment } from '../../lib/supabase';
import { format } from 'date-fns';
import '../../styles/global.css';
import DevPanel from '../../components/dev/DevPanel';

const JobHistory: React.FC = () => {
  const [assignments, setAssignments] = useState<ProtectionAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobHistory();
  }, []);

  const loadJobHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get CPO profile
      const { data: cpoData } = await supabase
        .from('protection_officers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!cpoData) return;

      // Get completed assignments
      const { data } = await supabase
        .from('protection_assignments')
        .select('*')
        .eq('cpo_id', cpoData.id)
        .eq('status', 'completed')
        .order('actual_end_time', { ascending: false });

      if (data) setAssignments(data);
    } catch (err) {
      console.error('Error loading job history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="spinner"><DevPanel />
</div>
      </div>
    );
  }

  return (
    <div className="safe-top safe-bottom" style={{ minHeight: '100vh', backgroundColor: 'var(--armora-bg-secondary)', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--armora-navy)', color: 'white', padding: 'var(--armora-space-lg)' }}>
        <h1 style={{ fontSize: 'var(--armora-text-2xl)' }}>Assignment History</h1>
        <p style={{ fontSize: 'var(--armora-text-sm)', opacity: 0.9, marginTop: 'var(--armora-space-xs)' }}>
          {assignments.length} completed assignment{assignments.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="container" style={{ paddingTop: 'var(--armora-space-lg)' }}>
        {assignments.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--armora-space-xl)' }}>
            <div style={{ fontSize: '48px', marginBottom: 'var(--armora-space-md)' }}>📋</div>
            <h3 style={{ marginBottom: 'var(--armora-space-sm)' }}>No Assignment History</h3>
            <p style={{ color: 'var(--armora-text-secondary)' }}>
              Complete your first assignment to see it here
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--armora-space-md)' }}>
            {assignments.map((assignment) => {
              const startTime = assignment.actual_start_time ? new Date(assignment.actual_start_time) : null;
              const endTime = assignment.actual_end_time ? new Date(assignment.actual_end_time) : null;
              const durationHours = startTime && endTime
                ? ((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)).toFixed(1)
                : null;
              const earnings = durationHours ? (parseFloat(durationHours) * assignment.base_rate).toFixed(2) : null;

              return (
                <div key={assignment.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--armora-space-md)' }}>
                    <div>
                      <h3 style={{ marginBottom: 'var(--armora-space-xs)' }}>
                        {assignment.assignment_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </h3>
                      <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>
                        {endTime ? format(endTime, 'PPP') : 'N/A'}
                      </p>
                    </div>
                    <span className="badge badge-success">COMPLETED</span>
                  </div>

                  <div style={{ marginBottom: 'var(--armora-space-md)' }}>
                    <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>Principal</p>
                    <p style={{ fontWeight: 600 }}>{assignment.principal_name}</p>
                  </div>

                  <div style={{ marginBottom: 'var(--armora-space-md)' }}>
                    <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>Location</p>
                    <p>{assignment.pickup_location}</p>
                    {assignment.dropoff_location && (
                      <p style={{ fontSize: 'var(--armora-text-sm)', marginTop: 'var(--armora-space-xs)' }}>
                        → {assignment.dropoff_location}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--armora-space-md)', marginBottom: 'var(--armora-space-md)' }}>
                    <div>
                      <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>Duration</p>
                      <p style={{ fontWeight: 600 }}>{durationHours || 'N/A'}h</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>Rate</p>
                      <p style={{ fontWeight: 600 }}>£{assignment.base_rate}/hr</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>Earned</p>
                      <p style={{ fontWeight: 600, color: 'var(--armora-success)' }}>
                        £{earnings || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--armora-space-sm)', flexWrap: 'wrap' }}>
                    <span className={`badge badge-threat-${assignment.threat_level}`}>
                      {assignment.threat_level.toUpperCase()}
                    </span>
                    {assignment.vehicle_required && (
                      <span className="badge badge-info">🚗 Vehicle</span>
                    )}
                    {assignment.armed_protection_required && (
                      <span className="badge badge-danger">🔫 Armed</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobHistory;
