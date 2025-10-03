import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { requestNotificationPermission } from '../../lib/firebase';
import '../../styles/global.css';

// DevPanel for quick navigation during development
const DevPanel: React.FC = () => {
  const navigate = useNavigate();
  console.log('🚀 DevPanel component loaded - v1.0');
  const [isOpen, setIsOpen] = useState(false);

  const screens = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Available Jobs', path: '/jobs', icon: '📋' },
    { name: 'Active Job', path: '/active', icon: '🚨' },
    { name: 'Job History', path: '/history', icon: '📜' },
    { name: 'Messages', path: '/messages', icon: '💬' },
    { name: 'Incidents', path: '/incidents', icon: '🚨' },
    { name: 'Profile', path: '/profile', icon: '👤' },
    { name: 'Earnings', path: '/earnings', icon: '💰' },
    { name: 'Compliance', path: '/compliance', icon: '✅' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <>
      {/* Toggle Button - Always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          backgroundColor: 'var(--armora-gold)',
          color: 'var(--armora-navy)',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 20px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '14px',
          zIndex: 10000,
          boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)',
        }}
      >
        {isOpen ? '▼' : '▲'} DEV PANEL
      </button>

      {/* Dev Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--armora-navy)',
          borderTop: '4px solid var(--armora-gold)',
          boxShadow: '0 -4px 20px rgba(255, 215, 0, 0.3)',
          zIndex: 9999,
          maxHeight: '450px',
          overflowY: 'auto',
          animation: 'slideUp 0.3s ease',
        }}>
          {/* Screen Grid */}
          <div style={{ padding: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '1px solid rgba(255, 215, 0, 0.2)'
            }}>
              <h3 style={{
                color: 'var(--armora-gold)',
                fontSize: '16px',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.5px',
                margin: 0
              }}>
                🚀 Quick Navigation (Dev Mode)
              </h3>
              <div style={{
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                color: 'var(--armora-gold)',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
                border: '1px solid rgba(255, 215, 0, 0.3)'
              }}>
                DEVELOPMENT
              </div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '14px',
            }}>
              {screens.map((screen) => (
                <button
                  key={screen.path}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Navigating to:', screen.path);
                    sessionStorage.setItem('devMode', 'true'); // Enable dev mode bypass
                    navigate(screen.path);
                    setIsOpen(false);
                  }}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--armora-light)',
                    border: '2px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: '12px',
                    padding: '16px 12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    pointerEvents: 'auto',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--armora-gold)';
                    e.currentTarget.style.color = 'var(--armora-navy)';
                    e.currentTarget.style.borderColor = 'var(--armora-gold)';
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 215, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = 'var(--armora-light)';
                    e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{screen.icon}</span>
                  <span>{screen.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('No user returned from authentication');
      }

      // Get CPO profile
      const { data: cpoData, error: cpoError } = await supabase
        .from('protection_officers')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (cpoError) throw cpoError;

      // Check if CPO is verified
      if (cpoData.verification_status !== 'verified') {
        setError('Your account is pending verification. Please contact support.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Request notification permission and save FCM token
      await requestNotificationPermission(authData.user.id);

      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col" style={{ minHeight: '100vh', backgroundColor: 'var(--armora-bg-secondary)' }}>
        {/* Header */}
        <div className="safe-top" style={{ padding: 'var(--armora-space-2xl)', textAlign: 'center', background: 'var(--armora-navy)', color: 'var(--armora-text-inverse)' }}>
          <h1 style={{ fontSize: 'var(--armora-text-4xl)', fontWeight: 'var(--armora-weight-extrabold)', marginBottom: 'var(--armora-space-sm)' }}>
            🛡️ ArmoraCPO
          </h1>
          <p style={{ fontSize: 'var(--armora-text-base)' }}>
            Professional Close Protection Officer Platform
          </p>
        </div>

        {/* Login Form */}
        <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 'var(--armora-space-2xl)', padding: 'var(--armora-space-md)' }}>
          <div className="card" style={{ marginBottom: 'var(--armora-space-lg)', padding: 'var(--armora-space-xl)' }}>
            <h2 style={{ marginBottom: 'var(--armora-space-md)', fontWeight: 'var(--armora-weight-bold)' }}>Sign In</h2>

            {error && (
              <div style={{
                padding: 'var(--armora-space-md)',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                borderRadius: 'var(--armora-radius-md)',
                marginBottom: 'var(--armora-space-md)',
                fontSize: 'var(--armora-text-sm)',
                fontWeight: 'var(--armora-weight-medium)',
                border: '1px solid #fca5a5'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 'var(--armora-space-md)' }}>
                <label htmlFor="email" style={{ display: 'block', marginBottom: 'var(--armora-space-sm)', fontWeight: 'var(--armora-weight-medium)' }}>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  disabled={loading}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: 'var(--armora-space-lg)' }}>
                <label htmlFor="password" style={{ display: 'block', marginBottom: 'var(--armora-space-sm)', fontWeight: 'var(--armora-weight-medium)' }}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  style={{ width: '100%' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--armora-space-sm)' }}>
                    <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Signup Link */}
            <div style={{ marginTop: 'var(--armora-space-lg)', textAlign: 'center' }}>
              <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/signup')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--armora-navy)',
                    fontSize: 'var(--armora-text-sm)',
                    fontWeight: 'var(--armora-weight-semibold)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                    minHeight: 'auto'
                  }}
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>

          {/* SIA License Info */}
          <div className="card" style={{
            textAlign: 'center',
            backgroundColor: 'var(--armora-bg-navy)',
            color: 'var(--armora-text-inverse)',
            border: '2px solid var(--armora-gold)'
          }}>
            <p style={{ fontSize: 'var(--armora-text-base)', marginBottom: 'var(--armora-space-xs)' }}>
              <strong>SIA Licensed Professionals Only</strong>
            </p>
            <p style={{ fontSize: 'var(--armora-text-sm)', marginTop: 'var(--armora-space-sm)', opacity: 0.9 }}>
              All Close Protection Officers must hold a valid SIA license. Your account will be verified before activation.
            </p>
          </div>
        </div>
      </div>

      {/* Dev Panel for quick navigation */}
      <DevPanel />
    </>
  );
};

export default Login;
