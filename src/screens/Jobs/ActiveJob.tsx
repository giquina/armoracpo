import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, ProtectionAssignment } from '../../lib/supabase';
import { format } from 'date-fns';
import '../../styles/global.css';

const ActiveJob: React.FC = () => {
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<ProtectionAssignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveAssignment();
  }, []);

  const loadActiveAssignment = async () => {
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

      // Get active assignment
      const { data } = await supabase
        .from('protection_assignments')
        .select('*')
        .eq('cpo_id', cpoData.id)
        .in('status', ['assigned', 'en_route', 'active'])
        .order('scheduled_start_time', { ascending: true })
        .limit(1)
        .single();

      if (data) setAssignment(data);
    } catch (err) {
      console.error('Error loading active assignment:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: 'en_route' | 'active' | 'completed') => {
    if (!assignment) return;

    try {
      const updates: any = { status: newStatus };

      if (newStatus === 'active' && !assignment.actual_start_time) {
        updates.actual_start_time = new Date().toISOString();
      }

      if (newStatus === 'completed') {
        updates.actual_end_time = new Date().toISOString();
      }

      const { error } = await supabase
        .from('protection_assignments')
        .update(updates)
        .eq('id', assignment.id);

      if (!error) {
        setAssignment({ ...assignment, ...updates });
        if (newStatus === 'completed') {
          alert('Assignment completed successfully!');
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="safe-top safe-bottom" style={{ minHeight: '100vh', backgroundColor: 'var(--armora-bg-secondary)', paddingBottom: '80px' }}>
        <div style={{ backgroundColor: 'var(--armora-navy)', color: 'white', padding: 'var(--armora-space-lg)' }}>
          <h1 style={{ fontSize: 'var(--armora-text-2xl)' }}>Active Assignment</h1>
        </div>
        <div className="container" style={{ paddingTop: 'var(--armora-space-lg)' }}>
          <div className="card" style={{ textAlign: 'center', padding: 'var(--armora-space-xl)' }}>
            <div style={{ fontSize: '48px', marginBottom: 'var(--armora-space-md)' }}>🛡️</div>
            <h3 style={{ marginBottom: 'var(--armora-space-sm)' }}>No Active Assignment</h3>
            <p style={{ color: 'var(--armora-text-secondary)' }}>
              You don't have any active assignments at the moment
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="safe-top safe-bottom" style={{ minHeight: '100vh', backgroundColor: 'var(--armora-bg-secondary)', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--armora-navy)', color: 'white', padding: 'var(--armora-space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--armora-space-sm)' }}>
          <h1 style={{ fontSize: 'var(--armora-text-2xl)' }}>Active Assignment</h1>
          <span className={`badge badge-${assignment.status === 'active' ? 'success' : 'warning'}`}>
            {assignment.status.toUpperCase()}
          </span>
        </div>
        <p style={{ fontSize: 'var(--armora-text-sm)', opacity: 0.9 }}>
          {assignment.assignment_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </p>
      </div>

      <div className="container" style={{ paddingTop: 'var(--armora-space-lg)' }}>
        {/* Principal Info */}
        <div className="card" style={{ marginBottom: 'var(--armora-space-md)' }}>
          <h3 style={{ marginBottom: 'var(--armora-space-md)' }}>Principal Information</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--armora-space-md)', marginBottom: 'var(--armora-space-md)' }}>
            {assignment.principal_photo_url ? (
              <img
                src={assignment.principal_photo_url}
                alt={assignment.principal_name}
                style={{ width: 60, height: 60, borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: 60,
                height: 60,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--armora-bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--armora-text-2xl)'
              }}>
                👤
              </div>
            )}
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 'var(--armora-text-lg)', marginBottom: 'var(--armora-space-xs)' }}>
                {assignment.principal_name}
              </p>
              <a href={`tel:${assignment.principal_phone}`} style={{ color: 'var(--armora-info)', textDecoration: 'none' }}>
                📞 {assignment.principal_phone}
              </a>
            </div>
          </div>
          <span className={`badge badge-threat-${assignment.threat_level}`}>
            Threat Level: {assignment.threat_level.toUpperCase()}
          </span>
        </div>

        {/* Location Details */}
        <div className="card" style={{ marginBottom: 'var(--armora-space-md)' }}>
          <h3 style={{ marginBottom: 'var(--armora-space-md)' }}>Location Details</h3>
          <div style={{ marginBottom: 'var(--armora-space-md)' }}>
            <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)', marginBottom: 'var(--armora-space-xs)' }}>
              Pickup Location
            </p>
            <p style={{ fontWeight: 600 }}>{assignment.pickup_location}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${assignment.pickup_latitude},${assignment.pickup_longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ marginTop: 'var(--armora-space-sm)', fontSize: 'var(--armora-text-sm)' }}
            >
              📍 Open in Maps
            </a>
          </div>
          {assignment.dropoff_location && (
            <div>
              <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)', marginBottom: 'var(--armora-space-xs)' }}>
                Dropoff Location
              </p>
              <p style={{ fontWeight: 600 }}>{assignment.dropoff_location}</p>
            </div>
          )}
        </div>

        {/* Time & Duration */}
        <div className="card" style={{ marginBottom: 'var(--armora-space-md)' }}>
          <h3 style={{ marginBottom: 'var(--armora-space-md)' }}>Schedule</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--armora-space-md)' }}>
            <div>
              <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>Start Time</p>
              <p style={{ fontWeight: 600 }}>{format(new Date(assignment.scheduled_start_time), 'PPp')}</p>
            </div>
            {assignment.scheduled_end_time && (
              <div>
                <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>End Time</p>
                <p style={{ fontWeight: 600 }}>{format(new Date(assignment.scheduled_end_time), 'PPp')}</p>
              </div>
            )}
          </div>
          {assignment.estimated_duration_hours && (
            <div style={{ marginTop: 'var(--armora-space-md)' }}>
              <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>Estimated Duration</p>
              <p style={{ fontWeight: 600 }}>{assignment.estimated_duration_hours} hours</p>
            </div>
          )}
        </div>

        {/* Special Instructions */}
        {assignment.special_instructions && (
          <div className="card" style={{ marginBottom: 'var(--armora-space-md)', backgroundColor: '#fef3c7' }}>
            <h3 style={{ marginBottom: 'var(--armora-space-md)' }}>⚠️ Special Instructions</h3>
            <p>{assignment.special_instructions}</p>
          </div>
        )}

        {/* Assignment Requirements */}
        <div className="card" style={{ marginBottom: 'var(--armora-space-md)' }}>
          <h3 style={{ marginBottom: 'var(--armora-space-md)' }}>Requirements</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--armora-space-sm)' }}>
            {assignment.vehicle_required && <span className="badge badge-info">🚗 Vehicle Required</span>}
            {assignment.armed_protection_required && <span className="badge badge-danger">🔫 Armed Protection</span>}
            {assignment.required_certifications && assignment.required_certifications.map((cert: string) => (
              <span key={cert} className="badge badge-secondary">{cert}</span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--armora-space-md)' }}>Actions</h3>
          {assignment.status === 'assigned' && (
            <button
              onClick={() => updateStatus('en_route')}
              className="btn btn-primary btn-full"
            >
              🚗 En Route to Pickup
            </button>
          )}
          {assignment.status === 'en_route' && (
            <button
              onClick={() => updateStatus('active')}
              className="btn btn-success btn-full"
            >
              ✅ Start Assignment
            </button>
          )}
          {assignment.status === 'active' && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to complete this assignment?')) {
                  updateStatus('completed');
                }
              }}
              className="btn btn-success btn-full"
            >
              ✅ Complete Assignment
            </button>
          )}
          <button
            className="btn btn-secondary btn-full"
            style={{ marginTop: 'var(--armora-space-sm)' }}
            onClick={() => window.location.href = `tel:${assignment.principal_phone}`}
          >
            📞 Call Principal
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveJob;
