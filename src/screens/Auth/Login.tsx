import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { requestNotificationPermission } from '../../lib/firebase';
import '../../styles/global.css';

const Login: React.FC = () => {
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

      // Redirect to dashboard will be handled by route protection
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Header */}
      <div className="safe-top" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, marginBottom: 'var(--spacing-sm)' }}>
          🛡️ ArmoraCPO
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          Professional Close Protection Officer Platform
        </p>
      </div>

      {/* Login Form */}
      <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 'var(--spacing-2xl)' }}>
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Sign In</h2>

          {error && (
            <div style={{
              padding: 'var(--spacing-md)',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-md)',
              fontSize: 'var(--font-size-sm)'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 500 }}>
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

            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 500 }}>
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
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ position: 'relative' }}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
                  <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* SIA License Info */}
        <div style={{
          padding: 'var(--spacing-md)',
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            <strong>SIA Licensed Professionals Only</strong>
          </p>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-sm)' }}>
            All Close Protection Officers must hold a valid SIA license. Your account will be verified before activation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
