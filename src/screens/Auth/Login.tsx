import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { supabase } from '../../lib/supabase';
import { requestNotificationPermission } from '../../lib/firebase';
import './Login.css';
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Floating label states
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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

  const handleForgotPassword = () => {
    // Navigate to password reset page (to be implemented)
    navigate('/forgot-password');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <>
      <div className="login-container">
        {/* Compact Header */}
        <motion.div
          className="login-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="login-header__content">
            <h1 className="login-header__title">🛡️ ArmoraCPO</h1>
            <p className="login-header__subtitle">Professional Close Protection Officer Platform</p>
          </div>
        </motion.div>

        {/* Login Form */}
        <motion.div
          className="login-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="login-card" variants={itemVariants}>
            <h2 className="login-card__title">Sign In</h2>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  className="login-error"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLogin} className="login-form">
              {/* Email Field with Floating Label */}
              <motion.div className="login-input-group" variants={itemVariants}>
                <div className="login-floating-input">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    required
                    disabled={loading}
                    className="login-input"
                  />
                  <label
                    htmlFor="email"
                    className={`login-label ${emailFocused || email ? 'login-label--active' : ''}`}
                  >
                    Email Address
                  </label>
                </div>
              </motion.div>

              {/* Password Field with Floating Label and Toggle */}
              <motion.div className="login-input-group" variants={itemVariants}>
                <div className="login-floating-input login-floating-input--password">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    required
                    disabled={loading}
                    className="login-input"
                  />
                  <label
                    htmlFor="password"
                    className={`login-label ${passwordFocused || password ? 'login-label--active' : ''}`}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </motion.div>

              {/* Forgot Password Link */}
              <motion.div className="login-forgot" variants={itemVariants}>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="login-forgot__link"
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                className="login-submit"
                disabled={loading}
                variants={itemVariants}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="login-submit__loading">
                    <div className="login-spinner"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </motion.button>

              {/* Signup Link */}
              <motion.div className="login-signup-link" variants={itemVariants}>
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="login-signup-link__button"
                    disabled={loading}
                  >
                    Sign Up
                  </button>
                </p>
              </motion.div>
            </form>
          </motion.div>

          {/* SIA License Info */}
          <motion.div className="login-info-card" variants={itemVariants}>
            <p className="login-info-card__title">
              <strong>SIA Licensed Professionals Only</strong>
            </p>
            <p className="login-info-card__text">
              All Close Protection Officers must hold a valid SIA license. Your account will be verified before activation.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Dev Panel for quick navigation */}
      <DevPanel />
    </>
  );
};

export default Login;
