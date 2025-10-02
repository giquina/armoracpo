import React, { useEffect, useState } from 'react';
import { supabase, ProtectionAssignment } from '../../lib/supabase';
import { format } from 'date-fns';
import '../../styles/global.css';

const AvailableJobs: React.FC = () => {
  const [assignments, setAssignments] = useState<ProtectionAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'close_protection' | 'event_security' | 'residential_security'>('all');

  useEffect(() => {
    loadAvailableAssignments();
  }, [filter]);

  const loadAvailableAssignments = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('protection_assignments')
        .select('*')
        .eq('status', 'pending')
        .is('cpo_id', null)
        .order('scheduled_start_time', { ascending: true });

      if (filter !== 'all') {
        query = query.eq('assignment_type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAssignments(data || []);
    } catch (err) {
      console.error('Error loading assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const acceptAssignment = async (assignmentId: string) => {
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

      // Accept assignment
      const { error } = await supabase
        .from('protection_assignments')
        .update({
          cpo_id: cpoData.id,
          status: 'assigned'
        })
        .eq('id', assignmentId);

      if (!error) {
        // Reload assignments
        loadAvailableAssignments();
        alert('Assignment accepted! View it in your active assignments.');
      }
    } catch (err) {
      console.error('Error accepting assignment:', err);
      alert('Failed to accept assignment. Please try again.');
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
        <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>Available Assignments</h1>
        <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9, marginTop: 'var(--spacing-xs)' }}>
          {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Filters */}
      <div className="container" style={{ paddingTop: 'var(--spacing-md)', paddingBottom: 'var(--spacing-md)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', overflowX: 'auto', paddingBottom: 'var(--spacing-xs)' }}>
          <button
            onClick={() => setFilter('all')}
            className="btn"
            style={{
              backgroundColor: filter === 'all' ? 'var(--color-primary)' : 'var(--color-bg-primary)',
              color: filter === 'all' ? 'white' : 'var(--color-text-primary)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              whiteSpace: 'nowrap',
              fontSize: 'var(--font-size-sm)'
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilter('close_protection')}
            className="btn"
            style={{
              backgroundColor: filter === 'close_protection' ? 'var(--color-primary)' : 'var(--color-bg-primary)',
              color: filter === 'close_protection' ? 'white' : 'var(--color-text-primary)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              whiteSpace: 'nowrap',
              fontSize: 'var(--font-size-sm)'
            }}
          >
            Close Protection
          </button>
          <button
            onClick={() => setFilter('event_security')}
            className="btn"
            style={{
              backgroundColor: filter === 'event_security' ? 'var(--color-primary)' : 'var(--color-bg-primary)',
              color: filter === 'event_security' ? 'white' : 'var(--color-text-primary)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              whiteSpace: 'nowrap',
              fontSize: 'var(--font-size-sm)'
            }}
          >
            Event Security
          </button>
          <button
            onClick={() => setFilter('residential_security')}
            className="btn"
            style={{
              backgroundColor: filter === 'residential_security' ? 'var(--color-primary)' : 'var(--color-bg-primary)',
              color: filter === 'residential_security' ? 'white' : 'var(--color-text-primary)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              whiteSpace: 'nowrap',
              fontSize: 'var(--font-size-sm)'
            }}
          >
            Residential
          </button>
        </div>
      </div>

      {/* Assignments List */}
      <div className="container">
        {assignments.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>📭</div>
            <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>No Assignments Available</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Check back soon for new opportunities
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {assignments.map((assignment) => (
              <div key={assignment.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                      {assignment.assignment_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </h3>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                      {format(new Date(assignment.scheduled_start_time), 'PPp')}
                    </p>
                  </div>
                  <span className={`badge badge-threat-${assignment.threat_level}`}>
                    {assignment.threat_level.toUpperCase()}
                  </span>
                </div>

                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Principal</p>
                  <p style={{ fontWeight: 600 }}>{assignment.principal_name}</p>
                </div>

                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Location</p>
                  <p>{assignment.pickup_location}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                  <div>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Duration</p>
                    <p style={{ fontWeight: 600 }}>{assignment.estimated_duration_hours}h</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Rate</p>
                    <p style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                      £{assignment.base_rate}/hr
                    </p>
                  </div>
                </div>

                {assignment.special_instructions && (
                  <div style={{
                    padding: 'var(--spacing-md)',
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--spacing-md)'
                  }}>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                      Special Instructions
                    </p>
                    <p style={{ fontSize: 'var(--font-size-sm)' }}>{assignment.special_instructions}</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  {assignment.vehicle_required && (
                    <span className="badge badge-info">🚗 Vehicle Required</span>
                  )}
                  {assignment.armed_protection_required && (
                    <span className="badge badge-danger">🔫 Armed</span>
                  )}
                </div>

                <button
                  onClick={() => acceptAssignment(assignment.id)}
                  className="btn btn-success btn-full"
                  style={{ marginTop: 'var(--spacing-md)' }}
                >
                  Accept Assignment
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableJobs;
