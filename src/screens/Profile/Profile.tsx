import React, { useEffect, useState } from 'react';
import { supabase, ProtectionOfficer } from '../../lib/supabase';
import { format } from 'date-fns';
import '../../styles/global.css';

const Profile: React.FC = () => {
  const [cpo, setCpo] = useState<ProtectionOfficer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('protection_officers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) setCpo(data);
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!cpo) return null;

  return (
    <div className="safe-top safe-bottom" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-secondary)', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: 'var(--spacing-lg)', textAlign: 'center' }}>
        <div style={{
          width: 100,
          height: 100,
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          margin: '0 auto var(--spacing-md)'
        }}>
          {cpo.profile_photo_url ? (
            <img src={cpo.profile_photo_url} alt={cpo.first_name} style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-full)', objectFit: 'cover' }} />
          ) : (
            '👤'
          )}
        </div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-xs)' }}>
          {cpo.first_name} {cpo.last_name}
        </h1>
        <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>
          Close Protection Officer
        </p>
      </div>

      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
              Rating
            </p>
            <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-success)' }}>
              {cpo.rating ? `${cpo.rating.toFixed(1)} ⭐` : 'N/A'}
            </p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
              Total Assignments
            </p>
            <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-primary)' }}>
              {cpo.total_assignments || 0}
            </p>
          </div>
        </div>

        {/* Verification Status */}
        <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Verification Status</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Account Status</span>
            <span className={`badge badge-${cpo.verification_status === 'verified' ? 'success' : cpo.verification_status === 'pending' ? 'warning' : 'danger'}`}>
              {cpo.verification_status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* SIA License Info */}
        <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>SIA License Information</h3>
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>License Number</p>
            <p style={{ fontWeight: 600 }}>{cpo.sia_license_number}</p>
          </div>
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>License Type</p>
            <p style={{ fontWeight: 600, textTransform: 'uppercase' }}>{cpo.sia_license_type}</p>
          </div>
          <div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Expiry Date</p>
            <p style={{ fontWeight: 600 }}>
              {format(new Date(cpo.sia_license_expiry), 'PPP')}
              {new Date(cpo.sia_license_expiry) < new Date() && (
                <span style={{ color: 'var(--color-danger)', marginLeft: 'var(--spacing-sm)' }}>⚠️ EXPIRED</span>
              )}
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Contact Information</h3>
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Email</p>
            <p style={{ fontWeight: 600 }}>{cpo.email}</p>
          </div>
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Phone</p>
            <p style={{ fontWeight: 600 }}>{cpo.phone}</p>
          </div>
          <div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Address</p>
            <p style={{ fontWeight: 600 }}>
              {cpo.address_line1}<br />
              {cpo.address_line2 && <>{cpo.address_line2}<br /></>}
              {cpo.city}, {cpo.postcode}<br />
              {cpo.country}
            </p>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Emergency Contact</h3>
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Name</p>
            <p style={{ fontWeight: 600 }}>{cpo.emergency_contact_name}</p>
          </div>
          <div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Phone</p>
            <p style={{ fontWeight: 600 }}>{cpo.emergency_contact_phone}</p>
          </div>
        </div>

        {/* Vehicle Information */}
        {cpo.vehicle_make && (
          <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>🚗 Vehicle Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Make & Model</p>
                <p style={{ fontWeight: 600 }}>{cpo.vehicle_make} {cpo.vehicle_model}</p>
              </div>
              <div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Color</p>
                <p style={{ fontWeight: 600 }}>{cpo.vehicle_color}</p>
              </div>
            </div>
            {cpo.vehicle_registration && (
              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Registration</p>
                <p style={{ fontWeight: 600 }}>{cpo.vehicle_registration}</p>
              </div>
            )}
          </div>
        )}

        {/* Right to Work */}
        <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Right to Work</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Status</span>
            <span className="badge badge-success">{cpo.right_to_work_status.toUpperCase()}</span>
          </div>
        </div>

        {/* Account Info */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Account Information</h3>
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Member Since</p>
            <p style={{ fontWeight: 600 }}>{format(new Date(cpo.created_at), 'PPP')}</p>
          </div>
          <div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Last Updated</p>
            <p style={{ fontWeight: 600 }}>{format(new Date(cpo.updated_at), 'PPP')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
