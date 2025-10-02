import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, ProtectionOfficer } from '../../lib/supabase';
import '../../styles/global.css';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [cpo, setCpo] = useState<ProtectionOfficer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
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
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await supabase.auth.signOut();
      navigate('/', { replace: true });
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
      <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: 'var(--spacing-lg)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>Settings</h1>
        <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9, marginTop: 'var(--spacing-xs)' }}>
          Manage your account and preferences
        </p>
      </div>

      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        {/* Account Section */}
        <h3 style={{ marginBottom: 'var(--spacing-md)', paddingLeft: 'var(--spacing-xs)' }}>
          Account
        </h3>

        <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)', paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border-light)' }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--font-size-2xl)'
            }}>
              {cpo.profile_photo_url ? (
                <img src={cpo.profile_photo_url} alt={cpo.first_name} style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-full)', objectFit: 'cover' }} />
              ) : (
                '👤'
              )}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
                {cpo.first_name} {cpo.last_name}
              </p>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                {cpo.email}
              </p>
            </div>
          </div>

          <button className="btn btn-secondary btn-full" style={{ justifyContent: 'flex-start' }}>
            ✏️ Edit Profile
          </button>
        </div>

        {/* Preferences Section */}
        <h3 style={{ marginBottom: 'var(--spacing-md)', paddingLeft: 'var(--spacing-xs)' }}>
          Preferences
        </h3>

        <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
          <div style={{ marginBottom: 'var(--spacing-md)', paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>Push Notifications</p>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  Get notified about new assignments
                </p>
              </div>
              <div style={{
                width: 50,
                height: 28,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-success)',
                position: 'relative',
                cursor: 'pointer'
              }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'white',
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  transition: 'all 0.2s'
                }}></div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 'var(--spacing-md)', paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>Email Notifications</p>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  Receive email updates
                </p>
              </div>
              <div style={{
                width: 50,
                height: 28,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-success)',
                position: 'relative',
                cursor: 'pointer'
              }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'white',
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  transition: 'all 0.2s'
                }}></div>
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>SMS Notifications</p>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  Receive text messages for urgent updates
                </p>
              </div>
              <div style={{
                width: 50,
                height: 28,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-bg-tertiary)',
                position: 'relative',
                cursor: 'pointer'
              }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'white',
                  position: 'absolute',
                  top: 2,
                  left: 2,
                  transition: 'all 0.2s'
                }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <h3 style={{ marginBottom: 'var(--spacing-md)', paddingLeft: 'var(--spacing-xs)' }}>
          Documents & Compliance
        </h3>

        <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
          <button className="btn btn-secondary btn-full" style={{ justifyContent: 'flex-start', marginBottom: 'var(--spacing-sm)' }}>
            🛡️ Update SIA License
          </button>
          <button className="btn btn-secondary btn-full" style={{ justifyContent: 'flex-start', marginBottom: 'var(--spacing-sm)' }}>
            📋 Update Right to Work
          </button>
          <button className="btn btn-secondary btn-full" style={{ justifyContent: 'flex-start', marginBottom: 'var(--spacing-sm)' }}>
            🏦 Update Bank Details
          </button>
          <button className="btn btn-secondary btn-full" style={{ justifyContent: 'flex-start' }}>
            🚗 Update Vehicle Information
          </button>
        </div>

        {/* Support Section */}
        <h3 style={{ marginBottom: 'var(--spacing-md)', paddingLeft: 'var(--spacing-xs)' }}>
          Support
        </h3>

        <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
          <button className="btn btn-secondary btn-full" style={{ justifyContent: 'flex-start', marginBottom: 'var(--spacing-sm)' }}>
            📞 Contact Support
          </button>
          <button className="btn btn-secondary btn-full" style={{ justifyContent: 'flex-start', marginBottom: 'var(--spacing-sm)' }}>
            📖 Help Center
          </button>
          <button className="btn btn-secondary btn-full" style={{ justifyContent: 'flex-start', marginBottom: 'var(--spacing-sm)' }}>
            📜 Terms & Conditions
          </button>
          <button className="btn btn-secondary btn-full" style={{ justifyContent: 'flex-start' }}>
            🔒 Privacy Policy
          </button>
        </div>

        {/* App Info */}
        <div className="card" style={{ marginBottom: 'var(--spacing-md)', textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
            ArmoraCPO Version 1.0.0
          </p>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            © 2025 Armora. All rights reserved.
          </p>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="btn btn-danger btn-full"
        >
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
};

export default Settings;
